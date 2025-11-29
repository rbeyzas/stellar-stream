import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    // Get total builders
    const totalBuilders = await prisma.user.count({
      where: { role: 'builder' },
    });

    // Get total tasks
    const totalTasks = await prisma.task.count();

    // Get open tasks
    const openTasks = await prisma.task.count({
      where: { status: 'Open' },
    });

    // Get in-progress tasks
    const inProgressTasks = await prisma.task.count({
      where: { status: 'In Progress' },
    });

    // Get total applications
    const totalApplications = await prisma.application.count();

    // Get pending applications
    const pendingApplications = await prisma.application.count({
      where: { status: 'Pending' },
    });

    // Get total submissions
    const totalSubmissions = await prisma.submission.count();

    // Get pending submissions
    const pendingSubmissions = await prisma.submission.count({
      where: { status: 'Pending Review' },
    });

    // Get total budget allocated
    const budgetData = await prisma.task.aggregate({
      _sum: {
        budget: true,
      },
    });

    // Get recent applications (last 5)
    const recentApplications = await prisma.application.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: {
        builder: {
          select: {
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            title: true,
          },
        },
      },
    });

    // Get top builders by submissions
    const topBuilders = await prisma.user.findMany({
      where: { role: 'builder' },
      take: 5,
      include: {
        submissions: {
          select: {
            status: true,
          },
        },
        applications: {
          select: {
            status: true,
          },
        },
      },
    });

    // Calculate builder stats
    const buildersWithStats = topBuilders.map((builder) => ({
      id: builder.id,
      name: builder.name || builder.email,
      email: builder.email,
      totalSubmissions: builder.submissions.length,
      approvedSubmissions: builder.submissions.filter((s) => s.status === 'Approved').length,
      totalApplications: builder.applications.length,
      approvedApplications: builder.applications.filter((a) => a.status === 'Approved').length,
    })).sort((a, b) => b.totalSubmissions - a.totalSubmissions);

    // Get task distribution by type
    const tasksByType = await prisma.task.groupBy({
      by: ['type'],
      _count: {
        id: true,
      },
    });

    // Get application status distribution
    const applicationsByStatus = await prisma.application.groupBy({
      by: ['status'],
      _count: {
        id: true,
      },
    });

    return NextResponse.json({
      overview: {
        totalBuilders,
        totalTasks,
        openTasks,
        inProgressTasks,
        totalApplications,
        pendingApplications,
        totalSubmissions,
        pendingSubmissions,
        totalBudget: budgetData._sum.budget || 0,
      },
      recentApplications: recentApplications.map((app) => ({
        id: app.id,
        builderName: app.builder.name || app.builder.email,
        taskTitle: app.task.title,
        status: app.status,
        createdAt: app.createdAt,
      })),
      topBuilders: buildersWithStats,
      tasksByType: tasksByType.map((t) => ({
        type: t.type,
        count: t._count.id,
      })),
      applicationsByStatus: applicationsByStatus.map((a) => ({
        status: a.status,
        count: a._count.id,
      })),
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
