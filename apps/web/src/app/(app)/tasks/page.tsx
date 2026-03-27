'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { CheckSquare, Plus, Search } from 'lucide-react';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { EmptyState } from '@/components/data/empty-state';
import { StatusBadge } from '@/components/data/status-badge';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface Assignee {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueDate: string | null;
  assignee: Assignee | null;
  project: { id: string; name: string } | null;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface ProjectOption {
  id: string;
  name: string;
}

interface MemberOption {
  id: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string };
}

const TASK_STATUSES = ['', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES = ['', 'LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [projectFilter, setProjectFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);

  useEffect(() => {
    async function loadFilters() {
      try {
        const [projRes, memRes] = await Promise.all([
          api.get<any>('/projects?limit=100'),
          api.get<any>('/members'),
        ]);
        setProjects(Array.isArray(projRes.data) ? projRes.data : Array.isArray(projRes) ? projRes : []);
        setMembers(Array.isArray(memRes.data) ? memRes.data : Array.isArray(memRes) ? memRes : []);
      } catch {
        // Non-critical
      }
    }
    loadFilters();
  }, []);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '20');
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      if (priorityFilter) params.set('priority', priorityFilter);
      if (projectFilter) params.set('projectId', projectFilter);
      if (assigneeFilter) params.set('assigneeId', assigneeFilter);
      const res = await api.get<any>(`/tasks?${params}`);
      const items = Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : [];
      const paginationMeta = res.meta || null;
      setTasks(items);
      setMeta(paginationMeta);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, priorityFilter, projectFilter, assigneeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, priorityFilter, projectFilter, assigneeFilter]);

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <PageHeader
        title="Tasks"
        description="Manage and track all tasks"
        action={
          <Link
            href="/tasks/new"
            className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
          >
            <Plus className="h-4 w-4" />
            New Task
          </Link>
        }
      />

      <div className="mb-4 space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full border border-gray-200 rounded-lg pl-10 pr-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {TASK_STATUSES.filter(Boolean).map((s) => (
              <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
          >
            <option value="">All Priorities</option>
            {PRIORITIES.filter(Boolean).map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <select
            value={projectFilter}
            onChange={(e) => setProjectFilter(e.target.value)}
            className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <select
            value={assigneeFilter}
            onChange={(e) => setAssigneeFilter(e.target.value)}
            className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm text-gray-700 shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
          >
            <option value="">All Assignees</option>
            {members.map((m) => (
              <option key={m.id} value={m.user?.id || m.userId}>
                {m.user ? `${m.user.firstName} ${m.user.lastName}` : m.userId}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      {loading ? (
        <TableSkeleton rows={5} cols={6} />
      ) : tasks.length === 0 ? (
        <EmptyState
          icon={CheckSquare}
          title="No tasks yet"
          description="Create your first task to start tracking work."
          action={
            <Link
              href="/tasks/new"
              className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              <Plus className="h-4 w-4" />
              New Task
            </Link>
          }
        />
      ) : (
        <>
          <div className="overflow-hidden bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03]">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Title</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Project</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Priority</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assignee</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tasks.map((task) => (
                  <tr key={task.id} className="hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                      <Link href={`/tasks/${task.id}`} className="text-blue-500 hover:text-blue-600 font-medium">
                        {task.title}
                      </Link>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.project ? (
                        <Link href={`/projects/${task.project.id}`} className="text-blue-500 hover:text-blue-600">
                          {task.project.name}
                        </Link>
                      ) : (
                        '-'
                      )}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusBadge status={task.status} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm"><StatusBadge status={task.priority} /></td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {task.assignee
                        ? `${task.assignee.firstName} ${task.assignee.lastName}`
                        : '-'}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                      {formatDate(task.dueDate)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {meta && meta.totalPages > 1 && (
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} tasks
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
