'use client';

import { useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { useAuthStore } from '@/lib/auth';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsTabs } from '../page';

interface UpdatedUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
}

export default function AccountPage() {
  const { user } = useAuthStore();

  const [firstName, setFirstName] = useState(user?.firstName ?? '');
  const [lastName, setLastName] = useState(user?.lastName ?? '');
  const [password, setPassword] = useState('');

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const body: Record<string, string> = {};
      if (firstName !== user?.firstName) body.firstName = firstName;
      if (lastName !== user?.lastName) body.lastName = lastName;
      if (password) body.password = password;

      if (Object.keys(body).length === 0) {
        setSaving(false);
        return;
      }

      const updated = await api.patch<UpdatedUser>('/settings/account', body);

      // Update auth store and localStorage
      const updatedUser = { ...user!, firstName: updated.firstName, lastName: updated.lastName };
      useAuthStore.setState({ user: updatedUser });
      localStorage.setItem('user', JSON.stringify(updatedUser));

      setPassword('');
      setSuccess(true);
      toast.success('Account updated');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to update account');
      setError(err instanceof Error ? err.message : 'Failed to update account');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your workspace settings" />
      <SettingsTabs />

      <form onSubmit={handleSave} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6 max-w-lg space-y-5">
        {error && (
          <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
        )}
        {success && (
          <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Account updated successfully.</div>
        )}

        <div className="space-y-4">
          <h3 className="text-sm font-semibold text-gray-900">Personal Information</h3>

          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
              First Name
            </label>
            <input
              id="firstName"
              type="text"
              maxLength={50}
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            />
          </div>

          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
              Last Name
            </label>
            <input
              id="lastName"
              type="text"
              maxLength={50}
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            />
          </div>
        </div>

        <div className="space-y-4 border-t border-gray-200 pt-5">
          <h3 className="text-sm font-semibold text-gray-900">Change Password</h3>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              New Password
            </label>
            <input
              id="password"
              type="password"
              minLength={8}
              maxLength={72}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
