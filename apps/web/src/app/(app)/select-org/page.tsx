'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useOrgStore } from '@/lib/hooks/use-org';

export default function SelectOrgPage() {
  const router = useRouter();
  const { orgs, isLoading, fetchOrgs, selectOrg } = useOrgStore();

  useEffect(() => {
    fetchOrgs();
  }, [fetchOrgs]);

  const handleSelect = (org: (typeof orgs)[0]) => {
    selectOrg(org);
    router.push('/dashboard');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading workspaces...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-lg space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Select a workspace</h1>
          <p className="mt-1 text-sm text-gray-600">
            Choose a workspace to continue
          </p>
        </div>

        {orgs.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-8 text-center">
            <p className="text-gray-600">No workspaces yet.</p>
            <Link
              href="/create-org"
              className="mt-4 inline-block bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all"
            >
              Create workspace
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {orgs.map((org) => (
              <button
                key={org.id}
                onClick={() => handleSelect(org)}
                className="w-full bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-4 text-left transition-all hover:border-blue-300 hover:shadow-xl border border-transparent"
              >
                <div className="font-medium text-gray-900">{org.name}</div>
                <div className="text-sm text-gray-500">{org.slug}</div>
              </button>
            ))}
            <div className="pt-2 text-center">
              <Link
                href="/create-org"
                className="text-sm text-blue-500 hover:text-blue-600 font-medium"
              >
                Create a new workspace
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
