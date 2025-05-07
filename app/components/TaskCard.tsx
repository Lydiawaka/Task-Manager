"use client"

import { useState } from "react"
import { Draggable } from "@hello-pangea/dnd"
import { MoreHorizontal, Trash2, Edit } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import EditTaskDialog from "./edit-task-dialog"
import type { Task } from "@/lib/types"

interface TaskCardProps {
  task: Task
  index: number
  onDelete: () => void
  onEdit: (updatedTask: Partial<Task>) => void
}

export default function TaskCard({ task, index, onDelete, onEdit }: TaskCardProps) {
  const [isEditOpen, setIsEditOpen] = useState(false)

  return (
    <>
      <Draggable draggableId={task.id} index={index}>
        {(provided, snapshot) => (
          <Card
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            className={`mb-3 ${snapshot.isDragging ? "opacity-75" : ""}`}
          >
            <CardContent className="p-3">
              <div className="flex justify-between items-start">
                <div className="w-full">
                  <h3 className="font-medium text-sm">{task.title}</h3>
                  {task.description && <p className="text-muted-foreground text-xs mt-1">{task.description}</p>}
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Open menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardContent>
          </Card>
        )}
      </Draggable>

      <EditTaskDialog open={isEditOpen} onOpenChange={setIsEditOpen} task={task} onSave={onEdit} />
    </>
  )
}
