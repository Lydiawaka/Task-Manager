"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import TaskCard from "./TaskCard"
import type { Column, Task } from "@/lib/types"

interface TaskColumnProps {
  column: Column
  provided: any
  onAddTask: () => void
  onDeleteTask: (taskId: string) => void
  onEditTask: (taskId: string, updatedTask: Partial<Task>) => void
}

export default function TaskColumn({ column, provided, onAddTask, onDeleteTask, onEditTask }: TaskColumnProps) {
  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold">
            {column.title} <span className="text-muted-foreground ml-2 text-sm">({column.tasks.length})</span>
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onAddTask}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div ref={provided.innerRef} {...provided.droppableProps} className="min-h-[200px]">
          {column.tasks.map((task, index) => (
            <TaskCard
              key={task.id}
              task={task}
              index={index}
              onDelete={() => onDeleteTask(task.id)}
              onEdit={(updatedTask) => onEditTask(task.id, updatedTask)}
            />
          ))}
          {provided.placeholder}
        </div>
      </CardContent>
    </Card>
  )
}
