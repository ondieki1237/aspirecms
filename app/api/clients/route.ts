import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/server/db';
import { Client } from '@/server/models/Client';
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

    const clients = await Client.find({ counselorId: userId });

    return NextResponse.json({ clients }, { status: 200 });
  } catch (error) {
    console.error('Get clients error:', error);
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

    const { name, email, phone, age, gender, status, description, issueCategory } = await request.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      );
    }

    const client = new Client({
      counselorId: userId,
      name,
      email,
      phone,
      age,
      gender,
      status,
      description,
      issueCategory,
    });

    await client.save();

    return NextResponse.json({ client }, { status: 201 });
  } catch (error) {
    console.error('Create client error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
