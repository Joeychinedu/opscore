'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api-client';
import { useOrgStore } from '@/lib/hooks/use-org';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-');
}

export default function CreateOrgPage() {
  const router = useRouter();
  const { selectOrg } = useOrgStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugTouched) {
      setSlug(slugify(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const org = await api.post<{
        id: string;
        name: string;
        slug: string;
        logoUrl: string | null;
        createdAt: string;
      }>('/organizations', { name, slug });
      selectOrg(org);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create workspace');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Create a workspace</h1>
          <p className="mt-1 text-sm text-gray-600">
            Set up your organization workspace
          </p>
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          {error && (
            <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                Workspace name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="My Company"
              />
            </div>

            <div>
              <label htmlFor="slug" className="block text-sm font-medium text-gray-700">
                URL slug
              </label>
              <input
                id="slug"
                type="text"
                required
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-400 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="my-company"
              />
              <p className="mt-1 text-xs text-gray-500">
                Used in URLs to identify your workspace
              </p>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create workspace'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
