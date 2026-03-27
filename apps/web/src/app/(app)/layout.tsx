'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useOrgStore } from '@/lib/hooks/use-org';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { user, isLoading: authLoading, init: initAuth } = useAuthStore();
  const { init: initOrg } = useOrgStore();

  useEffect(() => {
    initAuth();
    initOrg();
  }, [initAuth, initOrg]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [authLoading, user, router]);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
