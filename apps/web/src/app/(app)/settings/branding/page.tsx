'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { SettingsTabs } from '../page';

interface OrgSettings {
  id: string;
  orgId: string;
  invoicePrefix: string;
  currency: string;
  timezone: string;
  brandColor: string | null;
}

export default function BrandingPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [brandColor, setBrandColor] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<OrgSettings>('/settings');
        setBrandColor(data.brandColor ?? '');
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);
    try {
      await api.patch('/settings', {
        brandColor: brandColor || null,
      });
      setSuccess(true);
      toast.success('Branding saved');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to save branding');
      setError(err instanceof Error ? err.message : 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader title="Settings" description="Manage your workspace settings" />
      <SettingsTabs />

      {loading ? (
        <div className="text-sm text-gray-400">Loading settings...</div>
      ) : (
        <form onSubmit={handleSave} className="max-w-lg space-y-5">
          {error && (
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Branding saved successfully.</div>
          )}

          <div>
            <label htmlFor="brandColor" className="block text-sm font-medium text-gray-700 mb-1">
              Brand Color
            </label>
            <div className="flex items-center gap-3">
              <input
                id="brandColor"
                type="text"
                value={brandColor}
                onChange={(e) => setBrandColor(e.target.value)}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="#4F46E5"
              />
              {brandColor && (
                <div
                  className="h-9 w-9 rounded-lg border border-gray-300"
                  style={{ backgroundColor: brandColor }}
                />
              )}
            </div>
            <p className="mt-1 text-xs text-gray-500">Enter a hex color code (e.g. #4F46E5)</p>
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium text-gray-700 mb-1">
              Logo URL
            </label>
            <input
              id="logoUrl"
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              placeholder="https://example.com/logo.png"
            />
            <p className="mt-1 text-xs text-gray-500">Logo upload coming soon. Enter a URL for now.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}
