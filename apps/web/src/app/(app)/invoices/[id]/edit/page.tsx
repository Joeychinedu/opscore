'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface InvoiceDetail {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  taxRate: number | null;
  notes: string | null;
  client: { id: string; name: string };
  project: { id: string; name: string } | null;
  lineItems: LineItem[];
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function EditInvoicePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();

  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [inv, clientRes] = await Promise.all([
          api.get<InvoiceDetail>(`/invoices/${params.id}`),
          api.get<{ data: Client[] }>('/clients?limit=100'),
        ]);

        if (inv.status !== 'DRAFT') {
          router.replace(`/invoices/${params.id}`);
          return;
        }

        setInvoice(inv);
        setClients(clientRes.data);
        setClientId(inv.client.id);
        setProjectId(inv.project?.id || '');
        setDueDate(inv.dueDate ? inv.dueDate.split('T')[0] : '');
        setTaxRate(inv.taxRate != null ? String(inv.taxRate) : '');
        setNotes(inv.notes || '');

        // Load projects for the client
        if (inv.client.id) {
          const projRes = await api.get<{ data: Project[] }>(
            `/projects?clientId=${inv.client.id}&limit=100`,
          );
          setProjects(projRes.data);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  useEffect(() => {
    if (!clientId || loading) return;
    async function loadProjects() {
      try {
        const res = await api.get<{ data: Project[] }>(`/projects?clientId=${clientId}&limit=100`);
        setProjects(res.data);
      } catch {
        setProjects([]);
      }
    }
    loadProjects();
  }, [clientId, loading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !dueDate) return;

    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        clientId,
        dueDate,
      };
      if (projectId) body.projectId = projectId;
      const taxRateNum = parseFloat(taxRate) || 0;
      if (taxRateNum > 0) body.taxRate = taxRateNum;
      if (notes.trim()) body.notes = notes.trim();

      await api.patch(`/invoices/${params.id}`, body);
      toast.success('Invoice updated');
      router.push(`/invoices/${params.id}`);
    } catch (err) {
      toast.error('Failed to update invoice');
      setError(err instanceof Error ? err.message : 'Failed to update invoice');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (error && !invoice) {
    return (
      <div>
        <PageHeader title="Edit Invoice" />
        <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">
          {error || 'Invoice not found'}
        </div>
      </div>
    );
  }

  if (!invoice) return null;

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400';

  return (
    <div>
      <PageHeader
        title={`Edit Invoice ${invoice.number}`}
        description="Only DRAFT invoices can be edited"
      />

      {error && (
        <div className="mb-4 bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Invoice Details */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">Invoice Details</h2>
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="clientId" className="mb-1.5 block text-sm font-medium text-gray-700">
                Client <span className="text-red-500">*</span>
              </label>
              <select
                id="clientId"
                value={clientId}
                onChange={(e) => {
                  setClientId(e.target.value);
                  setProjectId('');
                }}
                required
                className={inputClass}
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="projectId" className="mb-1.5 block text-sm font-medium text-gray-700">
                Project
              </label>
              <select
                id="projectId"
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={!clientId}
                className={inputClass}
              >
                <option value="">
                  {!clientId ? 'Select a client first' : 'Select a project (optional)'}
                </option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="dueDate" className="mb-1.5 block text-sm font-medium text-gray-700">
                Due Date <span className="text-red-500">*</span>
              </label>
              <input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                required
                className={inputClass}
              />
            </div>

            <div>
              <label htmlFor="taxRate" className="mb-1.5 block text-sm font-medium text-gray-700">
                Tax Rate (%)
              </label>
              <input
                id="taxRate"
                type="number"
                min="0"
                max="100"
                step="0.01"
                value={taxRate}
                onChange={(e) => setTaxRate(e.target.value)}
                placeholder="0"
                className={inputClass}
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="notes" className="mb-1.5 block text-sm font-medium text-gray-700">
                Notes
              </label>
              <textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Additional notes for the invoice..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Read-only Line Items */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <h2 className="mb-4 text-sm font-semibold text-gray-900">
            Line Items <span className="text-xs font-normal text-gray-400">(read-only)</span>
          </h2>
          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                    Description
                  </th>
                  <th className="w-20 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Qty
                  </th>
                  <th className="w-28 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Unit Price
                  </th>
                  <th className="w-28 px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-gray-50/50">
                {invoice.lineItems.map((item) => (
                  <tr key={item.id}>
                    <td className="px-4 py-3 text-sm text-gray-700">{item.description}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">{item.quantity}</td>
                    <td className="px-4 py-3 text-right text-sm text-gray-700">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-gray-900">
                      {formatCurrency(item.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
          <Link
            href={`/invoices/${invoice.id}`}
            className="bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
