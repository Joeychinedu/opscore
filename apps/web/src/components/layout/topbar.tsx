'use client';

import { useAuthStore } from '@/lib/auth';
import { useOrgStore } from '@/lib/hooks/use-org';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';

export function Topbar() {
  const { user, logout } = useAuthStore();
  const { currentOrg } = useOrgStore();
  const router = useRouter();

  const handleLogout = () => { logout(); router.push('/login'); };

  return (
    <header className="h-14 border-b bg-white flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-10">
      <div className="text-sm text-gray-500">{currentOrg?.name || 'No workspace'}</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.firstName} {user?.lastName}</span>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
