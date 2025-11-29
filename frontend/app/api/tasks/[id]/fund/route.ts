import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  try {
    const taskId = params.id;
    const { streamId } = await request.json();

    if (!streamId) {
      return NextResponse.json({ error: 'Stream ID is required' }, { status: 400 });
    }

    const task = await prisma.task.update({
      where: { id: taskId },
      data: {
        status: 'In Progress',
        streamId: streamId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error funding task:', error);
    return NextResponse.json({ error: 'Failed to fund task' }, { status: 500 });
  }
}
