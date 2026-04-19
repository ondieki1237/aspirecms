import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { Task } from '@/server/models/Task';
import { getCurrentUser } from '@/server/auth';

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clientId = searchParams.get('clientId');

    let query: any = { counselorId: userId };
    if (clientId) {
      query.clientId = clientId;
    }

    const tasks = await Task.find(query).populate('clientId', 'name email');

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (error) {
    console.error('Get tasks error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { clientId, title, description, priority, status, dueDate } = await request.json();

    if (!clientId || !title) {
      return NextResponse.json(
        { error: 'Client ID and title are required' },
        { status: 400 }
      );
    }

    const task = new Task({
      counselorId: userId,
      clientId,
      title,
      description,
      priority,
      status,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    });

    await task.save();

    return NextResponse.json({ task }, { status: 201 });
  } catch (error) {
    console.error('Create task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const userId = await getCurrentUser();
    if (!userId) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    const { status, completedAt } = await request.json();

    const task = await Task.findOneAndUpdate(
      { _id: taskId, counselorId: userId },
      { status, ...(status === 'Completed' && { completedAt: new Date() }) },
      { new: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ task }, { status: 200 });
  } catch (error) {
    console.error('Update task error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
