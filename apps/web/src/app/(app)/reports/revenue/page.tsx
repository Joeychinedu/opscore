'use client';

import { useEffect, useState, useCallback } from 'react';
import { DollarSign, TrendingUp, FileCheck } from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/data/stat-card';
import { DashboardSkeleton } from '@/components/feedback/loading-skeleton';

interface RevenueData {
  monthlyRevenue: { month: string; revenue: number }[];
  totalRevenue: number;
  averagePerMonth: number;
  paidCount: number;
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

export default function RevenueReportPage() {
  const [data, setData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [from, setFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 11);
    return d.toISOString().split('T')[0];
  });
  const [to, setTo] = useState(() => new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (from) params.set('from', from);
      if (to) params.set('to', to);
      const res = await api.get<any>(`/reports/revenue?${params}`);
      setData({
        monthlyRevenue: res.monthly || res.monthlyRevenue || [],
        totalRevenue: res.totalRevenue ?? 0,
        averagePerMonth: res.averagePerMonth ?? 0,
        paidCount: res.paidInvoiceCount ?? res.paidCount ?? 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load revenue report');
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div>
      <PageHeader title="Revenue Report" description="Track your income and payment trends" />

      {/* Date Range Picker */}
      <div className="mb-6 flex items-center gap-3">
        <div>
          <label htmlFor="from-date" className="block text-xs text-gray-500 mb-1">From</label>
          <input
            id="from-date"
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
          />
        </div>
        <div>
          <label htmlFor="to-date" className="block text-xs text-gray-500 mb-1">To</label>
          <input
            id="to-date"
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
          />
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
      )}

      {loading ? (
        <DashboardSkeleton />
      ) : data ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
            <StatCard label="Total Revenue" value={formatCurrency(data.totalRevenue)} icon={DollarSign} />
            <StatCard label="Average / Month" value={formatCurrency(data.averagePerMonth)} icon={TrendingUp} />
            <StatCard label="Paid Invoices" value={data.paidCount} icon={FileCheck} />
          </div>

          {/* Area Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Monthly Revenue</h3>
            {data.monthlyRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={data.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `$${v.toLocaleString()}`} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="#3b82f6"
                    fillOpacity={0.1}
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 py-12 text-center">No revenue data for this period</p>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
