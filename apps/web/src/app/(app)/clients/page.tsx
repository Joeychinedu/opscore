'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Users, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/data/empty-state';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface Client {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  _count: { projects: number; invoices: number };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const fetchClients = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      const res = await api.get<any>(`/clients?${params}`);
      const items = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      const paginationMeta = res.meta || null;
      setClients(items);
      setMeta(paginationMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load clients');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div>
      <PageHeader
        title="Clients"
        description="Manage your client relationships"
        action={
          <Link
            href="/clients/new"
            className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </Link>
        }
      />

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search clients..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={5} />
      ) : clients.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No clients yet"
          description="Get started by adding your first client."
          action={
            <Link
              href="/clients/new"
              className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              Add Client
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03]">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Projects</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoices</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/clients/${client.id}`} className="text-blue-500 hover:text-blue-600 font-medium">
                        {client.name}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{client.company || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{client.email || '-'}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{client._count.projects}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{client._count.invoices}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} clients
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
