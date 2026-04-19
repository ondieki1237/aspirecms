'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Client {
  _id: string;
  name: string;
  email: string;
  status: string;
  issueCategory?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading, logout } = useAuth();
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const res = await fetch('/api/clients');
        if (!res.ok) throw new Error('Failed to fetch clients');
        const data = await res.json();
        setClients(data.clients);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading clients');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchClients();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    router.push('/auth/login');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-black">CMS Dashboard</h1>
            <p className="text-gray-600 text-sm">Welcome, {user.name}</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium"
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-600 text-sm font-medium">Total Clients</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">{clients.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-600 text-sm font-medium">Active Clients</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">
              {clients.filter((c) => c.status === 'Active').length}
            </p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <h3 className="text-gray-600 text-sm font-medium">Pending Tasks</h3>
            <p className="text-3xl font-semibold text-gray-900 mt-2">0</p>
          </div>
        </div>

        {/* Clients Section */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-bold text-black">Your Clients</h2>
            <Link href="/dashboard/clients/add">
              <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                + Add Client
              </button>
            </Link>
          </div>

          {error && (
            <div className="p-6 bg-red-50 border border-red-200 text-red-700 rounded m-6">
              {error}
            </div>
          )}

          {clients.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-600 text-lg mb-4">No clients yet</p>
              <Link href="/dashboard/clients/add">
                <button className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium">
                  Add Your First Client
                </button>
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-black">Name</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-black">Email</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-black">Issue Category</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-black">Status</th>
                    <th className="text-right px-6 py-3 text-sm font-semibold text-black">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clients.map((client) => (
                    <tr key={client._id} className="border-b border-gray-200 hover:bg-gray-50 transition">
                      <td className="px-6 py-4 text-black font-medium">{client.name}</td>
                      <td className="px-6 py-4 text-gray-600">{client.email}</td>
                      <td className="px-6 py-4 text-gray-600">{client.issueCategory || '-'}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium ${
                            client.status === 'Active'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/dashboard/clients/${client._id}`}>
                          <button className="text-red-600 hover:text-red-700 font-medium text-sm">
                            View Details
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
