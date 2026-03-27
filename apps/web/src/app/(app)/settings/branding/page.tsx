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
        <form onSubmit={handleSave} className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6 max-w-lg space-y-5">
          {error && (
            <div className="bg-red-50/80 text-red-600 text-sm rounded-xl p-4">{error}</div>
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
                className="flex-1 border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
                placeholder="#4F46E5"
              />
              {brandColor && (
                <div
                  className="h-9 w-9 rounded-2xl border border-gray-200 shadow-sm"
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
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
              placeholder="https://example.com/logo.png"
            />
            <p className="mt-1 text-xs text-gray-500">Logo upload coming soon. Enter a URL for now.</p>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      )}
    </div>
  );
}
