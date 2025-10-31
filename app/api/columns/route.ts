import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const columns = await prisma.column.findMany({
      include: {
        tasks: {
          orderBy: {
            createdAt: 'asc'
          }
        }
      },
      orderBy: {
        id: 'asc'
      }
    })

    // Initialize columns if they don't exist
    if (columns.length === 0) {
      const defaultColumns = [
        { id: 'todo', title: 'To Do' },
        { id: 'in-progress', title: 'In Progress' },
        { id: 'done', title: 'Done' }
      ]

      await prisma.column.createMany({
        data: defaultColumns
      })

      const newColumns = await prisma.column.findMany({
        include: {
          tasks: true
        }
      })

      return NextResponse.json(newColumns)
    }

    return NextResponse.json(columns)
  } catch (error) {
    console.error('Error fetching columns:', error)
    return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 })
  }
}