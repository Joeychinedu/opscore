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
        {/* Decorative grid pattern */}
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{
              backgroundImage:
                'linear-gradient(to right, #111 1px, transparent 1px), linear-gradient(to bottom, #111 1px, transparent 1px)',
              backgroundSize: '4rem 4rem',
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />
        </div>

        <div className="mx-auto max-w-7xl px-6 py-24 text-center sm:py-32 lg:py-40">
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
            Business Operations, Simplified
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
            The all-in-one platform for agencies and consultancies to manage
            clients, projects, tasks, invoices, and team performance.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/login"
              className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-gray-800"
            >
              Try Demo
            </Link>
            <Link
              href="/register"
              className="rounded-lg border border-gray-300 bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-50"
            >
              Get Started
            </Link>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to run your business
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              A complete toolkit for managing operations, from client onboarding
              to invoicing.
            </p>
          </div>
          <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-900">
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-white py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Get started in three steps
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              From sign-up to full operations management in minutes.
            </p>
          </div>
          <div className="mt-16 grid gap-12 sm:grid-cols-3">
            {steps.map((step, index) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                  <step.icon className="h-6 w-6 text-gray-900" />
                </div>
                <div className="mt-2 text-sm font-medium text-gray-400">
                  Step {index + 1}
                </div>
                <h3 className="mt-2 text-lg font-semibold text-gray-900">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-gray-50 py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Start free and scale as your team grows.
            </p>
          </div>
          <div className="mt-16 grid gap-8 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <div
                key={tier.name}
                className={`rounded-xl border p-8 shadow-sm ${
                  tier.highlighted
                    ? 'border-gray-900 bg-white ring-1 ring-gray-900'
                    : 'border-gray-200 bg-white'
                }`}
              >
                <h3 className="text-lg font-semibold text-gray-900">
                  {tier.name}
                </h3>
                <p className="mt-1 text-sm text-gray-500">{tier.description}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-gray-900">
                    {tier.price}
                  </span>
                  {tier.period && (
                    <span className="text-sm text-gray-500">{tier.period}</span>
                  )}
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-900" />
                      <span className="text-sm text-gray-600">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={tier.href}
                  className={`mt-8 block rounded-lg px-4 py-2.5 text-center text-sm font-semibold ${
                    tier.highlighted
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'border border-gray-300 bg-white text-gray-900 hover:bg-gray-50'
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
      <section className="bg-gray-900 py-16">
        <div className="mx-auto max-w-7xl px-6 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to streamline your operations?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-300">
            Join teams already using OpsCore to manage their business more
            effectively.
          </p>
          <div className="mt-8">
            <Link
              href="/login"
              className="inline-block rounded-lg bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
            >
              Try Demo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
