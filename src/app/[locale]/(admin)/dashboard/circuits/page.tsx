import { setRequestLocale } from 'next-intl/server';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { Link } from '@/i18n/routing';
import { formatPrice } from '@/lib/utils';
import { Plus, Star, Clock, Users } from 'lucide-react';
export default async function AdminToursPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();

  const { data: tours, error } = await supabase
    .from('tours')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Circuits
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez vos circuits touristiques
          </p>
        </div>
        <Link
          href={'/dashboard/circuits/new' as any}
          className="gradient-primary inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg"
        >
          <Plus size={18} />
          Nouveau Circuit
        </Link>
      </div>

      {/* Tours table */}
      <div className="mt-8 rounded-xl bg-surface-container-lowest shadow-ambient">
        {error && (
          <div className="p-6">
            <p className="text-body-md text-on-surface-variant">
              Erreur lors du chargement des circuits.
            </p>
          </div>
        )}

        {!error && (!tours || tours.length === 0) && (
          <div className="p-12 text-center">
            <p className="text-body-lg text-on-surface-variant">
              Aucun circuit pour le moment.
            </p>
            <Link
              href={'/dashboard/circuits/new' as any}
              className="mt-4 inline-flex items-center gap-2 text-primary hover:underline"
            >
              <Plus size={16} />
              Creer votre premier circuit
            </Link>
          </div>
        )}

        {tours && tours.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-outline-variant/15">
                  <th className="px-6 py-4 text-left text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    Circuit
                  </th>
                  <th className="px-6 py-4 text-left text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    Prix
                  </th>
                  <th className="px-6 py-4 text-left text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    Duree
                  </th>
                  <th className="px-6 py-4 text-left text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    Groupe
                  </th>
                  <th className="px-6 py-4 text-center text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                    Vedette
                  </th>
                </tr>
              </thead>
              <tbody>
                {tours.map((tour) => (
                  <tr
                    key={tour.id}
                    className="border-b border-outline-variant/15 transition-colors last:border-0 hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/dashboard/circuits/${tour.id}` as any}
                        className="font-medium text-on-surface hover:text-primary"
                      >
                        {tour.name}
                      </Link>
                      {tour.short_description && (
                        <p className="mt-0.5 max-w-xs truncate text-sm text-on-surface-variant">
                          {tour.short_description}
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                          tour.status === 'published'
                            ? 'bg-green-500/15 text-green-700 dark:text-green-400'
                            : 'bg-on-surface/10 text-on-surface-variant'
                        }`}
                      >
                        {tour.status === 'published' ? 'Publie' : 'Brouillon'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-body-md text-on-surface">
                      {tour.price != null
                        ? formatPrice(tour.price, tour.currency || 'EUR')
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-body-md text-on-surface-variant">
                        <Clock size={14} />
                        {tour.duration ? `${tour.duration}j` : '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center gap-1 text-body-md text-on-surface-variant">
                        <Users size={14} />
                        {tour.max_group_size || '—'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {tour.featured && (
                        <Star
                          size={18}
                          className="inline text-yellow-500"
                          fill="currentColor"
                        />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
