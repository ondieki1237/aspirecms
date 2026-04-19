import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { User } from '@/server/models/User';
import { generateToken, setTokenCookie } from '@/server/auth';

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const { name, email, password, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      );
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'counselor',
    });

    await user.save();

    const token = generateToken(user._id.toString());
    await setTokenCookie(token);

    return NextResponse.json(
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
