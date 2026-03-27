'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Calendar, User, FolderKanban } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/data/status-badge';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface TaskDetail {
  id: string;
  title: string;
  description: string | null;
  status: string;
  priority: string;
  dueDate: string | null;
  createdAt: string;
  assignee: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  project: {
    id: string;
    name: string;
  } | null;
}

const STATUS_FLOW = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function TaskDetailPage() {
  const params = useParams<{ id: string }>();
  const [task, setTask] = useState<TaskDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<TaskDetail>(`/tasks/${params.id}`);
        setTask(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load task');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleStatusChange = async (newStatus: string) => {
    if (!task || updatingStatus) return;
    setUpdatingStatus(true);
    try {
      const updated = await api.patch<TaskDetail>(`/tasks/${params.id}`, { status: newStatus });
      setTask((prev) => (prev ? { ...prev, status: updated.status ?? newStatus } : prev));
      toast.success('Task updated');
    } catch {
      toast.error('Failed to update task');
    } finally {
      setUpdatingStatus(false);
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <TableSkeleton rows={3} cols={2} />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div>
        <PageHeader title="Task" />
        <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">
          {error || 'Task not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={task.title}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={task.priority} />
            <Link
              href={`/tasks/${task.id}/edit`}
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </div>
        }
      />

      {/* Quick status update */}
      <div className="mb-6 bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-4">
        <h3 className="mb-3 text-sm font-medium text-gray-700">Status</h3>
        <div className="flex flex-wrap gap-2">
          {STATUS_FLOW.map((status) => (
            <button
              key={status}
              onClick={() => handleStatusChange(status)}
              disabled={updatingStatus || task.status === status}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-all disabled:opacity-50 ${
                task.status === status
                  ? 'bg-gradient-to-t from-blue-600 to-blue-500 text-white shadow-sm'
                  : 'border border-gray-200 text-gray-700 hover:bg-gray-50 hover:border-blue-200'
              }`}
            >
              {status.replace(/_/g, ' ')}
            </button>
          ))}
        </div>
      </div>

      {/* Task info */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Task Details</h2>
        <dl className="grid gap-6 sm:grid-cols-2">
          <div className="flex items-start gap-3">
            <FolderKanban className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs font-medium uppercase text-gray-400">Project</dt>
              <dd className="mt-1 text-sm text-gray-700">
                {task.project ? (
                  <Link href={`/projects/${task.project.id}`} className="text-blue-500 hover:text-blue-600 font-medium">
                    {task.project.name}
                  </Link>
                ) : (
                  '-'
                )}
              </dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs font-medium uppercase text-gray-400">Assignee</dt>
              <dd className="mt-1 text-sm text-gray-700">
                {task.assignee
                  ? `${task.assignee.firstName} ${task.assignee.lastName}`
                  : 'Unassigned'}
              </dd>
            </div>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Status</dt>
            <dd className="mt-1"><StatusBadge status={task.status} /></dd>
          </div>

          <div>
            <dt className="text-xs font-medium uppercase text-gray-400">Priority</dt>
            <dd className="mt-1"><StatusBadge status={task.priority} /></dd>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs font-medium uppercase text-gray-400">Due Date</dt>
              <dd className="mt-1 text-sm text-gray-700">{formatDate(task.dueDate)}</dd>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Calendar className="mt-0.5 h-4 w-4 text-gray-400" />
            <div>
              <dt className="text-xs font-medium uppercase text-gray-400">Created</dt>
              <dd className="mt-1 text-sm text-gray-700">{formatDate(task.createdAt)}</dd>
            </div>
          </div>

          {task.description && (
            <div className="sm:col-span-2">
              <dt className="text-xs font-medium uppercase text-gray-400">Description</dt>
              <dd className="mt-1 text-sm text-gray-700 whitespace-pre-wrap">{task.description}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}
