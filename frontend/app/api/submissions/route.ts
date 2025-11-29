import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

// POST /api/submissions - Create a new submission
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const taskId = formData.get('taskId') as string;
    const builderEmail = formData.get('builderEmail') as string;
    const summary = formData.get('summary') as string;
    const status = formData.get('status') as string; // 'draft' or 'submitted'
    const kpiResultsJson = formData.get('kpiResults') as string;

    if (!taskId || !builderEmail || !summary) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Find builder by email
    const builder = await prisma.user.findUnique({
      where: { email: builderEmail },
    });

    if (!builder) {
      return NextResponse.json({ error: 'Builder not found' }, { status: 404 });
    }

    // Parse KPI results
    const kpiResults = JSON.parse(kpiResultsJson) as Array<{
      kpiId: string;
      achievedValue: string;
      notes: string;
    }>;

    // Get KPI details to store name and target
    const kpis = await prisma.kPI.findMany({
      where: {
        id: { in: kpiResults.map((r) => r.kpiId) },
      },
    });

    // Handle file uploads
    const files = formData.getAll('files') as File[];
    const uploadedFiles: Array<{
      name: string;
      size: string;
      type: string;
      url: string;
    }> = [];

    if (files && files.length > 0) {
      // Create uploads directory if it doesn't exist
      const uploadsDir = join(process.cwd(), 'public', 'uploads');
      if (!existsSync(uploadsDir)) {
        await mkdir(uploadsDir, { recursive: true });
      }

      // Process each file
      for (const file of files) {
        if (file && file.size > 0) {
          const bytes = await file.arrayBuffer();
          const buffer = Buffer.from(bytes);

          // Generate unique filename
          const timestamp = Date.now();
          const randomString = Math.random().toString(36).substring(2, 15);
          const fileName = `${timestamp}-${randomString}-${file.name}`;
          const filePath = join(uploadsDir, fileName);

          // Write file to disk
          await writeFile(filePath, buffer);

          // Store file info
          uploadedFiles.push({
            name: file.name,
            size: file.size.toString(),
            type: file.type,
            url: `/uploads/${fileName}`,
          });
        }
      }
    }

    // Create submission with files
    const submission = await prisma.submission.create({
      data: {
        taskId,
        builderId: builder.id,
        workSummary: summary,
        status: status === 'draft' ? 'draft' : 'Pending Review',
        kpiResults: {
          create: kpiResults.map((result) => {
            const kpi = kpis.find((k) => k.id === result.kpiId);
            return {
              name: kpi?.name || 'Unknown KPI',
              target: kpi?.target || 'N/A',
              achieved: result.achievedValue,
              status: 'Pending', // Will be reviewed by admin
            };
          }),
        },
        supportingFiles: {
          create: uploadedFiles.map((file) => ({
            name: file.name,
            size: file.size,
            type: file.type,
            url: file.url,
          })),
        },
      },
      include: {
        kpiResults: true,
        supportingFiles: true,
      },
    });

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    return NextResponse.json({ error: 'Failed to create submission' }, { status: 500 });
  }
}

// GET /api/submissions?builderEmail=email - Get builder's submissions
// GET /api/submissions (no query) - Get all submissions for admin
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const builderEmail = searchParams.get('builderEmail');

    // If no builderEmail, return all submissions (for admin)
    if (!builderEmail) {
      const submissions = await prisma.submission.findMany({
        include: {
          task: {
            select: {
              id: true,
              title: true,
              location: true,
              date: true,
              budget: true,
            },
          },
          builder: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          kpiResults: true,
          supportingFiles: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return NextResponse.json(submissions);
    }

    // Get submissions for specific builder
    const builder = await prisma.user.findUnique({
      where: { email: builderEmail },
    });

    if (!builder) {
      return NextResponse.json({ error: 'Builder not found' }, { status: 404 });
    }

    const submissions = await prisma.submission.findMany({
      where: { builderId: builder.id },
      include: {
        task: true,
        kpiResults: true,
        supportingFiles: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(submissions);
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json({ error: 'Failed to fetch submissions' }, { status: 500 });
  }
}
