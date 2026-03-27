'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Users, FolderKanban, CheckSquare, DollarSign, Clock, ArrowRight } from 'lucide-react';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from 'recharts';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/data/stat-card';
import { StatusBadge } from '@/components/data/status-badge';
import { DashboardSkeleton } from '@/components/feedback/loading-skeleton';

interface DashboardData {
  totalClients: number;
  activeProjects: number;
  tasksDueThisWeek: number;
  revenueThisMonth: number;
  tasksByStatus: { status: string; count: number }[];
  invoiceSummary: { status: string; count: number; total: number }[];
  recentActivity: {
    id: string;
    action: string;
    entity: string;
    entityId: string;
    description: string;
    createdAt: string;
    user: { firstName: string; lastName: string };
  }[];
  upcomingTasks: {
    id: string;
    title: string;
    dueDate: string;
    status: string;
    priority: string;
    project?: { name: string };
  }[];
}

function timeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0 }).format(amount);
}

const CHART_COLORS: Record<string, string> = {
  TODO: '#6b7280',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#8b5cf6',
  DONE: '#22c55e',
  DRAFT: '#6b7280',
  SENT: '#3b82f6',
  PAID: '#22c55e',
  OVERDUE: '#ef4444',
};

const PIE_COLORS = ['#6b7280', '#3b82f6', '#8b5cf6', '#22c55e'];

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<DashboardData>('/dashboard');
        setData(res);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;

  if (error) {
    return (
      <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
    );
  }

  if (!data) return null;

  const tasksPieData = data.tasksByStatus.map((t) => ({
    name: t.status.replace(/_/g, ' '),
    value: t.count,
    color: CHART_COLORS[t.status] || '#6b7280',
  }));

  const invoiceBarData = data.invoiceSummary.map((i) => ({
    name: i.status.replace(/_/g, ' '),
    count: i.count,
    total: i.total,
    fill: CHART_COLORS[i.status] || '#6b7280',
  }));

  return (
    <div>
      <PageHeader title="Dashboard" description="Overview of your workspace" />

      {/* Stat Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard label="Total Clients" value={data.totalClients} icon={Users} />
        <StatCard label="Active Projects" value={data.activeProjects} icon={FolderKanban} />
        <StatCard label="Tasks Due This Week" value={data.tasksDueThisWeek} icon={CheckSquare} />
        <StatCard label="Revenue This Month" value={formatCurrency(data.revenueThisMonth)} icon={DollarSign} />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
        {/* Tasks by Status - Pie Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Tasks by Status</h3>
          {tasksPieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  dataKey="value"
                  nameKey="name"
                  paddingAngle={2}
                >
                  {tasksPieData.map((entry, index) => (
                    <Cell key={index} fill={entry.color || PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-12 text-center">No task data yet</p>
          )}
        </div>

        {/* Invoice Summary - Bar Chart */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Invoice Summary</h3>
          {invoiceBarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={invoiceBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" name="Count" radius={[4, 4, 0, 0]}>
                  {invoiceBarData.map((entry, index) => (
                    <Cell key={index} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 py-12 text-center">No invoice data yet</p>
          )}
        </div>
      </div>

      {/* Bottom Row: Upcoming Tasks + Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Upcoming Tasks */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Upcoming Tasks</h3>
            <Link href="/tasks" className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.upcomingTasks.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingTasks.map((task) => (
                <div key={task.id} className="flex items-start justify-between gap-3 hover:bg-gray-50/50 rounded-lg p-2 -mx-2 transition-colors">
                  <div className="min-w-0 flex-1">
                    <Link href={`/tasks/${task.id}`} className="text-sm font-medium text-gray-900 hover:text-blue-500 truncate block">
                      {task.title}
                    </Link>
                    {task.project && (
                      <p className="text-xs text-gray-500 mt-0.5">{task.project.name}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={task.status} />
                    {task.dueDate && (
                      <span className="flex items-center gap-1 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">No upcoming tasks</p>
          )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Recent Activity</h3>
            <Link href="/team/activity" className="text-xs text-blue-500 hover:text-blue-600 font-medium flex items-center gap-1">
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          {data.recentActivity.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3 border-l-2 border-blue-200 pl-3 hover:bg-gray-50/50 rounded-r-lg transition-colors">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-gray-900">
                      <span className="font-medium">{activity.user.firstName} {activity.user.lastName}</span>{' '}
                      {activity.description}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">{timeAgo(activity.createdAt)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500 py-8 text-center">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  );
}
