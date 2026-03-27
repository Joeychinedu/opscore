'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface ClientOption {
  id: string;
  name: string;
}

interface ProjectData {
  id: string;
  name: string;
  description: string | null;
  status: string;
  clientId: string | null;
  startDate: string | null;
  dueDate: string | null;
  budget: number | null;
}

const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export default function EditProjectPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [form, setForm] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'ACTIVE',
    startDate: '',
    dueDate: '',
    budget: '',
  });

  useEffect(() => {
    async function load() {
      try {
        const [project, clientsRes] = await Promise.all([
          api.get<ProjectData>(`/projects/${params.id}`),
          api.get<{ data: ClientOption[] }>('/clients?limit=100'),
        ]);
        setClients(clientsRes.data);
        setForm({
          name: project.name,
          description: project.description || '',
          clientId: project.clientId || '',
          status: project.status,
          startDate: project.startDate ? project.startDate.slice(0, 10) : '',
          dueDate: project.dueDate ? project.dueDate.slice(0, 10) : '',
          budget: project.budget !== null ? String(project.budget) : '',
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

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
        name: form.name,
        status: form.status,
      };
      if (form.description) body.description = form.description;
      if (form.clientId) body.clientId = form.clientId;
      if (form.startDate) body.startDate = form.startDate;
      if (form.dueDate) body.dueDate = form.dueDate;
      if (form.budget) body.budget = parseFloat(form.budget);
      await api.patch(`/projects/${params.id}`, body);
      router.push(`/projects/${params.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Edit Project" />
        <TableSkeleton rows={3} cols={2} />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Project" />

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="rounded-lg border bg-white p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">Description</label>
            <textarea
              id="description"
              name="description"
              rows={3}
              value={form.description}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="clientId" className="mb-1 block text-sm font-medium text-gray-700">Client</label>
            <select
              id="clientId"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="status" className="mb-1 block text-sm font-medium text-gray-700">Status</label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="mb-1 block text-sm font-medium text-gray-700">Start Date</label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="dueDate" className="mb-1 block text-sm font-medium text-gray-700">Due Date</label>
            <input
              id="dueDate"
              name="dueDate"
              type="date"
              value={form.dueDate}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label htmlFor="budget" className="mb-1 block text-sm font-medium text-gray-700">Budget</label>
            <input
              id="budget"
              name="budget"
              type="number"
              step="0.01"
              min="0"
              value={form.budget}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/projects/${params.id}`}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
