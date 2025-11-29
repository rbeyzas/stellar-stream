import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks - Get all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      include: {
        kpis: true,
        _count: {
          select: { applications: true },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    const tasksWithCounts = tasks.map((task: any) => ({
      ...task,
      applicationCount: task._count.applications,
    }));

    return NextResponse.json(tasksWithCounts);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json({ error: 'Failed to fetch tasks' }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      type,
      location,
      date,
      budget,
      streamDuration,
      status,
      kpis,
      createdById,
      createdByEmail,
    } = body;

    // Validate required fields
    if (!title || !description || !type || budget === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if location and date are required
    const requiresLocationDate = ['Workshop', 'Hackathon', 'Meetup'].includes(type);
    if (requiresLocationDate && (!location || !date)) {
      return NextResponse.json(
        { error: 'Location and date are required for Workshop, Hackathon, and Meetup types' },
        { status: 400 },
      );
    }

    // Resolve creator id: prefer createdById, otherwise upsert by email
    // Determine creator ID
    let creatorId = createdById;

    if (!creatorId && createdByEmail) {
      // Find user by email
      const user = await prisma.user.findUnique({
        where: { email: createdByEmail },
      });

      if (!user) {
        // Create user if not exists (auto-register for now, or error)
        // For now, let's error if user not found, or create a placeholder
        const newUser = await prisma.user.create({
          data: {
            email: createdByEmail,
            role: 'admin', // Default to admin for task creators? Or 'builder'?
            // Assuming admin creates tasks usually
          },
        });
        creatorId = newUser.id;
      } else {
        creatorId = user.id;
      }
    }


    const task = await prisma.task.create({
      data: {
        title,
        description,
        type,
        location: requiresLocationDate ? location : null,
        date: requiresLocationDate && date ? new Date(date) : null,
        budget: (typeof budget === 'number' && !isNaN(budget)) ? budget : (parseFloat(budget) || 0),
        streamDuration:
          typeof streamDuration === 'number' && !isNaN(streamDuration)
            ? Math.round(streamDuration)
            : Math.round(parseFloat(streamDuration || '0') || 0),
        createdById: creatorId,
        status: status || 'Open',
        kpis: kpis?.length
          ? {
              create: kpis.map((kpi: { name: string; target: string; description?: string }) => ({
                name: kpi.name,
                target: kpi.target,
                description: kpi.description || null,
              })),
            }
          : undefined,
      },
      include: {
        kpis: true,
      },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error: any) {
    console.error('Error creating task:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
    return NextResponse.json(
      { error: 'Failed to create task', details: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}
