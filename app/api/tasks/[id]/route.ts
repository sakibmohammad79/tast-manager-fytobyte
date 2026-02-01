/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';




// GET Task By ID
export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id } = await params; 
    
    const task = await prisma.task.findUnique({ 
      where: { id } 
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' }, 
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error fetching task:', error);
    return NextResponse.json(
      { error: 'Failed to fetch task' }, 
      { status: 500 }
    );
  }
}


// task update 
export async function PATCH(request: Request,  { params }: { params: Promise<{ id: string }> } ) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        title: body.title,
        description: body.description,
        completed: body.completed
      }
    });
    
    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error('Error updating task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to update task' }, 
      { status: 500 }
    );
  }
}

// DELETE 
export async function DELETE(request: Request,  { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    await prisma.task.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Task deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting task:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Task not found' }, 
        { status: 404 }
      );
    }
    
    return NextResponse.json(
      { error: 'Failed to delete task' }, 
      { status: 500 }
    );
  }
}