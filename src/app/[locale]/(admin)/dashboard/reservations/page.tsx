import { setRequestLocale } from 'next-intl/server';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { Link } from '@/i18n/routing';
import { CalendarCheck, Mail, Phone } from 'lucide-react';
import StatusActions from './status-actions';

const STATUS_CONFIG = {
  new: {
    label: 'Nouveau',
    class: 'bg-primary-container text-primary',
  },
  replied: {
    label: 'Repondu',
    class: 'bg-tertiary-container text-tertiary',
  },
  archived: {
    label: 'Archive',
    class: 'bg-surface-container-high text-on-surface-variant',
  },
} as const;

export default async function ReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ status?: string }>;
}) {
  const { locale } = await params;
  const { status: filterStatus } = await searchParams;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();

  let query = supabase
    .from('contacts')
    .select('*, tours(name)')
    .order('created_at', { ascending: false });

  if (filterStatus && filterStatus !== 'all') {
    query = query.eq('status', filterStatus);
  }

  const { data: contacts } = await query;

  const filters = [
    { key: 'all', label: 'Tous' },
    { key: 'new', label: 'Nouveaux' },
    { key: 'replied', label: 'Repondus' },
    { key: 'archived', label: 'Archives' },
  ];

  const currentFilter = filterStatus || 'all';

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Reservations & Contacts
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez les demandes de contact et reservations.
          </p>
        </div>
      </div>

      {/* Status filter buttons */}
      <div className="mt-6 flex flex-wrap gap-2">
        {filters.map((filter) => (
          <Link
            key={filter.key}
            href={`/dashboard/reservations${filter.key !== 'all' ? `?status=${filter.key}` : ''}`}
            className={`rounded-xl px-4 py-2 text-label-md font-semibold uppercase tracking-wider ${
              currentFilter === filter.key
                ? 'gradient-primary text-white shadow-ambient'
                : 'bg-surface-container-lowest text-on-surface-variant'
            }`}
          >
            {filter.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 space-y-4">
        {contacts && contacts.length > 0 ? (
          contacts.map((contact) => {
            const statusKey = (contact.status || 'new') as keyof typeof STATUS_CONFIG;
            const statusInfo = STATUS_CONFIG[statusKey] || STATUS_CONFIG.new;

            return (
              <div
                key={contact.id}
                className="rounded-xl bg-surface-container-lowest p-5 shadow-ambient"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-heading text-body-lg font-semibold text-on-surface">
                        {contact.name}
                      </h3>
                      <span
                        className={`rounded-xl px-3 py-1 text-label-md font-semibold uppercase tracking-wider ${statusInfo.class}`}
                      >
                        {statusInfo.label}
                      </span>
                    </div>

                    <div className="mt-2 flex flex-wrap gap-4 text-body-md text-on-surface-variant">
                      {contact.email && (
                        <span className="inline-flex items-center gap-1">
                          <Mail size={14} />
                          {contact.email}
                        </span>
                      )}
                      {contact.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone size={14} />
                          {contact.phone}
                        </span>
                      )}
                      {(contact as Record<string, unknown>).tours && (
                        <span className="inline-flex items-center gap-1">
                          <CalendarCheck size={14} />
                          {((contact as Record<string, unknown>).tours as { name: string })?.name}
                        </span>
                      )}
                    </div>

                    {contact.message && (
                      <p className="mt-2 text-body-md text-on-surface-variant line-clamp-2">
                        {contact.message}
                      </p>
                    )}

                    <p className="mt-2 text-label-md text-on-surface-variant/60">
                      {new Date(contact.created_at).toLocaleDateString('fr-FR', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>

                  <StatusActions contactId={contact.id} currentStatus={statusKey} />
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient">
            <CalendarCheck size={40} className="mx-auto text-on-surface-variant" />
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Aucune reservation pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
