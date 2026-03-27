import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-200">404</h1>
        <h2 className="text-xl font-semibold text-gray-900 mt-4">Page not found</h2>
        <p className="text-sm text-gray-500 mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="inline-block mt-6 bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
