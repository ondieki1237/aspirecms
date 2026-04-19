'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface Task {
  _id: string
  title: string
  description: string
  clientId: { _id: string; name: string }
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  completed: boolean
}

export default function TasksPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const res = await fetch('/api/tasks', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch tasks')
        const data = await res.json()
        setTasks(data.tasks)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    if (user) {
      fetchTasks()
    }
  }, [user])

  const toggleTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/tasks`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ taskId, completed: true }),
      })
      if (!res.ok) throw new Error('Failed to update task')
      setTasks((prev) =>
        prev.map((t) => (t._id === taskId ? { ...t, completed: true } : t))
      )
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task')
    }
  }

  const filteredTasks =
    filter === 'all'
      ? tasks
      : filter === 'pending'
        ? tasks.filter((t) => !t.completed)
        : tasks.filter((t) => t.completed)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-2xl font-semibold text-gray-900">
            Counselor System
          </Link>
          <div className="flex gap-4">
            <span className="text-gray-600">{user?.name}</span>
            <button
              onClick={() => {
                fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
                router.push('/auth/login')
              }}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-primary text-primary rounded">
            {error}
          </div>
        )}

        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center text-red-600 hover:text-red-700 mb-6 font-medium"
        >
          ← Back to Dashboard
        </Link>

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-6">
          {(['all', 'pending', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`px-4 py-2 rounded font-medium transition ${
                filter === tab
                  ? 'bg-primary text-white'
                  : 'bg-white text-foreground border border-gray-200 hover:border-primary'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)} ({filteredTasks.length})
            </button>
          ))}
        </div>

        {/* Tasks List */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No tasks found
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {filteredTasks.map((task) => (
                <div
                  key={task._id}
                  className="p-6 hover:bg-gray-50 transition flex items-start justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={task.completed}
                        onChange={() => toggleTask(task._id)}
                        className="w-5 h-5 cursor-pointer"
                      />
                      <h3
                        className={`text-lg font-semibold ${
                          task.completed
                            ? 'line-through text-gray-400'
                            : 'text-foreground'
                        }`}
                      >
                        {task.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 mt-2 ml-8">{task.description}</p>
                    <div className="mt-3 ml-8 flex gap-3 items-center flex-wrap">
                      <span className="text-sm px-3 py-1 bg-gray-100 rounded">
                        Client: {task.clientId.name}
                      </span>
                      <span
                        className={`text-sm px-3 py-1 rounded text-white font-medium ${
                          task.priority === 'high'
                            ? 'bg-primary'
                            : task.priority === 'medium'
                              ? 'bg-secondary'
                              : 'bg-gray-500'
                        }`}
                      >
                        {task.priority.toUpperCase()}
                      </span>
                      <span className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
