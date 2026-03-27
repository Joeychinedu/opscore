'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

export default function LoginPage() {
  const router = useRouter();
  const { login, demoLogin, error, clearError, isLoading } = useAuthStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      router.push('/select-org');
    } catch {
      // Error is handled by store
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setSubmitting(true);
    try {
      await demoLogin();
      router.push('/select-org');
    } catch {
      // Error is handled by store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Sign in to your account</h2>

      {error && (
        <div className="rounded-xl bg-red-50/80 p-3 text-sm text-red-600">
          {error}
          <button onClick={clearError} className="ml-2 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-400"
            placeholder="you@example.com"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-400"
            placeholder="Enter your password"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || isLoading}
          className="w-full bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {submitting ? 'Signing in...' : 'Sign in'}
        </button>
      </form>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200/60" />
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="bg-white/70 px-2 text-gray-500">or</span>
        </div>
      </div>

      <button
        type="button"
        onClick={handleDemo}
        disabled={submitting || isLoading}
        className="w-full bg-white text-gray-800 border border-gray-200 rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:bg-gray-50 transition-all disabled:opacity-50"
      >
        Try Demo
      </button>

      <p className="text-center text-sm text-gray-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-blue-500 hover:text-blue-600">
          Create one
        </Link>
      </p>
    </div>
  );
}
