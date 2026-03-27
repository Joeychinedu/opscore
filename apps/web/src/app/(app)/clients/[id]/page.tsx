'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Pencil, Mail, Phone, MapPin, Building, Send } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api-client';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/data/status-badge';
import { TableSkeleton } from '@/components/feedback/loading-skeleton';

interface ClientNote {
  id: string;
  content: string;
  createdAt: string;
  authorId: string;
}

interface Project {
  id: string;
  name: string;
  status: string;
  createdAt: string;
}

interface Invoice {
  id: string;
  number: string;
  status: string;
  total: number;
  createdAt: string;
}

interface ClientDetail {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  createdAt: string;
  projects: Project[];
  invoices: Invoice[];
  notes: ClientNote[];
  _count: { projects: number; invoices: number };
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const [client, setClient] = useState<ClientDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const data = await api.get<ClientDetail>(`/clients/${params.id}`);
        setClient(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load client');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) return;
    setAddingNote(true);
    try {
      const note = await api.post<ClientNote>(`/clients/${params.id}/notes`, {
        content: noteText.trim(),
      });
      setClient((prev) =>
        prev ? { ...prev, notes: [note, ...prev.notes] } : prev,
      );
      setNoteText('');
      toast.success('Note added');
    } catch {
      toast.error('Failed to add note');
    } finally {
      setAddingNote(false);
    }
  };

  if (loading) {
    return (
      <div>
        <PageHeader title="Loading..." />
        <TableSkeleton rows={3} cols={3} />
      </div>
    );
  }

  if (error || !client) {
    return (
      <div>
        <PageHeader title="Client" />
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error || 'Client not found'}
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={client.name}
        description={client.company || undefined}
        action={
          <Link
            href={`/clients/${client.id}/edit`}
            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Link>
        }
      />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column */}
        <div className="space-y-6 lg:col-span-2">
          {/* Contact info */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Contact Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {client.email && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <a href={`mailto:${client.email}`} className="text-blue-600 hover:text-blue-500">
                    {client.email}
                  </a>
                </div>
              )}
              {client.phone && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{client.phone}</span>
                </div>
              )}
              {client.address && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>{client.address}</span>
                </div>
              )}
              {client.company && (
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span>{client.company}</span>
                </div>
              )}
              {!client.email && !client.phone && !client.address && !client.company && (
                <p className="text-sm text-gray-400">No contact information available.</p>
              )}
            </div>
          </div>

          {/* Projects */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Projects ({client._count.projects})
            </h2>
            {client.projects.length === 0 ? (
              <p className="text-sm text-gray-400">No projects yet.</p>
            ) : (
              <div className="space-y-3">
                {client.projects.map((project) => (
                  <div key={project.id} className="flex items-center justify-between rounded-md border px-4 py-3">
                    <Link href={`/projects/${project.id}`} className="text-sm font-medium text-blue-600 hover:text-blue-500">
                      {project.name}
                    </Link>
                    <StatusBadge status={project.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Invoices */}
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">
              Invoices ({client._count.invoices})
            </h2>
            {client.invoices.length === 0 ? (
              <p className="text-sm text-gray-400">No invoices yet.</p>
            ) : (
              <div className="overflow-hidden rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Number</th>
                      <th className="px-4 py-2 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                      <th className="px-4 py-2 text-right text-xs font-medium uppercase text-gray-500">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {client.invoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-gray-50">
                        <td className="px-4 py-2 text-sm text-gray-900">{inv.number}</td>
                        <td className="px-4 py-2 text-sm"><StatusBadge status={inv.status} /></td>
                        <td className="px-4 py-2 text-right text-sm text-gray-700">
                          ${(inv.total / 100).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right column - Notes */}
        <div>
          <div className="rounded-lg border bg-white p-6">
            <h2 className="mb-4 text-sm font-semibold text-gray-900">Notes</h2>
            <form onSubmit={handleAddNote} className="mb-4 flex gap-2">
              <input
                type="text"
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Add a note..."
                className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="submit"
                disabled={addingNote || !noteText.trim()}
                className="rounded-lg bg-gray-900 p-2 text-white hover:bg-gray-800 disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
            {client.notes.length === 0 ? (
              <p className="text-sm text-gray-400">No notes yet.</p>
            ) : (
              <div className="space-y-3">
                {client.notes.map((note) => (
                  <div key={note.id} className="rounded-md bg-gray-50 px-3 py-2">
                    <p className="text-sm text-gray-700">{note.content}</p>
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(note.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
