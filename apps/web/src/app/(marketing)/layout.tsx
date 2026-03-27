import Link from 'next/link';

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <header className="fixed top-4 z-30 w-full">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <nav className="flex h-14 items-center justify-between rounded-2xl bg-white/90 px-5 shadow-lg shadow-black/[0.03] backdrop-blur-sm">
            <Link href="/" className="flex items-center gap-1.5 font-bold tracking-tight text-gray-900">
              <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-blue-500 to-blue-600" />
              OpsCore
            </Link>
            <div className="hidden items-center gap-6 md:flex">
              <a href="#features" className="text-sm text-gray-600 transition hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-sm text-gray-600 transition hover:text-gray-900">
                Pricing
              </a>
              <Link href="/login" className="text-sm text-gray-600 transition hover:text-gray-900">
                Sign In
              </Link>
              <Link
                href="/register"
                className="rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:opacity-90"
              >
                Get Started
              </Link>
            </div>
          </nav>
        </div>
      </header>

      {/* Main content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-gray-900">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="grid gap-8 py-12 md:grid-cols-4 md:py-16">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-white">
                <span className="inline-block h-2 w-2 rounded-full bg-gradient-to-br from-blue-400 to-blue-500" />
                OpsCore
              </div>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                The modern platform for agencies and consultancies.
              </p>
            </div>
            {/* Product */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Product
              </h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="#features" className="text-sm text-gray-500 transition hover:text-gray-300">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="text-sm text-gray-500 transition hover:text-gray-300">
                    Pricing
                  </a>
                </li>
              </ul>
            </div>
            {/* Company */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Company
              </h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            {/* Connect */}
            <div>
              <h4 className="text-xs font-semibold uppercase tracking-wider text-gray-400">
                Connect
              </h4>
              <ul className="mt-4 space-y-2.5">
                <li>
                  <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">
                    Twitter
                  </a>
                </li>
                <li>
                  <a href="#" className="text-sm text-gray-500 transition hover:text-gray-300">
                    GitHub
                  </a>
                </li>
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="border-t border-gray-800 py-6">
            <p className="text-center text-sm text-gray-500">
              &copy; {new Date().getFullYear()} OpsCore. All rights reserved.
            </p>
          </div>
        </div>
        {/* Subtle blue glow decoration */}
        <div className="pointer-events-none relative overflow-hidden">
          <div className="absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>
      </footer>
    </div>
  );
}
