'use client';

import { useEffect, useState, useCallback } from 'react';
import { UserPlus, Mail } from 'lucide-react';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/data/status-badge';
import { EmptyState } from '@/components/data/empty-state';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogDescription, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';

interface Member {
  id: string;
  role: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');
  const [inviting, setInviting] = useState(false);
  const [inviteError, setInviteError] = useState<string | null>(null);

  const fetchMembers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get<Member[]>('/members');
      setMembers(Array.isArray(res) ? res : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load team members');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviting(true);
    setInviteError(null);
    try {
      await api.post('/members/invite', { email: inviteEmail, role: inviteRole });
      setDialogOpen(false);
      setInviteEmail('');
      setInviteRole('MEMBER');
      fetchMembers();
    } catch (err) {
      setInviteError(err instanceof Error ? err.message : 'Failed to send invite');
    } finally {
      setInviting(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage your team members"
        action={
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger
              className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              <UserPlus className="h-4 w-4" />
              Invite Member
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Invite Team Member</DialogTitle>
                <DialogDescription>
                  Send an invitation to join your workspace.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label htmlFor="invite-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email address
                  </label>
                  <input
                    id="invite-email"
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="colleague@company.com"
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="invite-role" className="block text-sm font-medium text-gray-700 mb-1">
                    Role
                  </label>
                  <select
                    id="invite-role"
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value)}
                    className="w-full rounded-lg border border-gray-300 bg-white py-2 px-3 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="MEMBER">Member</option>
                    <option value="MANAGER">Manager</option>
                    <option value="ADMIN">Admin</option>
                  </select>
                </div>
                {inviteError && (
                  <p className="text-sm text-red-600">{inviteError}</p>
                )}
                <DialogFooter>
                  <DialogClose
                    className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </DialogClose>
                  <button
                    type="submit"
                    disabled={inviting}
                    className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
                  >
                    {inviting ? 'Sending...' : 'Send Invite'}
                  </button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        }
      />

      {error && (
        <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
      )}

      {loading ? (
        <TableSkeleton rows={4} cols={3} />
      ) : members.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="No team members"
          description="Invite your first team member to get started."
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((member) => (
            <div key={member.id} className="rounded-lg border bg-white p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-sm font-medium text-gray-600">
                    {member.user.firstName[0]}{member.user.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {member.user.firstName} {member.user.lastName}
                    </p>
                    <p className="text-xs text-gray-500">{member.user.email}</p>
                  </div>
                </div>
                <StatusBadge status={member.role} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
