'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Settings } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { cn } from '@/lib/utils';

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD'];

const TIMEZONES = [
  'UTC',
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Los_Angeles',
  'Europe/London',
  'Europe/Paris',
  'Europe/Berlin',
  'Asia/Tokyo',
  'Asia/Shanghai',
  'Australia/Sydney',
];

const settingsTabs = [
  { label: 'General', href: '/settings' },
  { label: 'Branding', href: '/settings/branding' },
  { label: 'Account', href: '/settings/account' },
];

interface OrgSettings {
  id: string;
  orgId: string;
  invoicePrefix: string;
  currency: string;
  timezone: string;
  brandColor: string | null;
}

function SettingsTabs() {
  const pathname = usePathname();
  return (
    <div className="mb-6">
      <nav className="flex gap-1 bg-gray-100/80 rounded-xl p-1 w-fit">
        {settingsTabs.map((tab) => {
          const active = pathname === tab.href;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                'rounded-lg px-4 py-2 text-sm font-medium transition-all',
                active
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              )}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export { SettingsTabs };

export default function SettingsPage() {
  const [settings, setSettings] = useState<OrgSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [invoicePrefix, setInvoicePrefix] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [timezone, setTimezone] = useState('UTC');

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<OrgSettings>('/settings');
        setSettings(data);
        setInvoicePrefix(data.invoicePrefix);
        setCurrency(data.currency);
        setTimezone(data.timezone);
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
      const data = await api.patch<OrgSettings>('/settings', {
        invoicePrefix,
        currency,
        timezone,
      });
      setSettings(data);
      setSuccess(true);
      toast.success('Settings saved');
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      toast.error('Failed to save settings');
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
            <div className="rounded-md bg-green-50 p-3 text-sm text-green-700">Settings saved successfully.</div>
          )}

          <div>
            <label htmlFor="invoicePrefix" className="block text-sm font-medium text-gray-700 mb-1">
              Invoice Prefix
            </label>
            <input
              id="invoicePrefix"
              type="text"
              maxLength={10}
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
              placeholder="INV"
            />
          </div>

          <div>
            <label htmlFor="currency" className="block text-sm font-medium text-gray-700 mb-1">
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              {CURRENCIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="timezone" className="block text-sm font-medium text-gray-700 mb-1">
              Timezone
            </label>
            <select
              id="timezone"
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="w-full border border-gray-200 rounded-lg bg-white px-4 py-2.5 text-sm shadow-xs focus:border-blue-300 focus:ring-1 focus:ring-blue-300 focus:outline-none"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
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
