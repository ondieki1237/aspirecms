import { NextRequest, NextResponse } from 'next/server';
import { clearTokenCookie } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    await clearTokenCookie();

    return NextResponse.json(
      { message: 'Logged out successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
