import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/profile?email=user@example.com - Fetch user profile by email
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        walletAddress: true,
        bio: true,
        location: true,
        twitter: true,
        role: true,
        createdAt: true,
      },
    });

    // If user doesn't exist, create a new builder user
    if (!user) {
      user = await prisma.user.create({
        data: {
          email,
          role: 'builder',
        },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          bio: true,
          location: true,
          twitter: true,
          role: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, walletAddress, bio, location, twitter } = body;

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    let updatedUser;

    if (existingUser) {
      // Update existing user
      updatedUser = await prisma.user.update({
        where: { email },
        data: {
          name: name || null,
          walletAddress: walletAddress || null,
          bio: bio || null,
          location: location || null,
          twitter: twitter || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          bio: true,
          location: true,
          twitter: true,
          role: true,
          createdAt: true,
        },
      });
    } else {
      // Create new user if doesn't exist
      updatedUser = await prisma.user.create({
        data: {
          email,
          role: 'builder',
          name: name || null,
          walletAddress: walletAddress || null,
          bio: bio || null,
          location: location || null,
          twitter: twitter || null,
        },
        select: {
          id: true,
          email: true,
          name: true,
          walletAddress: true,
          bio: true,
          location: true,
          twitter: true,
          role: true,
          createdAt: true,
        },
      });
    }

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }
}
