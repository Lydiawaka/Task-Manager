import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Check if default columns exist
    const existingColumns = await prisma.column.findMany()

    if (existingColumns.length === 0) {
      // Create default columns
      await prisma.column.createMany({
        data: [
          { id: "todo", title: "To Do" },
          { id: "inprogress", title: "In Progress" },
          { id: "done", title: "Done" },
        ],
      })
    }

    // Fetch columns and filter tasks by current user
    const columns = await prisma.column.findMany({
      include: {
        tasks: {
          where: { userId },
          orderBy: { createdAt: "asc" },
        },
      },
    })

    // Sort columns in correct order
    const order = ["todo", "inprogress", "done"]
    const sortedColumns = columns.sort(
      (a, b) => order.indexOf(a.id) - order.indexOf(b.id)
    )

    return NextResponse.json(sortedColumns)
  } catch (error) {
    console.error("Error fetching columns:", error)
    return NextResponse.json({ error: "Failed to fetch columns" }, { status: 500 })
  }
}
