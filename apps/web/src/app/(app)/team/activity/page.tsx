'use client';

import { useEffect, useState, useCallback } from 'react';
import { Activity } from 'lucide-react';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/data/empty-state';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface ActivityEntry {
  id: string;
  action: string;
  entity: string;
  entityId: string;
  description: string;
  createdAt: string;
  user: { firstName: string; lastName: string };
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

const ENTITY_COLORS: Record<string, string> = {
  Client: 'border-blue-400',
  Project: 'border-purple-400',
  Task: 'border-green-400',
  Invoice: 'border-yellow-400',
};

export default function ActivityPage() {
  const [entries, setEntries] = useState<ActivityEntry[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [entityFilter, setEntityFilter] = useState('');

  const fetchActivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (entityFilter) params.set('entity', entityFilter);
      const res = await api.get<{ data: ActivityEntry[]; meta: Meta }>(`/activity?${params}`);
      setEntries(res.data);
      setMeta(res.meta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load activity');
    } finally {
      setLoading(false);
    }
  }, [page, entityFilter]);

  useEffect(() => {
    fetchActivity();
  }, [fetchActivity]);

  useEffect(() => {
    setPage(1);
  }, [entityFilter]);

  return (
    <div>
      <PageHeader title="Activity Log" description="Track all changes across your workspace" />

      <div className="mb-4">
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Entities</option>
          <option value="Client">Client</option>
          <option value="Project">Project</option>
          <option value="Task">Task</option>
          <option value="Invoice">Invoice</option>
        </select>
      </div>

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <TableSkeleton rows={8} cols={3} />
      ) : entries.length === 0 ? (
        <EmptyState
          icon={Activity}
          title="No activity yet"
          description="Activity will appear here as your team makes changes."
        />
      ) : (
        <>
          <div className="rounded-lg border bg-white">
            <div className="divide-y divide-gray-100">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 p-4 border-l-4 ${ENTITY_COLORS[entry.entity] || 'border-gray-300'}`}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-600">
                    {entry.user.firstName[0]}{entry.user.lastName[0]}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{entry.user.firstName} {entry.user.lastName}</span>{' '}
                      {entry.description}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="inline-flex items-center rounded-md bg-gray-100 px-1.5 py-0.5 text-xs text-gray-600">
                        {entry.entity}
                      </span>
                      <span className="text-xs text-gray-400">{timeAgo(entry.createdAt)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} entries
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                  disabled={page === meta.totalPages}
                  className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
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
