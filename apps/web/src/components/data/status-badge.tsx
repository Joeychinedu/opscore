import { cn } from '@/lib/utils';

const statusColors: Record<string, string> = {
  ACTIVE: 'bg-green-50 text-green-700 border-green-200',
  ON_HOLD: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200',
  CANCELLED: 'bg-gray-50 text-gray-700 border-gray-200',
  TODO: 'bg-gray-50 text-gray-700 border-gray-200',
  IN_PROGRESS: 'bg-blue-50 text-blue-700 border-blue-200',
  IN_REVIEW: 'bg-purple-50 text-purple-700 border-purple-200',
  DONE: 'bg-green-50 text-green-700 border-green-200',
  LOW: 'bg-gray-50 text-gray-600 border-gray-200',
  MEDIUM: 'bg-blue-50 text-blue-700 border-blue-200',
  HIGH: 'bg-orange-50 text-orange-700 border-orange-200',
  URGENT: 'bg-red-50 text-red-700 border-red-200',
  DRAFT: 'bg-gray-50 text-gray-700 border-gray-200',
  SENT: 'bg-blue-50 text-blue-700 border-blue-200',
  PAID: 'bg-green-50 text-green-700 border-green-200',
  OVERDUE: 'bg-red-50 text-red-700 border-red-200',
  OWNER: 'bg-purple-50 text-purple-700 border-purple-200',
  ADMIN: 'bg-blue-50 text-blue-700 border-blue-200',
  MANAGER: 'bg-green-50 text-green-700 border-green-200',
  MEMBER: 'bg-gray-50 text-gray-700 border-gray-200',
};

export function StatusBadge({ status }: { status: string }) {
  const display = status.replace(/_/g, ' ');
  return (
    <span className={cn('inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium', statusColors[status] || 'bg-gray-50 text-gray-700 border-gray-200')}>
      {display}
    </span>
  );
}
