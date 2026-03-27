'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/auth';
import { useOrgStore } from '@/lib/hooks/use-org';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading: authLoading, init: initAuth } = useAuthStore();
  const { init: initOrg } = useOrgStore();
  const router = useRouter();

  useEffect(() => { initAuth(); initOrg(); }, []);
  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [authLoading, user, router]);

  if (authLoading || !user) {
    return <div className="min-h-screen flex items-center justify-center text-gray-400">Loading...</div>;
  }

  return <AppShell>{children}</AppShell>;
}
