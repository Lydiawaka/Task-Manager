"use client"

import { useState, useEffect } from "react"
import { DragDropContext, Droppable, DropResult } from "@hello-pangea/dnd"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import TaskColumn from "./task-column"
import AddTaskDialog from "./add-task-dialog"
import type { Task, Column } from "@/lib/types"
import { useUser } from "@clerk/nextjs"

export default function TaskBoard() {
  const [columns, setColumns] = useState<Column[]>([])
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [activeColumn, setActiveColumn] = useState<string>("todo")
  const [isLoading, setIsLoading] = useState(true)

  const { user, isLoaded } = useUser()

  // Fetch columns and tasks for the logged-in user
  useEffect(() => {
    if (isLoaded && user) {
      fetchColumns()
    }
  }, [isLoaded, user])

  const fetchColumns = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/columns")
      if (!response.ok) throw new Error("Failed to fetch columns")
      const data = await response.json()

      const order = ["todo", "inprogress", "done"]
      const sorted = data.sort(
        (a: Column, b: Column) =>
          order.indexOf(a.id.toLowerCase()) - order.indexOf(b.id.toLowerCase())
      )

      setColumns(sorted)
    } catch (error) {
      console.error("Error fetching columns:", error)
    } finally {
      setIsLoading(false)
    }
  }

  // Handle drag and drop between columns
  const handleDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const sourceColumn = columns.find((col) => col.id === source.droppableId)
    const destColumn = columns.find((col) => col.id === destination.droppableId)
    if (!sourceColumn || !destColumn) return

    const draggedTask = sourceColumn.tasks.find((task) => task.id === draggableId)
    if (!draggedTask) return

    // Optimistic UI update
    const newSourceTasks = Array.from(sourceColumn.tasks)
    newSourceTasks.splice(source.index, 1)

    const newDestTasks = Array.from(destColumn.tasks)
    newDestTasks.splice(destination.index, 0, { ...draggedTask, status: destColumn.id })

    const newColumns = columns.map((col) => {
      if (col.id === sourceColumn.id) return { ...col, tasks: newSourceTasks }
      if (col.id === destColumn.id) return { ...col, tasks: newDestTasks }
      return col
    })

    setColumns(newColumns)

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: draggableId,
          status: destColumn.id,
          columnId: destColumn.id,
          title: draggedTask.title,
          description: draggedTask.description,
        }),
      })

      if (!response.ok) throw new Error("Failed to update task")
    } catch (error) {
      console.error("Error updating task:", error)
      setColumns(columns) // revert on failure
    }
  }

  const addTask = async (task: Task) => {
    if (!user) return alert("You must be logged in to add a task")

    try {
      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: task.title,
          description: task.description,
          status: activeColumn,
          columnId: activeColumn,
          userId: user.id, // attach Clerk user ID
        }),
      })

      if (!response.ok) throw new Error("Failed to create task")

      const newTask = await response.json()

      const newColumns = columns.map((column) =>
        column.id === activeColumn
          ? { ...column, tasks: [...column.tasks, newTask] }
          : column
      )

      setColumns(newColumns)
      setIsAddTaskOpen(false)
    } catch (error) {
      console.error("Error adding task:", error)
    }
  }

  const deleteTask = async (columnId: string, taskId: string) => {
    // Optimistic UI
    const newColumns = columns.map((column) =>
      column.id === columnId
        ? { ...column, tasks: column.tasks.filter((t) => t.id !== taskId) }
        : column
    )
    setColumns(newColumns)

    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, { method: "DELETE" })
      if (!response.ok) throw new Error("Failed to delete task")
    } catch (error) {
      console.error("Error deleting task:", error)
      setColumns(columns) // revert on failure
    }
  }

  const editTask = async (columnId: string, taskId: string, updatedTask: Partial<Task>) => {
    const sourceColumn = columns.find((col) => col.id === columnId)
    if (!sourceColumn) return

    const task = sourceColumn.tasks.find((t) => t.id === taskId)
    if (!task) return

    const newTask = { ...task, ...updatedTask }

    let newColumns
    if (updatedTask.status && updatedTask.status !== columnId) {
      newColumns = columns.map((col) => {
        if (col.id === columnId) {
          return { ...col, tasks: col.tasks.filter((t) => t.id !== taskId) }
        } else if (col.id === updatedTask.status) {
          return { ...col, tasks: [...col.tasks, newTask] }
        } else {
          return col
        }
      })
    } else {
      newColumns = columns.map((col) =>
        col.id === columnId
          ? { ...col, tasks: col.tasks.map((t) => (t.id === taskId ? newTask : t)) }
          : col
      )
    }

    setColumns(newColumns)

    try {
      const response = await fetch("/api/tasks", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: taskId,
          title: newTask.title,
          description: newTask.description,
          status: newTask.status,
          columnId: updatedTask.status || columnId,
        }),
      })

      if (!response.ok) throw new Error("Failed to update task")
    } catch (error) {
      console.error("Error updating task:", error)
      setColumns(columns)
    }
  }

  const openAddTaskDialog = (columnId: string) => {
    setActiveColumn(columnId)
    setIsAddTaskOpen(true)
  }

  if (!isLoaded) {
    return <p className="text-center mt-10 text-muted-foreground">Loading user...</p>
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    )
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
          {["todo", "in-progress", "done"]
            .map((key) => columns.find((c) => c.id === key))
            .filter(Boolean)
            .map((column) => (
              <Droppable key={column!.id} droppableId={column!.id}>
                {(provided) => (
                  <TaskColumn
                    column={column!}
                    provided={provided}
                    onAddTask={() => openAddTaskDialog(column!.id)}
                    onDeleteTask={(taskId) => deleteTask(column!.id, taskId)}
                    onEditTask={(taskId, updatedTask) =>
                      editTask(column!.id, taskId, updatedTask)
                    }
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
