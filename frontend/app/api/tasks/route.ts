import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateTaskId, generateKPIId, generateDeliverableId } from '@/lib/ambassadorUtils';

/**
 * GET /api/tasks
 * List and search tasks
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const country = searchParams.get('country');
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '10');

    const skip = (page - 1) * pageSize;

    // Build filter
    const where: {
      isDeleted: boolean;
      status?: string;
      country?: string;
    } = {
      isDeleted: false,
    };

    if (status) {
      where.status = status;
    }

    if (country) {
      where.country = country;
    }

    // Get tasks with pagination
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          kpiRequirements: true,
          deliverableRequirements: true,
          applications: {
            select: {
              id: true,
              status: true,
            },
          },
        },
        skip,
        take: pageSize,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      prisma.task.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: {
        tasks,
        pagination: {
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
        },
      },
    });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'FETCH_ERROR',
          message: 'Failed to fetch tasks',
        },
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      ecosystemId,
      title,
      description,
      country,
      city,
      language,
      budgetUSDC,
      streamConfig,
      applicationDeadline,
      eventStartDate,
      eventEndDate,
      tags,
      kpiRequirements,
      deliverableRequirements,
    } = body;

    // Validate required fields
    if (!ecosystemId || !title || !description || !budgetUSDC) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Missing required fields',
          },
        },
        { status: 400 },
      );
    }

    // Create task with requirements
    const task = await prisma.task.create({
      data: {
        taskId: generateTaskId(),
        ecosystemId,
        title,
        description,
        country,
        city,
        language,
        budgetUSDC: parseFloat(budgetUSDC),
        streamConfig: streamConfig || null,
        applicationDeadline: applicationDeadline ? new Date(applicationDeadline) : null,
        eventStartDate: eventStartDate ? new Date(eventStartDate) : null,
        eventEndDate: eventEndDate ? new Date(eventEndDate) : null,
        tags: tags || [],
        status: 'DRAFT',

        // Create KPI requirements
        kpiRequirements: {
          create: (kpiRequirements || []).map((kpi: Record<string, unknown>) => ({
            kpiId: generateKPIId(),
            type: kpi.type as string,
            label: kpi.label as string,
            minValue: parseFloat(kpi.minValue as string),
            description: kpi.description as string | undefined,
            isRequired: (kpi.isRequired as boolean) ?? true,
            weight: kpi.weight ? parseFloat(kpi.weight as string) : null,
          })),
        },

        // Create deliverable requirements
        deliverableRequirements: {
          create: (deliverableRequirements || []).map((del: Record<string, unknown>) => ({
            deliverableId: generateDeliverableId(),
            type: del.type as string,
            label: del.label as string,
            minCount: del.minCount ? parseInt(del.minCount as string) : null,
            minWords: del.minWords ? parseInt(del.minWords as string) : null,
            maxSizeMB: del.maxSizeMB ? parseFloat(del.maxSizeMB as string) : null,
            description: del.description as string | undefined,
            isRequired: (del.isRequired as boolean) ?? true,
          })),
        },
      },
      include: {
        kpiRequirements: true,
        deliverableRequirements: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        data: task,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'CREATE_ERROR',
          message: 'Failed to create task',
        },
      },
      { status: 500 },
    );
  }
}
