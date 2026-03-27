'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';

interface Client {
  id: string;
  name: string;
}

interface Project {
  id: string;
  name: string;
}

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

export default function NewInvoicePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);

  const [clientId, setClientId] = useState('');
  const [projectId, setProjectId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [taxRate, setTaxRate] = useState('');
  const [notes, setNotes] = useState('');
  const [lineItems, setLineItems] = useState<LineItem[]>([
    { description: '', quantity: 1, unitPrice: 0 },
  ]);

  useEffect(() => {
    async function loadClients() {
      try {
        const res = await api.get<any>('/clients?limit=100');
        setClients(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } catch {
        // ignore
      } finally {
        setLoadingClients(false);
      }
    }
    loadClients();
  }, []);

  useEffect(() => {
    if (!clientId) {
      setProjects([]);
      setProjectId('');
      return;
    }
    setLoadingProjects(true);
    setProjectId('');
    async function loadProjects() {
      try {
        const res = await api.get<any>(`/projects?clientId=${clientId}&limit=100`);
        setProjects(Array.isArray(res.data) ? res.data : Array.isArray(res) ? res : []);
      } catch {
        setProjects([]);
      } finally {
        setLoadingProjects(false);
      }
    }
    loadProjects();
  }, [clientId]);

  const updateLineItem = (index: number, field: keyof LineItem, value: string | number) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addLineItem = () => {
    setLineItems((prev) => [...prev, { description: '', quantity: 1, unitPrice: 0 }]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const subtotal = lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
  const taxRateNum = parseFloat(taxRate) || 0;
  const taxAmount = Math.round(subtotal * (taxRateNum / 100));
  const total = subtotal + taxAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId || !dueDate) return;
    if (lineItems.some((li) => !li.description.trim() || li.quantity <= 0 || li.unitPrice <= 0)) {
      setError('All line items must have a description, quantity > 0, and unit price > 0.');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        clientId,
        dueDate,
        lineItems: lineItems.map((li) => ({
          description: li.description,
          quantity: li.quantity,
          unitPrice: li.unitPrice,
        })),
      };
      if (projectId) body.projectId = projectId;
      if (taxRateNum > 0) body.taxRate = taxRateNum;
      if (notes.trim()) body.notes = notes.trim();

      const created = await api.post<{ id: string }>('/invoices', body);
      toast.success('Invoice created');
      router.push(`/invoices/${created.id}`);
    } catch (err) {
      toast.error('Failed to create invoice');
      setError(err instanceof Error ? err.message : 'Failed to create invoice');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400';
  const compactInputClass =
    'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm bg-white shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none placeholder-gray-400';

  return (
    <div>
      <PageHeader title="New Invoice" description="Create a new invoice with line items" />

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
                onChange={(e) => setClientId(e.target.value)}
                required
                disabled={loadingClients}
                className={inputClass}
              >
                <option value="">{loadingClients ? 'Loading...' : 'Select a client'}</option>
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
                disabled={!clientId || loadingProjects}
                className={inputClass}
              >
                <option value="">
                  {!clientId
                    ? 'Select a client first'
                    : loadingProjects
                      ? 'Loading...'
                      : 'Select a project (optional)'}
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

        {/* Line Items */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Line Items</h2>
            <button
              type="button"
              onClick={addLineItem}
              className="inline-flex items-center gap-1.5 bg-white text-gray-700 border border-gray-200 rounded-lg px-3 py-1.5 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              <Plus className="h-4 w-4" />
              Add Line Item
            </button>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-100">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Description</th>
                  <th className="w-24 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Qty</th>
                  <th className="w-32 px-3 py-2 text-left text-xs font-medium uppercase text-gray-500">Unit Price</th>
                  <th className="w-32 px-3 py-2 text-right text-xs font-medium uppercase text-gray-500">Amount</th>
                  <th className="w-12 px-3 py-2" />
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {lineItems.map((item, index) => {
                  const amount = item.quantity * item.unitPrice;
                  return (
                    <tr key={index}>
                      <td className="px-3 py-2">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                          placeholder="Item description"
                          required
                          className={compactInputClass}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          required
                          className={compactInputClass}
                        />
                      </td>
                      <td className="px-3 py-2">
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={item.unitPrice || ''}
                          onChange={(e) => updateLineItem(index, 'unitPrice', parseInt(e.target.value) || 0)}
                          placeholder="0"
                          required
                          className={compactInputClass}
                        />
                      </td>
                      <td className="px-3 py-2 text-right text-sm font-medium text-gray-700">
                        {formatCurrency(amount)}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          type="button"
                          onClick={() => removeLineItem(index)}
                          disabled={lineItems.length <= 1}
                          className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500 disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-gray-400"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Totals */}
          <div className="mt-4 flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Subtotal</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              {taxRateNum > 0 && (
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>Tax ({taxRateNum}%)</span>
                  <span>{formatCurrency(taxAmount)}</span>
                </div>
              )}
              <div className="border-t pt-2">
                <div className="flex items-center justify-between">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-gray-900">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {submitting ? 'Creating...' : 'Create Invoice'}
          </button>
          <Link
            href="/invoices"
            className="bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
