'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface CounselorStats {
  _id: string
  name: string
  email: string
  clientCount: number
  taskCount: number
  attendanceRate: number
}

export default function AdminDashboard() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [counselors, setCounselors] = useState<CounselorStats[]>([])
  const [stats, setStats] = useState({
    totalCounselors: 0,
    totalClients: 0,
    totalTasks: 0,
    completedTasks: 0,
  })
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/admin/stats', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch stats')
        const data = await res.json()
        setStats(data.stats)
        setCounselors(data.counselors)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    if (user?.role === 'admin') {
      fetchStats()
    }
  }, [user])

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-black text-white sticky top-0 z-50 border-b border-primary">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <button
            onClick={() => {
              fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
              router.push('/auth/login')
            }}
            className="px-4 py-2 bg-primary text-white rounded hover:bg-red-700 transition"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-primary text-primary rounded">
            {error}
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Counselors</p>
            <p className="text-3xl font-bold text-primary">{stats.totalCounselors}</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Clients</p>
            <p className="text-3xl font-bold text-secondary">{stats.totalClients}</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Tasks</p>
            <p className="text-3xl font-bold text-black">{stats.totalTasks}</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Completed Tasks</p>
            <p className="text-3xl font-bold text-primary">{stats.completedTasks}</p>
          </div>
        </div>

        {/* Counselors Table */}
        <div className="bg-white rounded border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-foreground">Counselor Performance</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-black text-white">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Clients</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Tasks</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">Attendance</th>
                </tr>
              </thead>
              <tbody>
                {counselors.map((counselor) => (
                  <tr
                    key={counselor._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      {counselor.name}
                    </td>
                    <td className="px-6 py-4 text-gray-600">{counselor.email}</td>
                    <td className="px-6 py-4 text-center font-semibold text-primary">
                      {counselor.clientCount}
                    </td>
                    <td className="px-6 py-4 text-center font-semibold text-secondary">
                      {counselor.taskCount}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span
                        className={`px-3 py-1 rounded text-white text-sm font-medium ${
                          counselor.attendanceRate >= 80
                            ? 'bg-green-500'
                            : counselor.attendanceRate >= 60
                              ? 'bg-yellow-500'
                              : 'bg-primary'
                        }`}
                      >
                        {counselor.attendanceRate.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  )
}
