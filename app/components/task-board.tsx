"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import TaskColumn from "./task-column"
import AddTaskDialog from "./add-task-dialog"
import type { Task, Column } from "@/lib/types"

export default function TaskBoard() {
  const [columns, setColumns] = useState<Column[]>([
    { id: "todo", title: "To Do", tasks: [] },
    { id: "in-progress", title: "In Progress", tasks: [] },
    { id: "done", title: "Done", tasks: [] },
  ])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [activeColumn, setActiveColumn] = useState<string>("todo")

  // Load data from localStorage on component mount
  useEffect(() => {
    const savedColumns = localStorage.getItem("taskColumns")
    if (savedColumns) {
      setColumns(JSON.parse(savedColumns))
    } else {
      // Initialize with sample tasks if no saved data
      setColumns([
        {
          id: "todo",
          title: "To Do",
          tasks: [
            { id: "task-1", title: "Research competitors", description: "Analyze top 5 competitors in the market" },
            { id: "task-2", title: "Design homepage", description: "Create wireframes for the new homepage" },
          ],
        },
        {
          id: "in-progress",
          title: "In Progress",
          tasks: [{ id: "task-3", title: "Update documentation", description: "Review and update API documentation" }],
        },
        {
          id: "done",
          title: "Done",
          tasks: [
            {
              id: "task-4",
              title: "Setup project",
              description: "Initialize repository and setup development environment",
            },
          ],
        },
      ])
    }
  }, [])

  // Save to localStorage whenever columns change
  useEffect(() => {
    localStorage.setItem("taskColumns", JSON.stringify(columns))
  }, [columns])

  const handleDragEnd = (result: any) => {
    const { destination, source, draggableId } = result

    // If there's no destination or the item was dropped back in its original position
    if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index)) {
      return
    }

    // Find the task that was dragged
    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    if (!sourceColumn) return

    const task = sourceColumn.tasks.find((task) => task.id === draggableId)
    if (!task) return

    // Create a new array of columns
    const newColumns = columns.map((column) => {
      // Remove the task from the source column
      if (column.id === source.droppableId) {
        const newTasks = [...column.tasks]
        newTasks.splice(source.index, 1)
        return { ...column, tasks: newTasks }
      }

      // Add the task to the destination column
      if (column.id === destination.droppableId) {
        const newTasks = [...column.tasks]
        newTasks.splice(destination.index, 0, task)
        return { ...column, tasks: newTasks }
      }

      return column
    })

    setColumns(newColumns)
  }

  const addTask = (task: Task) => {
    const newColumns = columns.map((column) => {
      if (column.id === activeColumn) {
        return {
          ...column,
          tasks: [...column.tasks, task],
        }
      }
      return column
    })

    setColumns(newColumns)
    setIsAddTaskOpen(false)
  }

  const deleteTask = (columnId: string, taskId: string) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: column.tasks.filter((task) => task.id !== taskId),
        }
      }
      return column
    })

    setColumns(newColumns)
  }

  const editTask = (columnId: string, taskId: string, updatedTask: Partial<Task>) => {
    const newColumns = columns.map((column) => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: column.tasks.map((task) => (task.id === taskId ? { ...task, ...updatedTask } : task)),
        }
      }
      return column
    })

    setColumns(newColumns)
  }

  const openAddTaskDialog = (columnId: string) => {
    setActiveColumn(columnId)
    setIsAddTaskOpen(true)
  }

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Your Tasks</h2>
        <Button onClick={() => openAddTaskDialog("todo")}>
          <Plus className="mr-2 h-4 w-4" /> Add Task
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {columns.map((column) => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided) => (
                <TaskColumn
                  column={column}
                  provided={provided}
                  onAddTask={() => openAddTaskDialog(column.id)}
                  onDeleteTask={(taskId) => deleteTask(column.id, taskId)}
                  onEditTask={(taskId, updatedTask) => editTask(column.id, taskId, updatedTask)}
                />
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      <AddTaskDialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen} onAddTask={addTask} />
    </div>
  )
}
