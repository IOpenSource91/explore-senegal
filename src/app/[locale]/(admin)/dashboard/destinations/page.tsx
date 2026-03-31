import { setRequestLocale } from 'next-intl/server';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { Link } from '@/i18n/routing';
import { Plus, Pencil, MapPin } from 'lucide-react';

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Destinations
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez vos destinations touristiques.
          </p>
        </div>
        <Link
          href="/dashboard/destinations/new"
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient"
        >
          <Plus size={18} />
          Ajouter
        </Link>
      </div>

      <div className="mt-8 space-y-4">
        {destinations && destinations.length > 0 ? (
          destinations.map((dest) => (
            <div
              key={dest.id}
              className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 shadow-ambient"
            >
              <div className="flex items-center gap-4">
                <div className="inline-flex rounded-xl bg-primary-fixed p-3 text-primary">
                  <MapPin size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-body-lg font-semibold text-on-surface">
                    {dest.name}
                  </h3>
                  <p className="text-body-md text-on-surface-variant">
                    /{dest.slug}
                  </p>
                  {dest.tagline && (
                    <p className="mt-1 text-body-md text-on-surface-variant italic">
                      {dest.tagline}
                    </p>
                  )}
                </div>
              </div>
              <Link
                href={`/dashboard/destinations/${dest.id}`}
                className="inline-flex items-center gap-2 rounded-xl bg-surface-container-high px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-on-surface"
              >
                <Pencil size={16} />
                Modifier
              </Link>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient">
            <MapPin size={40} className="mx-auto text-on-surface-variant" />
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Aucune destination pour le moment.
            </p>
            <Link
              href="/dashboard/destinations/new"
              className="mt-4 inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient"
            >
              <Plus size={18} />
              Ajouter une destination
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
