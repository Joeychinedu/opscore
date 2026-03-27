import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-sm">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-xl font-bold tracking-tight text-gray-900">
            OpsCore
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900">
              Features
            </a>
            <a href="#pricing" className="text-sm text-gray-600 hover:text-gray-900">
              Pricing
            </a>
            <Link href="/login" className="text-sm text-gray-600 hover:text-gray-900">
              Sign In
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="text-sm text-gray-500">
              &copy; {new Date().getFullYear()} OpsCore. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                About
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Blog
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Contact
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                Twitter
              </a>
              <a href="#" className="text-sm text-gray-500 hover:text-gray-700">
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
