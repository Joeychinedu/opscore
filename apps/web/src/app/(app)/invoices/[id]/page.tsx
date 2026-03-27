'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Send, CheckCircle, Download } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/data/status-badge';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface InvoiceDetail {
  id: string;
  number: string;
  status: string;
  issueDate: string;
  dueDate: string;
  taxRate: number | null;
  taxAmount: number;
  subtotal: number;
  total: number;
  notes: string | null;
  client: { id: string; name: string; email: string | null };
  project: { id: string; name: string } | null;
  lineItems: LineItem[];
}

function formatCurrency(cents: number) {
  return `$${(cents / 100).toFixed(2)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString();
}

export default function InvoiceDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [invoice, setInvoice] = useState<InvoiceDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<InvoiceDetail>(`/invoices/${params.id}`);
        setInvoice(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleSend = async () => {
    if (!invoice) return;
    setActionLoading(true);
    try {
      await api.post(`/invoices/${invoice.id}/send`);
      setInvoice((prev) => (prev ? { ...prev, status: 'SENT' } : prev));
      toast.success('Invoice sent');
    } catch (err) {
      toast.error('Failed to send invoice');
      setError(err instanceof Error ? err.message : 'Failed to send invoice');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    if (!invoice) return;
    setActionLoading(true);
    try {
      await api.post(`/invoices/${invoice.id}/mark-paid`);
      setInvoice((prev) => (prev ? { ...prev, status: 'PAID' } : prev));
      toast.success('Invoice marked as paid');
    } catch (err) {
      toast.error('Failed to mark invoice as paid');
      setError(err instanceof Error ? err.message : 'Failed to mark invoice as paid');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!invoice) return;
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api';
    window.open(`${apiBase}/invoices/${invoice.id}/pdf`, '_blank');
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <TableSkeleton rows={4} cols={4} />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div>
        <PageHeader title="Invoice" />
        <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">
          {error || 'Invoice not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={`Invoice ${invoice.number}`}
        action={
          <div className="flex items-center gap-3">
            <StatusBadge status={invoice.status} />

            {invoice.status === 'DRAFT' && (
              <>
                <button
                  onClick={handleSend}
                  disabled={actionLoading}
                  className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
                >
                  <Send className="h-4 w-4" />
                  Send Invoice
                </button>
                <Link
                  href={`/invoices/${invoice.id}/edit`}
                  className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Edit
                </Link>
              </>
            )}

            {invoice.status === 'SENT' && (
              <button
                onClick={handleMarkPaid}
                disabled={actionLoading}
                className="inline-flex items-center gap-2 bg-gradient-to-t from-green-600 to-green-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
              >
                <CheckCircle className="h-4 w-4" />
                Mark as Paid
              </button>
            )}

            <button
              onClick={handleDownloadPdf}
              className="inline-flex items-center gap-2 bg-white text-gray-700 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        }
      />

      {/* Invoice Preview Card */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl shadow-black/[0.06] p-8">
        {/* Invoice Header */}
        <div className="mb-8 flex items-start justify-between border-b pb-6">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">INVOICE</h2>
            <p className="mt-1 text-lg text-gray-600">{invoice.number}</p>
          </div>
          <div className="text-right text-sm text-gray-500">
            <p>
              <span className="font-medium text-gray-700">Issue Date:</span>{' '}
              {formatDate(invoice.issueDate)}
            </p>
            <p className="mt-1">
              <span className="font-medium text-gray-700">Due Date:</span>{' '}
              {formatDate(invoice.dueDate)}
            </p>
          </div>
        </div>

        {/* Bill To */}
        <div className="mb-8">
          <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
            Bill To
          </h3>
          <p className="text-sm font-medium text-gray-900">{invoice.client.name}</p>
          {invoice.client.email && (
            <p className="text-sm text-gray-500">{invoice.client.email}</p>
          )}
          {invoice.project && (
            <p className="mt-1 text-sm text-gray-500">
              Project:{' '}
              <Link
                href={`/projects/${invoice.project.id}`}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                {invoice.project.name}
              </Link>
            </p>
          )}
        </div>

        {/* Line Items Table */}
        <div className="mb-6 overflow-hidden rounded-xl border border-gray-100">
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
            <tbody className="divide-y divide-gray-100">
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

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72 space-y-2">
            <div className="flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subtotal)}</span>
            </div>
            {invoice.taxRate !== null && invoice.taxRate > 0 && (
              <div className="flex items-center justify-between text-sm text-gray-600">
                <span>Tax ({invoice.taxRate}%)</span>
                <span>{formatCurrency(invoice.taxAmount)}</span>
              </div>
            )}
            <div className="border-t pt-3">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold text-gray-900">Total</span>
                <span className="text-xl font-bold text-gray-900">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes && (
          <div className="mt-8 border-t pt-6">
            <h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-gray-400">
              Notes
            </h3>
            <p className="whitespace-pre-wrap text-sm text-gray-600">{invoice.notes}</p>
          </div>
        )}
      </div>
    </div>
  );
}
