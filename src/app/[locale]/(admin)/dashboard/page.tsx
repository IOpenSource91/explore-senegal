import { setRequestLocale } from 'next-intl/server';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { getAboutPageContent, getLocalizedContent } from '@/lib/site-content';
import { Map, MapPin, CalendarCheck, Image } from 'lucide-react';

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();

  // Fetch stats
  const [
    { count: toursCount },
    { count: destinationsCount },
    { count: contactsCount },
    { count: mediaCount },
    settingsResult,
  ] = await Promise.all([
    supabase.from('tours').select('*', { count: 'exact', head: true }),
    supabase.from('destinations').select('*', { count: 'exact', head: true }),
    supabase.from('contacts').select('*', { count: 'exact', head: true }),
    supabase.from('media').select('*', { count: 'exact', head: true }),
    supabase.from('site_settings').select('*').eq('id', 'default').maybeSingle(),
  ]);

  const settings = settingsResult.data ?? null;
  const siteName = settings?.site_name || 'Explore Senegal';
  const aboutPageContent = getAboutPageContent(settings);
  const guideName = getLocalizedContent(locale, aboutPageContent.guideName).trim();
  const guideRole = getLocalizedContent(locale, aboutPageContent.guideRole).trim();

  const stats = [
    {
      label: 'Circuits totaux',
      value: toursCount || 0,
      icon: Map,
      color: 'bg-primary-fixed text-primary',
    },
    {
      label: 'Destinations totales',
      value: destinationsCount || 0,
      icon: MapPin,
      color: 'bg-tertiary-fixed text-tertiary',
    },
    {
      label: 'Réservations totales',
      value: contactsCount || 0,
      icon: CalendarCheck,
      color: 'bg-secondary-fixed text-secondary',
    },
    {
      label: 'Fichiers média',
      value: mediaCount || 0,
      icon: Image,
      color: 'bg-primary-fixed text-primary',
    },
  ];

  return (
    <div>
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            {guideName ? `Jamm ak Salaam, ${guideName}.` : 'Jamm ak Salaam.'}
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Voici ce qui se passe avec {siteName} aujourd'hui.
          </p>
          {guideRole ? (
            <p className="mt-3 inline-flex rounded-full bg-primary/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
              {guideRole}
            </p>
          ) : null}
        </div>
      </div>

      {/* Stats grid */}
      <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient"
            >
              <div
                className={`inline-flex rounded-xl p-3 ${stat.color}`}
              >
                <Icon size={20} />
              </div>
              <p className="mt-4 font-heading text-headline-lg font-bold text-on-surface">
                {stat.value}
              </p>
              <p className="mt-1 text-label-md uppercase tracking-wider text-on-surface-variant">
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Recent Activity placeholder */}
      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-lg font-bold text-on-surface">
            Activité récente
          </h2>
          <div className="mt-6 space-y-4">
            <p className="text-body-md text-on-surface-variant">
              Aucune activité récente. Commencez par ajouter vos premiers
              circuits et destinations !
            </p>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-lg font-bold text-on-surface">
            Circuits à venir
          </h2>
          <div className="mt-6 space-y-4">
            <p className="text-body-md text-on-surface-variant">
              Aucun circuit planifié. Créez votre premier circuit pour
              commencer !
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
