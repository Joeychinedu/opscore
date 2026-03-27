import Link from 'next/link';
import {
  Users,
  FolderKanban,
  CheckSquare,
  FileText,
  BarChart3,
  Shield,
  Building2,
  UserPlus,
  Rocket,
  Check,
} from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Clients',
    description:
      'Manage client relationships, track contact info, and keep notes.',
  },
  {
    icon: FolderKanban,
    title: 'Projects',
    description:
      'Create projects, assign team members, and track progress.',
  },
  {
    icon: CheckSquare,
    title: 'Tasks',
    description:
      'Prioritize work with status tracking and team assignments.',
  },
  {
    icon: FileText,
    title: 'Invoices',
    description:
      'Generate professional invoices and download PDFs.',
  },
  {
    icon: BarChart3,
    title: 'Reports',
    description:
      'Visualize revenue, project performance, and team productivity.',
  },
  {
    icon: Shield,
    title: 'Team',
    description:
      'Role-based access control with owner, admin, manager, and member roles.',
  },
];

const steps = [
  {
    icon: Building2,
    title: 'Create your workspace',
    description:
      'Set up your organization in seconds. Configure your company details and preferences.',
  },
  {
    icon: UserPlus,
    title: 'Invite your team',
    description:
      'Add team members and assign roles. Everyone gets the access they need.',
  },
  {
    icon: Rocket,
    title: 'Start managing',
    description:
      'Create projects, track tasks, send invoices, and monitor performance from day one.',
  },
];

const pricingTiers = [
  {
    name: 'Starter',
    price: 'Free',
    period: '',
    description: 'For small teams getting started.',
    features: [
      'Up to 3 team members',
      '5 active projects',
      'Basic reporting',
      'Invoice generation',
      'Client management',
    ],
    cta: 'Get Started',
    href: '/register',
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/mo',
    description: 'For growing teams that need more.',
    features: [
      'Up to 15 team members',
      'Unlimited projects',
      'Advanced reporting',
      'PDF invoice export',
      'Priority support',
      'Custom roles',
    ],
    cta: 'Get Started',
    href: '/register',
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'For organizations at scale.',
    features: [
      'Unlimited team members',
      'Unlimited projects',
      'Custom reporting',
      'API access',
      'Dedicated support',
      'SSO and audit logs',
    ],
    cta: 'Contact Sales',
    href: '#',
    highlighted: false,
  },
];

export default function LandingPage() {
  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-white">
        {/* Decorative gradient glow */}
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute left-1/2 top-32 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl" />
        </div>

        <div className="mx-auto max-w-6xl px-4 pt-32 pb-16 text-center sm:px-6 md:pt-40 md:pb-24">
          <div className="mx-auto mb-6 w-fit rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-600">
            Built for modern agencies
          </div>
          <h1
            className="mx-auto max-w-4xl text-5xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl"
            style={{ letterSpacing: '-0.037em' }}
          >
            Business Operations, Simplified
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-500">
            The all-in-one platform for agencies and consultancies to manage
            clients, projects, tasks, invoices, and team performance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            >
              Try Demo
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: '-0.037em' }}
            >
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              A complete toolkit for managing operations, from client onboarding
              to invoicing.
            </p>
          </div>
          <div className="mt-14 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl bg-white/70 p-6 shadow-lg shadow-black/[0.03] backdrop-blur-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50">
                  <feature.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: '-0.037em' }}
            >
              Get started in three steps
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              From sign-up to full operations management in minutes.
            </p>
          </div>
          <div className="relative mt-14 grid gap-10 sm:grid-cols-3 sm:gap-6">
            {/* Connecting line (visible on sm+) */}
            <div className="pointer-events-none absolute top-4 left-[16.67%] right-[16.67%] hidden h-px border-t-2 border-dashed border-blue-200 sm:block" />
            {steps.map((step, index) => (
              <div key={step.title} className="relative text-center">
                <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                  {index + 1}
                </div>
                <div className="mx-auto mt-5 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50">
                  <step.icon className="h-6 w-6 text-blue-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <h2
              className="text-3xl font-bold tracking-tight text-gray-900"
              style={{ letterSpacing: '-0.037em' }}
            >
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-500">
              Start free and scale as your team grows.
            </p>
          </div>
          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`relative rounded-2xl bg-white/70 p-8 shadow-lg shadow-black/[0.03] backdrop-blur-sm ${
                  tier.highlighted
                    ? 'border-2 border-blue-500/20 ring-1 ring-blue-500/10'
                    : 'border border-gray-100'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-blue-500 px-3 py-1 text-xs font-medium text-white">
                    Popular
                  </div>
                )}
                <h3 className="text-lg font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span
                    className="text-4xl font-bold tracking-tight text-gray-900"
                    style={{ letterSpacing: '-0.037em' }}
                  >
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-gray-500">{tier.period}</span>
                  )}
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-500" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                    tier.highlighted
                      ? 'bg-gradient-to-t from-blue-600 to-blue-500 text-white hover:opacity-90'
                      : 'border border-gray-200 bg-white text-gray-800 shadow-sm hover:bg-gray-50'
                  }`}
                >
                  {tier.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-gray-900 to-gray-800 px-6 py-16 text-center sm:px-12">
            {/* Subtle blue glow */}
            <div className="pointer-events-none absolute -top-20 left-1/2 h-40 w-80 -translate-x-1/2 rounded-full bg-blue-500/20 blur-3xl" />
            <h2
              className="relative text-3xl font-bold tracking-tight text-white sm:text-4xl"
              style={{ letterSpacing: '-0.037em' }}
            >
              Ready to streamline your operations?
            </h2>
            <p className="relative mx-auto mt-4 max-w-xl text-lg text-gray-300">
              Join teams already using OpsCore to manage their business more
              effectively.
            </p>
            <div className="relative mt-8">
              <Link
                href="/login"
                className="inline-block rounded-lg bg-gradient-to-t from-blue-600 to-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
              >
                Try Demo
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
