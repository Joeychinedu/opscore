'use client';

import Link from 'next/link';
import { DollarSign, FolderKanban, Users, FileText, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';

const reportCards = [
  {
    title: 'Revenue',
    description: 'Track income and payment trends over time.',
    icon: DollarSign,
    href: '/reports/revenue',
    color: 'text-green-600 bg-green-50',
  },
  {
    title: 'Projects',
    description: 'Analyze project status, completion rates, and workload.',
    icon: FolderKanban,
    href: '/reports/projects',
    color: 'text-blue-600 bg-blue-50',
  },
  {
    title: 'Team',
    description: 'Review team member productivity and task distribution.',
    icon: Users,
    href: '/reports/team',
    color: 'text-purple-600 bg-purple-50',
  },
  {
    title: 'Invoices',
    description: 'Monitor outstanding invoices, overdue payments, and trends.',
    icon: FileText,
    href: '/reports/invoices',
    color: 'text-yellow-600 bg-yellow-50',
  },
];

export default function ReportsPage() {
  return (
    <div>
      <PageHeader title="Reports" description="Insights and analytics for your workspace" />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {reportCards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="group bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg shadow-black/[0.03] p-6 hover:shadow-xl transition-all"
          >
            <div className="flex items-start gap-4">
              <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${card.color}`}>
                <card.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 flex items-center gap-1">
                  {card.title}
                  <ArrowRight className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </h3>
                <p className="text-sm text-gray-500 mt-1">{card.description}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
