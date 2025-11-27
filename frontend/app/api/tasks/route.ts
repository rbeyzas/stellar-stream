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

    const tasksWithCounts = tasks.map((task) => ({
      ...task,
      currentApplicants: task._count.applications,
      date: task.date?.toISOString(),
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
    let creatorId: string | undefined = createdById;
    if (!creatorId) {
      if (!createdByEmail) {
        return NextResponse.json(
          { error: 'Missing creator info: provide createdById or createdByEmail' },
          { status: 400 },
        );
      }
      const userRole = createdByEmail.includes('admin') ? 'admin' : 'builder';
      const user = await prisma.user.upsert({
        where: { email: createdByEmail },
        update: {
          role: userRole,
        },
        create: {
          email: createdByEmail,
          role: userRole,
        },
      });
      creatorId = user.id;
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        type,
        location: requiresLocationDate ? location : null,
        date: requiresLocationDate && date ? new Date(date) : null,
        budget: typeof budget === 'number' ? budget : parseFloat(budget),
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
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
