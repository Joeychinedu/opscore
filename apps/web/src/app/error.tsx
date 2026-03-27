'use client';

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-xl font-semibold text-gray-900">Something went wrong</h1>
        <p className="text-sm text-gray-500 mt-2">{error.message || 'An unexpected error occurred.'}</p>
        <button onClick={reset} className="mt-6 bg-gray-900 text-white rounded-md px-4 py-2 text-sm font-medium hover:bg-gray-800">
          Try again
        </button>
      </div>
    </div>
  );
}
