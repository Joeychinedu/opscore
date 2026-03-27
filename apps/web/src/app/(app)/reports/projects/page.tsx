'use client';

import { useEffect, useState } from 'react';
import { FolderKanban } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/data/stat-card';
import { DashboardSkeleton } from '@/components/feedback/loading-skeleton';

interface ProjectReportData {
  byStatus: { status: string; count: number }[];
  avgTasksPerProject: number;
  projectCompletions: { name: string; completionPct: number; taskCount: number }[];
  topProjects: { name: string; completionPct: number; taskCount: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  ACTIVE: '#3b82f6',
  ON_HOLD: '#eab308',
  COMPLETED: '#22c55e',
  CANCELLED: '#6b7280',
};

export default function ProjectReportPage() {
  const [data, setData] = useState<ProjectReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get<any>('/reports/projects');
        // Backend returns: projectsByStatus (object), averageTasksPerProject, projects, topByTaskCount
        const statusObj = res.projectsByStatus || {};
        const byStatus = Object.entries(statusObj).map(([status, count]) => ({ status, count: count as number }));
        const projects = (res.projects || []).map((p: any) => ({
          name: p.name,
          completionPct: p.completionPercentage ?? 0,
          taskCount: p.totalTasks ?? 0,
        }));
        const top = (res.topByTaskCount || []).map((p: any) => ({
          name: p.name,
          completionPct: p.completionPercentage ?? 0,
          taskCount: p.totalTasks ?? 0,
        }));
        setData({
          byStatus,
          avgTasksPerProject: res.averageTasksPerProject ?? 0,
          projectCompletions: projects,
          topProjects: top,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project report');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <DashboardSkeleton />;
  if (error) return <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>;
  if (!data) return null;

  const statusData = data.byStatus.map((s) => ({
    name: s.status.replace(/_/g, ' '),
    count: s.count,
    fill: STATUS_COLORS[s.status] || '#6b7280',
  }));

  return (
    <div>
      <PageHeader title="Project Report" description="Analyze project status and workload" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6">
        <StatCard
          label="Avg Tasks / Project"
          value={Math.round(data.avgTasksPerProject * 10) / 10}
          icon={FolderKanban}
        />
        <StatCard
          label="Total Projects"
          value={data.byStatus.reduce((sum, s) => sum + s.count, 0)}
          icon={FolderKanban}
        />
      </div>

      {/* Projects by Status Bar Chart */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6 mb-6">
        <h3 className="text-sm font-medium text-gray-900 mb-4">Projects by Status</h3>
        {statusData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={statusData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" name="Projects" radius={[4, 4, 0, 0]}>
                {statusData.map((entry, index) => (
                  <Cell key={index} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-sm text-gray-500 py-12 text-center">No project data</p>
        )}
      </div>

      {/* Project Completions Table */}
      <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] overflow-hidden">
        <table className="min-w-full divide-y divide-gray-100">
          <thead className="bg-gray-50/80">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Completion</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">Tasks</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {(data.topProjects.length > 0 ? data.topProjects : data.projectCompletions).map((p, i) => (
              <tr key={i} className="hover:bg-gray-50/50">
                <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-24 rounded-full bg-gray-200">
                      <div
                        className="h-2 rounded-full bg-blue-500"
                        style={{ width: `${Math.min(100, p.completionPct)}%` }}
                      />
                    </div>
                    <span>{Math.round(p.completionPct)}%</span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">{p.taskCount}</td>
              </tr>
            ))}
            {data.topProjects.length === 0 && data.projectCompletions.length === 0 && (
              <tr>
                <td colSpan={3} className="px-6 py-8 text-center text-sm text-gray-500">No project data</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
