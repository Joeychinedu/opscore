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

  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : '';

  return (
    <header className="h-14 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm flex items-center justify-between px-6 fixed top-0 left-60 right-0 z-10">
      <div className="text-sm font-medium text-gray-600">{currentOrg?.name || 'No workspace'}</div>
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-xs font-medium text-white">{initials}</span>
        </div>
        <span className="text-sm font-medium text-gray-700">{user?.firstName} {user?.lastName}</span>
        <button onClick={handleLogout} className="text-gray-400 hover:text-gray-600 transition-colors">
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
