'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';

interface ClientOption {
  id: string;
  name: string;
}

const PROJECT_STATUSES = ['ACTIVE', 'ON_HOLD', 'COMPLETED', 'CANCELLED'];

export default function NewProjectPage() {
  const router = useRouter();
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
    async function loadClients() {
      try {
        const res = await api.get<any>('/clients?limit=100');
        setClients(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } catch {
        // Non-critical
      }
    }
    loadClients();
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
        name: form.name,
        status: form.status,
      };
      if (form.description) body.description = form.description;
      if (form.clientId) body.clientId = form.clientId;
      if (form.startDate) body.startDate = form.startDate;
      if (form.dueDate) body.dueDate = form.dueDate;
      if (form.budget) body.budget = parseFloat(form.budget);
      await api.post('/projects', body);
      toast.success('Project created');
      router.push('/projects');
    } catch (err) {
      toast.error('Failed to create project');
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <PageHeader title="New Project" description="Create a new project" />

      {error && (
        <div className="mb-4 bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400"
              placeholder="Project name"
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
              placeholder="Project description..."
            />
          </div>

          <div>
            <label htmlFor="clientId" className="mb-1.5 block text-sm font-medium text-gray-700">
              Client
            </label>
            <select
              id="clientId"
              name="clientId"
              value={form.clientId}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              <option value="">No client</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
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
              {PROJECT_STATUSES.map((s) => (
                <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="startDate" className="mb-1.5 block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              value={form.startDate}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            />
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

          <div>
            <label htmlFor="budget" className="mb-1.5 block text-sm font-medium text-gray-700">
              Budget
            </label>
            <input
              id="budget"
              name="budget"
              type="number"
              step="0.01"
              min="0"
              value={form.budget}
              onChange={handleChange}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400"
              placeholder="0.00"
            />
          </div>
        </div>

        <div className="mt-6 flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Project'}
          </button>
          <Link
            href="/projects"
            className="bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
