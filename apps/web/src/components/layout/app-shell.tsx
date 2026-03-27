import { Sidebar } from './sidebar';
import { Topbar } from './topbar';

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50/80">
      <Sidebar />
      <Topbar />
      <main className="ml-60 mt-14 p-8">{children}</main>
    </div>
  );
}
