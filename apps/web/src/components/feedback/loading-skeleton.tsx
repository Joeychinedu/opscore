import { cn } from '@/lib/utils';

function Skeleton({ className }: { className?: string }) {
  return <div className={cn('animate-pulse rounded-xl bg-gray-200/60', className)} />;
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-4 space-y-3">
      <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
        {Array.from({ length: cols }).map((_, i) => <Skeleton key={i} className="h-4" />)}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => <Skeleton key={c} className="h-8" />)}
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-2xl" />)}
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-64 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    </div>
  );
}
