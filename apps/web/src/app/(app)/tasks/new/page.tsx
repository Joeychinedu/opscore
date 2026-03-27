'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';

interface ProjectOption {
  id: string;
  name: string;
}

interface MemberOption {
  id: string;
  userId: string;
  user: { id: string; firstName: string; lastName: string };
}

const TASK_STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export default function NewTaskPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [projects, setProjects] = useState<ProjectOption[]>([]);
  const [members, setMembers] = useState<MemberOption[]>([]);
  const [form, setForm] = useState({
    title: '',
    description: '',
    projectId: '',
    assigneeId: '',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: '',
  });

  useEffect(() => {
    async function loadOptions() {
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
    loadOptions();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        title: form.title,
        projectId: form.projectId,
        status: form.status,
        priority: form.priority,
      };
      if (form.description) body.description = form.description;
      if (form.assigneeId) body.assigneeId = form.assigneeId;
      if (form.dueDate) body.dueDate = form.dueDate;
      await api.post('/tasks', body);
      toast.success('Task created');
      router.push('/tasks');
    } catch (err) {
      toast.error('Failed to create task');
      setError(err instanceof Error ? err.message : 'Failed to create task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Task" description="Create a new task" />

      {error && (
        <div className="mb-4 bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className="mb-1.5 block text-sm font-medium text-gray-700">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              name="title"
              type="text"
              required
              value={form.title}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400"
              placeholder="Task title"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1.5 block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400"
              placeholder="Describe the task..."
            />
          </div>

          <div>
            <label htmlFor="projectId" className="mb-1.5 block text-sm font-medium text-gray-700">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="projectId"
              name="projectId"
              required
              value={form.projectId}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              <option value="">Select a project</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="assigneeId" className="mb-1.5 block text-sm font-medium text-gray-700">
              Assignee
            </label>
            <select
              id="assigneeId"
              name="assigneeId"
              value={form.assigneeId}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              <option value="">Unassigned</option>
              {members.map((m) => (
                <option key={m.id} value={m.user?.id || m.userId}>
                  {m.user ? `${m.user.firstName} ${m.user.lastName}` : m.userId}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="mb-1.5 block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              {TASK_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="priority" className="mb-1.5 block text-sm font-medium text-gray-700">
              Priority
            </label>
            <select
              id="priority"
              name="priority"
              value={form.priority}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium text-gray-700">
              Due Date
            </label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Task'}
          </button>
          <Link
            href="/tasks"
            className="bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
