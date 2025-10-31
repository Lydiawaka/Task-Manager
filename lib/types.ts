export interface Task {
    id: string
    title: string
    description?: string
    status: string
  }
  
  export interface Column {
    id: string
    title: string
    tasks: Task[]
  }