
import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/payments - Get all payments (for admin)
export async function GET(request: Request) {
  try {
    // @ts-ignore
    const payments = await prisma.payment.findMany({
      include: {
        builder: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(payments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json({ error: 'Failed to fetch payments' }, { status: 500 });
  }
}

// POST /api/payments - Record a new payment (e.g. from stream withdrawal)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { streamId, amount, token, from, to, txHash, builderEmail } = body;

    // Try to find builder by email if provided
    let builderId = null;
    if (builderEmail) {
      const builder = await prisma.user.findUnique({
        where: { email: builderEmail },
      });
      if (builder) {
        builderId = builder.id;
      }
    }

    // @ts-ignore
    const payment = await prisma.payment.create({
      data: {
        streamId,
        amount: parseFloat(amount),
        token,
        from,
        to,
        txHash,
        builderId,
      },
    });

    return NextResponse.json(payment);
  } catch (error) {
    console.error('Error recording payment:', error);
    return NextResponse.json({ error: 'Failed to record payment' }, { status: 500 });
  }
}
