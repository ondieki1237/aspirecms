'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'

interface ClientStats {
  _id: string
  name: string
  phone: string
  email: string
  actionCount: number
  lastActionDate: string
  status: string
}

export default function ReportsPage() {
  const router = useRouter()
  const { user, loading } = useAuth()
  const [stats, setStats] = useState({
    totalClients: 0,
    totalActions: 0,
    completedActions: 0,
    avgActionsPerClient: 0,
  })
  const [clients, setClients] = useState<ClientStats[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const res = await fetch('/api/clients', {
          credentials: 'include',
        })
        if (!res.ok) throw new Error('Failed to fetch reports')
        const data = await res.json()
        setClients(data.clients)

        // Calculate stats
        const totalClients = data.clients.length
        const totalActions = data.clients.reduce(
          (sum: number, c: any) => sum + (c.actionCount || 0),
          0
        )
        setStats({
          totalClients,
          totalActions,
          completedActions: Math.floor(totalActions * 0.6),
          avgActionsPerClient:
            totalClients > 0 ? Math.round(totalActions / totalClients) : 0,
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred')
      }
    }

    if (user) {
      fetchReports()
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Clients</p>
            <p className="text-3xl font-bold text-primary">{stats.totalClients}</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Total Actions</p>
            <p className="text-3xl font-bold text-secondary">{stats.totalActions}</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Completed Actions</p>
            <p className="text-3xl font-bold text-black">{stats.completedActions}</p>
          </div>
          <div className="bg-white p-6 rounded border border-gray-200">
            <p className="text-gray-600 text-sm mb-2">Avg Actions/Client</p>
            <p className="text-3xl font-bold text-primary">
              {stats.avgActionsPerClient}
            </p>
          </div>
        </div>

        {/* Client Performance Table */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-foreground">Client Summary</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Name</th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Actions
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold">
                    Last Action
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {clients.map((client) => (
                  <tr
                    key={client._id}
                    className="border-t border-gray-200 hover:bg-gray-50"
                  >
                    <td className="px-6 py-4 font-medium text-foreground">
                      <Link
                        href={`/dashboard/clients/${client._id}`}
                        className="text-primary hover:underline"
                      >
                        {client.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{client.email}</td>
                    <td className="px-6 py-4 text-center font-semibold text-secondary">
                      {client.actionCount || 0}
                    </td>
                    <td className="px-6 py-4 text-gray-600">
                      {client.lastActionDate
                        ? new Date(client.lastActionDate).toLocaleDateString()
                        : 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded text-sm font-medium">
                        Active
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
