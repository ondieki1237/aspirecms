import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { User } from '@/server/models/User';
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

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ user }, { status: 200 });
  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
