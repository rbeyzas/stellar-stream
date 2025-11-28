import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/applications - Get all applications (admin) or builder's applications
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const builderEmail = searchParams.get('builderEmail');

    const where = builderEmail
      ? {
          builder: {
            email: builderEmail,
          },
        }
      : {};

    const applications = await prisma.application.findMany({
      where,
      include: {
        task: {
          include: {
            kpis: true,
          },
        },
        builder: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 });
  }
}

// POST /api/applications - Create new application
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { taskId, builderEmail, coverLetter } = body;

    if (!taskId || !builderEmail || !coverLetter) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Upsert builder
    const builder = await prisma.user.upsert({
      where: { email: builderEmail },
      update: {},
      create: {
        email: builderEmail,
        role: builderEmail.includes('admin') ? 'admin' : 'builder',
      },
    });

    // Check if already applied
    const existing = await prisma.application.findUnique({
      where: {
        taskId_builderId: {
          taskId,
          builderId: builder.id,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'You have already applied to this task' }, { status: 400 });
    }

    const application = await prisma.application.create({
      data: {
        taskId,
        builderId: builder.id,
        coverLetter,
        status: 'Pending',
      },
      include: {
        task: true,
        builder: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(application, { status: 201 });
  } catch (error) {
    console.error('Error creating application:', error);
    return NextResponse.json({ error: 'Failed to create application' }, { status: 500 });
  }
}
