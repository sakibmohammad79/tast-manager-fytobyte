import { prisma } from '@/app/lib/prisma';
import { NextResponse } from 'next/server';


// get all task from database
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tasks' }, 
      { status: 500 }
    );
  }
}

// create task into database
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    const newTask = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description || '',
      }
    });
    
    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error('Error creating task:', error);
    return NextResponse.json(
      { error: 'Failed to create task' }, 
      { status: 500 }
    );
  }
}