'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Calendar, DollarSign, Users as UsersIcon } from 'lucide-react';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
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
}

interface ProjectMember {
  id: string;
  userId: string;
  user?: { firstName: string; lastName: string; email: string };
}

interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  dueDate: string | null;
  budget: number | null;
  client: { id: string; name: string } | null;
  tasks: Task[];
  members: ProjectMember[];
  _count: { tasks: number; members: number };
}

const TASK_STATUSES = ['', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskFilter, setTaskFilter] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<ProjectDetail>(`/projects/${params.id}`);
        setProject(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div>
        <PageHeader title="Project" />
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  const doneTasks = project.tasks.filter((t) => t.status === 'DONE').length;
  const totalTasks = project.tasks.length;
  const progressPct = totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0;

  const filteredTasks = taskFilter
    ? project.tasks.filter((t) => t.status === taskFilter)
    : project.tasks;

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString();
  };

  return (
    <div>
      <PageHeader
        title={project.name}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
            <Link
              href={`/projects/${project.id}/edit`}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Edit
            </Link>
          </div>
        }
      />

      {/* Progress bar */}
      <div className="mb-6 rounded-lg border bg-white p-4">
        <div className="mb-2 flex items-center justify-between text-sm">
          <span className="font-medium text-gray-700">Progress</span>
          <span className="text-gray-500">{doneTasks}/{totalTasks} tasks completed ({progressPct}%)</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
          <div
            className="h-full rounded-full bg-green-500 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left: Tasks */}
        <div className="space-y-6 lg:col-span-2">
          <div className="rounded-lg border bg-white p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">Tasks ({totalTasks})</h2>
              <select
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
                className="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All</option>
                {TASK_STATUSES.filter(Boolean).map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
            {filteredTasks.length === 0 ? (
              <p className="text-sm text-gray-400">No tasks found.</p>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Assignee</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Due</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredTasks.map((task) => (
                      <tr key={task.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm">
                          <Link href={`/tasks/${task.id}`} className="font-medium text-blue-600 hover:text-blue-500">
                            {task.title}
                          </Link>
                        </td>
                        <td className="px-4 py-2 text-sm"><StatusBadge status={task.status} /></td>
                        <td className="px-4 py-2 text-sm"><StatusBadge status={task.priority} /></td>
                        <td className="px-4 py-2 text-sm text-gray-500">
                          {task.assignee
                            ? `${task.assignee.firstName} ${task.assignee.lastName}`
                            : '-'}
                        </td>
                        <td className="px-4 py-2 text-sm text-gray-500">{formatDate(task.dueDate)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Members */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Members ({project._count.members})
            </h2>
            {project.members.length === 0 ? (
              <p className="text-sm text-gray-400">No members assigned.</p>
            ) : (
              <div className="flex flex-wrap gap-3">
                {project.members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 rounded-full border bg-gray-50 px-3 py-1.5"
                  >
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600">
                      {member.user
                        ? `${member.user.firstName[0]}${member.user.lastName[0]}`
                        : <UsersIcon className="h-3 w-3" />}
                    </div>
                    <span className="text-sm text-gray-700">
                      {member.user
                        ? `${member.user.firstName} ${member.user.lastName}`
                        : member.userId}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Project info */}
        <div>
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Project Info</h2>
            <dl className="space-y-4">
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">Client</dt>
                <dd className="mt-1 text-sm text-gray-700">
                  {project.client ? (
                    <Link href={`/clients/${project.client.id}`} className="text-blue-600 hover:text-blue-500">
                      {project.client.name}
                    </Link>
                  ) : (
                    '-'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-medium uppercase text-gray-400">Status</dt>
                <dd className="mt-1"><StatusBadge status={project.status} /></dd>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Start Date</dt>
                  <dd className="text-sm text-gray-700">{formatDate(project.startDate)}</dd>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Due Date</dt>
                  <dd className="text-sm text-gray-700">{formatDate(project.dueDate)}</dd>
                </div>
              </div>
              {project.budget !== null && (
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-gray-400" />
                  <div>
                    <dt className="text-xs font-medium uppercase text-gray-400">Budget</dt>
                    <dd className="text-sm text-gray-700">
                      ${project.budget.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </dd>
                  </div>
                </div>
              )}
              {project.description && (
                <div>
                  <dt className="text-xs font-medium uppercase text-gray-400">Description</dt>
                  <dd className="mt-1 text-sm text-gray-700">{project.description}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}
