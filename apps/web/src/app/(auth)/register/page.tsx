'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/lib/auth';

export default function RegisterPage() {
  const router = useRouter();
  const { register, error, clearError, isLoading } = useAuthStore();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await register({ email, password, firstName, lastName });
      router.push('/create-org');
    } catch {
      // Error is handled by store
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900 tracking-tight">Create your account</h2>

      {error && (
        <div className="rounded-xl bg-red-50/80 p-3 text-sm text-red-600">
          {error}
          <button onClick={clearError} className="ml-2 font-medium underline">
            Dismiss
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
              First name
            </label>
            <input
              id="firstName"
              type="text"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-400"
            />
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
              Last name
            </label>
            <input
              id="lastName"
              type="text"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-400"
            />
          </div>
        </div>

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
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm bg-white shadow-xs focus:border-blue-300 focus:outline-none focus:ring-1 focus:ring-blue-300 placeholder-gray-400"
            placeholder="At least 8 characters"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || isLoading}
          className="w-full bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all disabled:opacity-50"
        >
          {submitting ? 'Creating account...' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm text-gray-500">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-500 hover:text-blue-600">
          Sign in
        </Link>
      </p>
    </div>
  );
}
