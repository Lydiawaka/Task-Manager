
import TaskBoard from "./components/task-board"

export default function Home() {
  return (
    <main className="container mx-auto p-4 md:p-6">
      <h1 className="text-3xl font-bold mb-6 text-pink-600 text-center">Task Management</h1>
      <TaskBoard />
    </main>
  )
}
