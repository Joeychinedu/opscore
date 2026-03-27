'use client';

import { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { DashboardSkeleton } from '@/components/feedback/loading-skeleton';
import { EmptyState } from '@/components/data/empty-state';

interface TeamMember {
  userId: string;
  firstName: string;
  lastName: string;
  assigned: number;
  completed: number;
  inProgress: number;
}

interface TeamReportData {
  members: TeamMember[];
}

export default function TeamReportPage() {
  const [data, setData] = useState<TeamReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<any>('/reports/team');
        setData({
          members: res.members || [],
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load team report');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>;
  if (!data) return null;

  const chartData = data.members.map((m) => ({
    name: `${m.firstName} ${m.lastName[0]}.`,
    Completed: m.completed,
    'In Progress': m.inProgress,
    Assigned: m.assigned,
  }));

  return (
    <div>
      <PageHeader title="Team Report" description="Team member productivity and task distribution" />

      {data.members.length === 0 ? (
        <EmptyState icon={Users} title="No team data" description="Team member stats will appear once tasks are assigned." />
      ) : (
        <>
          {/* Bar Chart */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-4">Tasks by Team Member</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="Completed" fill="#22c55e" radius={[4, 4, 0, 0]} />
                <Bar dataKey="In Progress" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Table */}
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] overflow-hidden">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50/80">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Member</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Assigned</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Completed</th>
                  <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">In Progress</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {data.members.map((m) => (
                  <tr key={m.userId} className="hover:bg-gray-50/50">
                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">
                      {m.firstName} {m.lastName}
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.assigned}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.completed}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{m.inProgress}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
