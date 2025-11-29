import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const taskId = params.id;

    // In a real app, we would verify the user session here
    // For now, we assume if they can call this, they are authorized (or we rely on client-side checks)
    
    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'Pending Stream Start',
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error starting task:', error);
    return NextResponse.json({ error: 'Failed to start task' }, { status: 500 });
  }
}
