'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface Client {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  age?: number;
  gender?: string;
  status: string;
  issueCategory?: string;
  description?: string;
  tokens?: number;
}

interface Action {
  _id: string;
  actionType: string;
  description?: string;
  duration?: number;
  createdAt: string;
}

export default function ClientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [client, setClient] = useState<Client | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');

  const clientId = params.id as string;

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const res = await fetch(`/api/clients?id=${clientId}`);
        if (!res.ok) throw new Error('Failed to fetch client');
        const data = await res.json();
        setClient(data.client || data.clients[0]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error loading client');
      } finally {
        setLoading(false);
      }
    };

    if (user && clientId) {
      fetchClient();
    }
  }, [user, clientId]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <Link href="/dashboard">
              <button className="text-red-600 hover:text-red-700 font-medium">← Back to Dashboard</button>
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-gray-600">Client not found</div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <Link href="/dashboard">
            <button className="text-red-600 hover:text-red-700 font-medium mb-4">← Back to Dashboard</button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-black">{client.name}</h1>
              <p className="text-gray-600">{client.email}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${
              client.status === 'Active'
                ? 'bg-green-100 text-green-800'
                : client.status === 'On Leave'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-gray-100 text-gray-800'
            }`}>
              {client.status}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg border border-gray-200 mb-6">
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab('overview')}
              className={`flex-1 px-6 py-4 font-medium text-sm transition ${
                activeTab === 'overview'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex-1 px-6 py-4 font-medium text-sm transition ${
                activeTab === 'actions'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Actions
            </button>
            <button
              onClick={() => setActiveTab('tasks')}
              className={`flex-1 px-6 py-4 font-medium text-sm transition ${
                activeTab === 'tasks'
                  ? 'text-red-600 border-b-2 border-red-600'
                  : 'text-gray-600 hover:text-black'
              }`}
            >
              Tasks
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Personal Information</h3>
                    <div className="space-y-3">
                      <div>
                        <p className="text-xs text-gray-500 uppercase">Email</p>
                        <p className="text-black font-medium">{client.email}</p>
                      </div>
                      {client.phone && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Phone</p>
                          <p className="text-black font-medium">{client.phone}</p>
                        </div>
                      )}
                      {client.age && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Age</p>
                          <p className="text-black font-medium">{client.age}</p>
                        </div>
                      )}
                      {client.gender && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Gender</p>
                          <p className="text-black font-medium">{client.gender}</p>
                        </div>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-600 mb-4">Issue Information</h3>
                    <div className="space-y-3">
                      {client.issueCategory && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Category</p>
                          <p className="text-black font-medium">{client.issueCategory}</p>
                        </div>
                      )}
                      {client.description && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Description</p>
                          <p className="text-black font-medium">{client.description}</p>
                        </div>
                      )}
                      {client.tokens !== undefined && (
                        <div>
                          <p className="text-xs text-gray-500 uppercase">Reward Tokens</p>
                          <p className="text-black font-medium">{client.tokens}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'actions' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-black">Client Actions</h3>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
                    + Log Action
                  </button>
                </div>
                <p className="text-gray-500 text-sm">No actions logged yet</p>
              </div>
            )}

            {activeTab === 'tasks' && (
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-black">Tasks</h3>
                  <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition font-medium text-sm">
                    + Add Task
                  </button>
                </div>
                <p className="text-gray-500 text-sm">No tasks yet</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
