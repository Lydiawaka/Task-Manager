import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

//  Create a new task
export async function POST(request: Request) {
  try {
    const authData = auth();
    const userId = (await authData)?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { title, description, status, columnId } = body;

    if (!title || !status || !columnId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status,
        columnId,
        userId,
      },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}

// Update a task
export async function PATCH(request: Request) {
  try {
    const authData = auth();
    const userId = (await authData)?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, title, description, status, columnId } = body;

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask || existingTask.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to update this task" }, { status: 403 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: { title, description, status, columnId },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// Delete a task
export async function DELETE(request: Request) {
  try {
    const authData = auth();
    const userId = (await authData)?.userId;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Task ID is required" }, { status: 400 });
    }

    const existingTask = await prisma.task.findUnique({ where: { id } });

    if (!existingTask || existingTask.userId !== userId) {
      return NextResponse.json({ error: "Not authorized to delete this task" }, { status: 403 });
    }

    await prisma.task.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
