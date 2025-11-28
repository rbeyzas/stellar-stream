import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/tasks/[id] - Get a single task
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        kpis: true,
        applications: {
          include: {
            builder: {
              select: {
                id: true,
                email: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: { applications: true },
        },
      },
    });

    if (!task) {
      return NextResponse.json({ error: 'Task not found' }, { status: 404 });
    }

    const taskWithApplicants = {
      ...task,
      currentApplicants: task._count.applications,
      date: task.date?.toISOString(),
      applications: task.applications.map((app) => ({
        id: app.id,
        taskId: app.taskId,
        builderId: app.builderId,
        builderEmail: app.builder.email,
        builderName: app.builder.name,
        coverLetter: app.coverLetter,
        status: app.status,
        createdAt: app.createdAt.toISOString(),
      })),
    };

    return NextResponse.json(taskWithApplicants);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json({ error: 'Failed to fetch task' }, { status: 500 });
  }
}

// PUT /api/tasks/[id] - Update a task
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, description, type, location, date, budget, status, kpis } = body;

    const requiresLocationDate = ['Workshop', 'Hackathon', 'Meetup'].includes(type);

    // Delete existing KPIs and create new ones
    if (kpis) {
      await prisma.kPI.deleteMany({
        where: { taskId: id },
      });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        type,
        location: requiresLocationDate ? location : null,
        date: requiresLocationDate && date ? new Date(date) : null,
        budget: parseFloat(budget),
        status,
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

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    return NextResponse.json({ error: 'Failed to update task' }, { status: 500 });
  }
}

// DELETE /api/tasks/[id] - Delete a task
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json({ error: 'Failed to delete task' }, { status: 500 });
  }
}
