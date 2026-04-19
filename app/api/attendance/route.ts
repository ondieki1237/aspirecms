import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { Attendance } from '@/server/models/Attendance';
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

    const attendance = await Attendance.find(query).populate('clientId', 'name email');

    return NextResponse.json({ attendance }, { status: 200 });
  } catch (error) {
    console.error('Get attendance error:', error);
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

    const { clientId, checkInTime, checkOutTime, status, notes, date } = await request.json();

    if (!clientId) {
      return NextResponse.json(
        { error: 'Client ID is required' },
        { status: 400 }
      );
    }

    const attendance = new Attendance({
      counselorId: userId,
      clientId,
      date: date ? new Date(date) : new Date(),
      checkInTime: checkInTime ? new Date(checkInTime) : undefined,
      checkOutTime: checkOutTime ? new Date(checkOutTime) : undefined,
      status,
      notes,
    });

    await attendance.save();

    return NextResponse.json({ attendance }, { status: 201 });
  } catch (error) {
    console.error('Create attendance error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
