import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const submission = await prisma.submission.findUnique({
      where: { id },
      include: {
        builder: {
          select: {
            id: true,
            name: true,
            email: true,
            walletAddress: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
            location: true,
            date: true,
            budget: true,
          },
        },
        kpiResults: true,
        supportingFiles: true,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found' }, { status: 404 });
    }

    return NextResponse.json(submission);
  } catch (error) {
    console.error('Error fetching submission:', error);
    return NextResponse.json({ error: 'Failed to fetch submission' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, reviewNotes, amount } = body;

    const updatedSubmission = await prisma.submission.update({
      where: { id },
      data: {
        status,
        reviewNotes,
        amount: amount ? parseFloat(amount) : undefined,
      },
      include: {
        builder: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        kpiResults: true,
        supportingFiles: true,
      },
    });

    return NextResponse.json(updatedSubmission);
  } catch (error) {
    console.error('Error updating submission:', error);
    return NextResponse.json({ error: 'Failed to update submission' }, { status: 500 });
  }
}
