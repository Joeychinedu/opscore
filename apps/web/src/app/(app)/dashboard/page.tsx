'use client';

import { useOrgStore } from '@/lib/hooks/use-org';

export default function DashboardPage() {
  const { currentOrg } = useOrgStore();

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        {currentOrg && (
          <p className="mt-2 text-sm text-gray-600">Workspace: {currentOrg.name}</p>
        )}
        <p className="mt-4 text-gray-500">Content coming in Phase 4</p>
      </div>
    </div>
  );
}
