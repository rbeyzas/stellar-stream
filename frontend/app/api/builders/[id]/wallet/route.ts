import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const builderId = params.id;

    const user = await prisma.user.findUnique({
      where: { id: builderId },
      select: { walletAddress: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ walletAddress: user.walletAddress });
  } catch (error) {
    console.error('Error fetching builder wallet:', error);
    return NextResponse.json({ error: 'Failed to fetch wallet' }, { status: 500 });
  }
}
