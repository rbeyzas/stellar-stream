import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { submissionId, amount, transactionHash, reviewNotes } = body;

    if (!submissionId || !amount || !transactionHash) {
      return NextResponse.json(
        { error: 'Missing required fields', details: 'Missing required fields: submissionId, amount, transactionHash' },
        { status: 400 }
      );
    }

    // Get submission with builder details
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        builder: {
          select: {
            walletAddress: true,
            email: true,
            name: true,
          },
        },
      },
    });

    if (!submission) {
      return NextResponse.json({ error: 'Submission not found', details: 'Submission not found' }, { status: 404 });
    }

    if (!submission.builder.walletAddress) {
      return NextResponse.json(
        { error: 'Builder wallet address not found', details: 'Builder wallet address not found. Please ask builder to add wallet address in profile.' },
        { status: 400 }
      );
    }

    // Update submission with payment info
    await prisma.submission.update({
      where: { id: submissionId },
      data: {
        amount: parseFloat(amount),
        status: 'Approved',
        reviewNotes: reviewNotes || null,
      },
    });

    return NextResponse.json({
      success: true,
      transactionHash,
      message: `Payment of ${amount} XLM sent to ${submission.builder.walletAddress}`,
    });
  } catch (error: unknown) {
    console.error('Error processing payment:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to process payment', details: errorMessage },
      { status: 500 }
    );
  }
}
