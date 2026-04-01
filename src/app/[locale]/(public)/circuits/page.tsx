import {
  ArrowRight,
  Clock3,
  Compass,
  MapPinned,
  MessageCircle,
  Users,
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TourCard } from '@/components/public/TourCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getRouteDestinationNames, getTourName, getTourShortDescription } from '@/lib/public';
import {
  getCircuitsPageContent,
  getLocalizedContent,
} from '@/lib/site-content';
import { formatPrice } from '@/lib/utils';

export default async function CircuitsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = {
    fr: {
      kicker: 'Collection de circuits',
      title: 'Des circuits plus compacts, plus nets et plus faciles a comparer.',
      subtitle:
        "Ici, chaque route doit pouvoir se comprendre vite: territoire, rythme, taille du groupe et promesse du guide.",
      primaryCta: 'Demander conseil',
      secondaryCta: 'Voir le circuit en vedette',
      spotlight: 'Circuit en vedette',
      helpTitle: 'Vous hésitez entre plusieurs ambiances ?',
      helpBody:
        'Dites-nous si vous cherchez la memoire, le littoral, la dune ou la vie de village. Nous vous orienterons vers le bon circuit.',
      stats: ['circuits disponibles', 'taille reduite', 'contact direct'],
      tourCard: {
        cta: 'Voir les details',
        featured: 'A la une',
        from: 'Des',
        people: 'pers.',
        route: 'Parcours',
      },
      empty: 'Aucun circuit n est publie pour le moment.',
    },
    en: {
      kicker: 'Tour collection',
      title: 'Tours that are denser, clearer, and easier to compare.',
      subtitle:
        'Each route should now read quickly: territory, pace, group size, and the guiding promise.',
      primaryCta: 'Ask for advice',
      secondaryCta: 'See the featured tour',
      spotlight: 'Featured tour',
      helpTitle: 'Unsure which mood fits you best?',
      helpBody:
        'Tell us whether you want memory, coastline, dunes, or village life. We will point you to the right route.',
      stats: ['available tours', 'small groups', 'direct contact'],
      tourCard: {
        cta: 'See details',
        featured: 'Featured',
        from: 'From',
        people: 'people',
        route: 'Route',
      },
      empty: 'No tours are published right now.',
    },
    es: {
      kicker: 'Coleccion de circuitos',
      title: 'Circuitos mas densos, mas claros y mas faciles de comparar.',
      subtitle:
        'Cada ruta debe leerse rapido: territorio, ritmo, tamano del grupo y promesa del guia.',
      primaryCta: 'Pedir consejo',
      secondaryCta: 'Ver el circuito destacado',
      spotlight: 'Circuito destacado',
      helpTitle: 'No sabes que ambiente te conviene mas?',
      helpBody:
        'Dinos si buscas memoria, costa, dunas o vida de pueblo. Te orientaremos hacia la ruta adecuada.',
      stats: ['circuitos disponibles', 'grupos reducidos', 'contacto directo'],
      tourCard: {
        cta: 'Ver detalles',
        featured: 'Destacado',
        from: 'Desde',
        people: 'personas',
        route: 'Ruta',
      },
      empty: 'No hay circuitos publicados por ahora.',
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const supabase = await createServerSupabaseClient();
  const [toursResult, settingsResult] = await Promise.all([
    supabase
      .from('tours')
      .select('*, tour_destinations(destination:destinations(name))')
      .eq('status', 'published')
      .order('featured', { ascending: false })
      .order('created_at', { ascending: false }),
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle(),
  ]);

  const tours = (toursResult.data ?? []) as any[];
  const pageContent = getCircuitsPageContent(settingsResult.data);
  const featuredTour = tours[0] ?? null;
  const featuredStops = getRouteDestinationNames(featuredTour?.tour_destinations).slice(0, 3);
  const stats = [
    String(tours.length).padStart(2, '0'),
    '08',
    '24h',
  ];

  return (
    <div className="pb-16 pt-32 md:pb-20">
      <section className="px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="section-shell px-7 py-8 md:px-9 md:py-10">
            <p className="section-kicker">{getLocalizedContent(locale, pageContent.kicker)}</p>
            <h1 className="mt-6 max-w-2xl font-heading text-[clamp(2.6rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-on-surface">
              {getLocalizedContent(locale, pageContent.title)}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-8 text-on-surface-variant">
              {getLocalizedContent(locale, pageContent.subtitle)}
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                <MessageCircle size={16} />
                <span>{getLocalizedContent(locale, pageContent.primaryCta)}</span>
              </Link>
              {featuredTour && (
                <Link
                  href={`/circuits/${featuredTour.slug}` as any}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  {getLocalizedContent(locale, pageContent.secondaryCta)}
                  <ArrowRight size={16} />
                </Link>
              )}
            </div>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((value, index) => (
                <div
                  key={copy.stats[index]}
                  className="surface-panel rounded-[1.5rem] px-5 py-5"
                >
                  <p className="font-heading text-3xl font-bold text-primary">{value}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {copy.stats[index]}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-6 surface-panel rounded-[1.5rem] px-5 py-5">
              <h2 className="font-heading text-2xl font-bold text-on-surface">
                {getLocalizedContent(locale, pageContent.helpTitle)}
              </h2>
              <p className="mt-3 text-[15px] leading-7 text-on-surface-variant">
                {getLocalizedContent(locale, pageContent.helpBody)}
              </p>
            </div>
          </div>

          <div className="frame-dark min-h-[34rem]">
            {featuredTour?.cover_image ? (
              <>
                <img
                  src={featuredTour.cover_image}
                  alt={getTourName(featuredTour, locale)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,9,7,0.12)_0%,rgba(12,9,7,0.26)_36%,rgba(12,9,7,0.9)_100%)]" />
              </>
            ) : null}

            <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/84 backdrop-blur-sm">
                  {getLocalizedContent(locale, pageContent.spotlight)}
                </span>
                {featuredTour?.price && (
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary">
                    {formatPrice(featuredTour.price, featuredTour.currency)}
                  </span>
                )}
              </div>

              {featuredTour ? (
                <div className="max-w-xl">
                  <div className="mb-3 flex flex-wrap gap-2">
                    {featuredStops.map((stop) => (
                      <span
                        key={stop}
                        className="rounded-full border border-white/12 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>

                  <h2 className="font-heading text-[clamp(2.2rem,4vw,3.6rem)] font-bold leading-[0.98] text-white">
                    {getTourName(featuredTour, locale)}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-white/74">
                    {getTourShortDescription(featuredTour, locale)}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    {featuredTour.duration && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                        <Clock3 size={14} className="text-white/78" />
                        <span>{featuredTour.duration}</span>
                      </span>
                    )}
                    {featuredTour.max_group_size && (
                      <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                        <Users size={14} className="text-white/78" />
                        <span>{featuredTour.max_group_size}</span>
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-base leading-7 text-white/72">{copy.empty}</p>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          {tours.length > 0 ? (
            <div className="grid gap-8 xl:grid-cols-3">
              {tours.map((tour) => (
                <TourCard
                  key={tour.id}
                  tour={tour}
                  locale={locale}
                  labels={copy.tourCard}
                />
              ))}
            </div>
          ) : (
            <div className="section-shell px-8 py-12 text-center text-body-lg text-on-surface-variant">
              <Compass className="mx-auto h-8 w-8 text-primary" />
              <p className="mt-4">{copy.empty}</p>
            </div>
          )}
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="frame-dark-solid px-7 py-8 text-white md:px-10 md:py-10">
            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
                  Explore Senegal
                </p>
                <h2 className="mt-5 max-w-3xl font-heading text-[clamp(2rem,3.8vw,3.4rem)] font-bold leading-[1.02]">
                  {getLocalizedContent(locale, pageContent.helpTitle)}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
                  {getLocalizedContent(locale, pageContent.helpBody)}
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <MessageCircle size={16} />
                  <span>{getLocalizedContent(locale, pageContent.primaryCta)}</span>
                </Link>
                <Link
                  href="/destinations"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/14"
                >
                  <MapPinned size={16} />
                  <span>Destinations</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
