import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { Action } from '@/server/models/Action';
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

    const actions = await Action.find(query).populate('clientId', 'name email');

    return NextResponse.json({ actions }, { status: 200 });
  } catch (error) {
    console.error('Get actions error:', error);
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

    const { clientId, actionType, description, duration, notes, outcome, nextSteps } = await request.json();

    if (!clientId || !actionType) {
      return NextResponse.json(
        { error: 'Client ID and action type are required' },
        { status: 400 }
      );
    }

    const action = new Action({
      counselorId: userId,
      clientId,
      actionType,
      description,
      duration,
      notes,
      outcome,
      nextSteps,
    });

    await action.save();

    return NextResponse.json({ action }, { status: 201 });
  } catch (error) {
    console.error('Create action error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
