'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard, Users, FolderKanban, CheckSquare,
  FileText, UsersRound, BarChart3, Settings,
} from 'lucide-react';

const mainNav = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Clients', href: '/clients', icon: Users },
  { label: 'Projects', href: '/projects', icon: FolderKanban },
  { label: 'Tasks', href: '/tasks', icon: CheckSquare },
  { label: 'Invoices', href: '/invoices', icon: FileText },
];

const secondaryNav = [
  { label: 'Team', href: '/team', icon: UsersRound },
  { label: 'Reports', href: '/reports', icon: BarChart3 },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  const renderNavItem = (item: { label: string; href: string; icon: React.ComponentType<{ className?: string }> }) => {
    const active = pathname.startsWith(item.href);
    return (
      <Link key={item.href} href={item.href}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          active ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-600 hover:bg-gray-100/60 hover:text-gray-900',
        )}>
        <item.icon className="h-[18px] w-[18px]" />
        {item.label}
      </Link>
    );
  };

  return (
    <aside className="w-60 border-r border-gray-200/60 bg-white/80 backdrop-blur-sm flex flex-col h-screen fixed left-0 top-0 z-20">
      <div className="h-14 flex items-center px-5 border-b border-gray-200/60">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
          <span className="font-bold text-lg text-gray-900 tracking-tight">OpsCore</span>
        </div>
      </div>
      <nav className="flex-1 px-3 py-4 space-y-1">
        {mainNav.map(renderNavItem)}
        <div className="my-3 border-t border-gray-200/60" />
        {secondaryNav.map(renderNavItem)}
      </nav>
      <div className="px-4 py-4 border-t border-gray-200/60">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-gray-100 flex items-center justify-center">
            <span className="text-xs font-medium text-gray-500">WS</span>
          </div>
          <span className="text-sm font-medium text-gray-600 truncate">Workspace</span>
        </div>
      </div>
    </aside>
  );
}
