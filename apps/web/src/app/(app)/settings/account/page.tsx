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

      <form onSubmit={handleSave} className="max-w-lg space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="Leave blank to keep current password"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
}
