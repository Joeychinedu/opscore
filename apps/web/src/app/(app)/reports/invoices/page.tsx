'use client';

import { useEffect, useState } from 'react';
import { DollarSign, AlertTriangle, Clock } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/data/stat-card';
import { StatusBadge } from '@/components/data/status-badge';
import { DashboardSkeleton } from '@/components/feedback/loading-skeleton';

interface InvoiceReportData {
  totalOutstanding: number;
  totalOverdue: number;
  byStatus: { status: string; count: number; total: number }[];
  recentInvoices: {
    id: string;
    invoiceNumber: string;
    amount: number;
    status: string;
    dueDate: string;
    client?: { name: string };
  }[];
  avgDaysToPayment: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

const STATUS_COLORS: Record<string, string> = {
  DRAFT: '#6b7280',
  SENT: '#3b82f6',
  PAID: '#22c55e',
  OVERDUE: '#ef4444',
};

export default function InvoiceReportPage() {
  const [data, setData] = useState<InvoiceReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<InvoiceReportData>('/reports/invoices');
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load invoice report');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">{error}</div>;
  if (!data) return null;

  const statusBarData = data.byStatus.map((s) => ({
    name: s.status.replace(/_/g, ' '),
    count: s.count,
    fill: STATUS_COLORS[s.status] || '#6b7280',
  }));

  return (
    <div>
      <PageHeader title="Invoice Report" description="Monitor invoices, payments, and outstanding balances" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <StatCard label="Total Outstanding" value={formatCurrency(data.totalOutstanding)} icon={DollarSign} />
        <StatCard label="Total Overdue" value={formatCurrency(data.totalOverdue)} icon={AlertTriangle} />
        <StatCard label="Avg Days to Payment" value={Math.round(data.avgDaysToPayment)} icon={Clock} />
      </div>

      {/* Bar Chart */}
      <div className="rounded-lg border bg-white p-5 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Invoices by Status</h3>
        {statusBarData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Invoices" radius={[4, 4, 0, 0]}>
                {statusBarData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 py-12 text-center">No invoice data</p>
        )}
      </div>

      {/* Recent Invoices Table */}
      <div className="rounded-lg border bg-white overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Invoice</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Amount</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Due Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.recentInvoices.map((inv) => (
              <tr key={inv.id} className="hover:bg-gray-50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{inv.invoiceNumber}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{inv.client?.name || '-'}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-900">{formatCurrency(inv.amount)}</td>
                <td className="whitespace-nowrap px-6 py-4"><StatusBadge status={inv.status} /></td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  {inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : '-'}
                </td>
              </tr>
            ))}
            {data.recentInvoices.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-sm text-gray-500">No invoices found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
