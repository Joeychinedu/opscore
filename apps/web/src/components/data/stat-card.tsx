import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; label: string };
}

export function StatCard({ label, value, icon: Icon, trend }: StatCardProps) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-medium text-gray-500">{label}</span>
        <div className="rounded-xl bg-blue-50 p-2">
          <Icon className="h-4 w-4 text-blue-500" />
        </div>
      </div>
      <div className="text-3xl font-bold text-gray-900 tracking-tight">{value}</div>
      {trend && (
        <p className={`text-xs mt-1 ${trend.value >= 0 ? 'text-green-500' : 'text-red-500'}`}>
          {trend.value >= 0 ? '+' : ''}{trend.value}% {trend.label}
        </p>
      )}
    </div>
  );
}
