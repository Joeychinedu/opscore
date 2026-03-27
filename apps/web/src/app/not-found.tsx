import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-blue-50 mb-6">
          <span className="text-3xl font-bold text-blue-500">404</span>
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Page not found</h2>
        <p className="text-sm text-gray-500 mt-2">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link href="/dashboard" className="inline-block mt-6 bg-gradient-to-t from-blue-600 to-blue-500 text-white rounded-lg px-4 py-2.5 text-sm font-medium shadow-sm hover:shadow-md transition-all">
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
