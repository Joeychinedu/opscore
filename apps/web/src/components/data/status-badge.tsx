import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-50/80 text-green-700 border-green-200/60',
  ON_HOLD: 'bg-yellow-50/80 text-yellow-700 border-yellow-200/60',
  COMPLETED: 'bg-blue-50/80 text-blue-700 border-blue-200/60',
  CANCELLED: 'bg-gray-50/80 text-gray-600 border-gray-200/60',
  TODO: 'bg-gray-50/80 text-gray-600 border-gray-200/60',
  IN_PROGRESS: 'bg-blue-50/80 text-blue-700 border-blue-200/60',
  IN_REVIEW: 'bg-purple-50/80 text-purple-700 border-purple-200/60',
  DONE: 'bg-green-50/80 text-green-700 border-green-200/60',
  LOW: 'bg-gray-50/80 text-gray-600 border-gray-200/60',
  MEDIUM: 'bg-blue-50/80 text-blue-700 border-blue-200/60',
  HIGH: 'bg-orange-50/80 text-orange-700 border-orange-200/60',
  URGENT: 'bg-red-50/80 text-red-700 border-red-200/60',
  DRAFT: 'bg-gray-50/80 text-gray-600 border-gray-200/60',
  SENT: 'bg-blue-50/80 text-blue-700 border-blue-200/60',
  PAID: 'bg-green-50/80 text-green-700 border-green-200/60',
  OVERDUE: 'bg-red-50/80 text-red-700 border-red-200/60',
  OWNER: 'bg-purple-50/80 text-purple-700 border-purple-200/60',
  ADMIN: 'bg-blue-50/80 text-blue-700 border-blue-200/60',
  MANAGER: 'bg-green-50/80 text-green-700 border-green-200/60',
  MEMBER: 'bg-gray-50/80 text-gray-600 border-gray-200/60',
};

export function StatusBadge({ status }: { status: string }) {
  const display = status.replace(/_/g, ' ');
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium', statusColors[status] || 'bg-gray-50/80 text-gray-600 border-gray-200/60')}>
      {display}
    </span>
  );
}
