import {
  ArrowRight,
  CarFront,
  Clock3,
  Compass,
  MapPinned,
  MessageCircle,
  Mountain,
  Sparkles,
  UserRound,
  Users,
  UtensilsCrossed,
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { TourCard } from '@/components/public/TourCard';
import { DestinationCard } from '@/components/public/DestinationCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  getDifficultyLabel,
  getLocalizedValue,
  getRouteDestinationNames,
  shouldShowPublicPrices,
  getTourName,
  getTourShortDescription,
} from '@/lib/public';
import {
  getHomepageContent,
  getLocalizedContent,
} from '@/lib/site-content';
import { formatPrice } from '@/lib/utils';

const serviceIcons = {
  car: CarFront,
  user: UserRound,
  utensils: UtensilsCrossed,
  sparkles: Sparkles,
} as const;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = {
    signature:
      locale === 'en'
        ? 'Signature route'
        : locale === 'es'
          ? 'Ruta insignia'
          : 'Circuit signature',
    heroPrimary:
      locale === 'en'
        ? 'Browse tours'
        : locale === 'es'
          ? 'Ver circuitos'
          : 'Voir les circuits',
    heroSecondary:
      locale === 'en'
        ? 'Talk about my trip'
        : locale === 'es'
          ? 'Hablar de mi viaje'
          : 'Parler de mon voyage',
    stats:
      locale === 'en'
        ? ['published tours', 'strong destinations', 'guide languages']
        : locale === 'es'
          ? ['circuitos publicados', 'destinos fuertes', 'idiomas de guia']
          : ['circuits publies', 'destinations fortes', 'langues de guidage'],
    miniTitle:
      locale === 'en'
        ? 'What you understand before booking'
        : locale === 'es'
          ? 'Lo que entiendes antes de reservar'
          : 'Ce que vous voyez avant de reserver',
    miniBody:
      locale === 'en'
        ? 'Tours are easier to compare, the useful information surfaces earlier, and the first contact feels clearer.'
        : locale === 'es'
          ? 'Los circuitos son mas faciles de comparar, la informacion util aparece antes y el primer contacto es mas claro.'
          : 'Des circuits plus faciles a comparer, des infos plus utiles et une premiere prise de contact moins floue.',
    miniDirect:
      locale === 'en'
        ? 'Direct exchange'
        : locale === 'es'
          ? 'Intercambio directo'
          : 'Echange direct',
    miniDirectBody:
      locale === 'en'
        ? 'A message can now start from a specific tour instead of a blank page.'
        : locale === 'es'
          ? 'Un mensaje puede partir ahora de un circuito concreto y no de una pagina vacia.'
          : 'Un message peut partir d un circuit precis et non d une page vide.',
    tourCard: {
      cta:
        locale === 'en'
          ? 'See details'
          : locale === 'es'
            ? 'Ver detalles'
            : 'Voir les details',
      featured:
        locale === 'en'
          ? 'Featured'
          : locale === 'es'
            ? 'Destacado'
            : 'A la une',
      from:
        locale === 'en'
          ? 'From'
          : locale === 'es'
            ? 'Desde'
            : 'Des',
      people:
        locale === 'en'
          ? 'people'
          : locale === 'es'
            ? 'personas'
            : 'pers.',
      route:
        locale === 'en'
          ? 'Route'
          : locale === 'es'
            ? 'Ruta'
            : 'Parcours',
    },
    processSteps:
      locale === 'en'
        ? [
            {
              step: '01',
              title: 'You understand the travel mood quickly',
              body: 'Images, route, and guiding promise are visible from the first screen.',
            },
            {
              step: '02',
              title: 'You compare without friction',
              body: 'Cards no longer bury the important information under too much decoration.',
            },
            {
              step: '03',
              title: 'You move faster to action',
              body: 'Contact is connected to a real tour and a clear booking intention.',
            },
          ]
        : locale === 'es'
          ? [
              {
                step: '01',
                title: 'Entiendes rapido el tono del viaje',
                body: 'Imagenes, ruta y promesa del guia son visibles desde la primera pantalla.',
              },
              {
                step: '02',
                title: 'Comparas sin friccion',
                body: 'Las tarjetas ya no esconden la informacion importante bajo demasiada decoracion.',
              },
              {
                step: '03',
                title: 'Pasas antes a la accion',
                body: 'El contacto se conecta con un circuito real y una intencion clara.',
              },
            ]
          : [
              {
                step: '01',
                title: 'Vous comprenez vite le ton du voyage',
                body: 'Images, parcours et promesse de guide sont visibles des le premier ecran.',
              },
              {
                step: '02',
                title: 'Vous comparez sans fatigue',
                body: 'Les cartes ne cachent plus les infos importantes sous trop de decoration.',
              },
              {
                step: '03',
                title: 'Vous passez a l action plus vite',
                body: 'Le contact est relie a un circuit et a une intention claire.',
              },
            ],
    destinationCta:
      locale === 'en'
        ? 'See related tours'
        : locale === 'es'
          ? 'Ver circuitos relacionados'
          : 'Voir les circuits lies',
    destinationCount: (count: number) =>
      locale === 'en'
        ? count === 1
          ? '1 related tour'
          : `${count} related tours`
        : locale === 'es'
          ? count === 1
            ? '1 circuito relacionado'
            : `${count} circuitos relacionados`
          : count <= 1
            ? '1 circuit associe'
            : `${count} circuits associes`,
  };

  const supabase = await createServerSupabaseClient();

  const [
    featuredResult,
    destinationResult,
    serviceResult,
    publishedTourCountResult,
    destinationCountResult,
    settingsResult,
  ] = await Promise.all([
    supabase
      .from('tours')
      .select('*, tour_destinations(destination:destinations(name))')
      .eq('status', 'published')
      .eq('featured', true)
      .order('created_at', { ascending: false })
      .limit(3),
    supabase
      .from('destinations')
      .select('*, tour_destinations(tour_id)')
      .order('name')
      .limit(4),
    supabase.from('services').select('*').limit(4),
    supabase
      .from('tours')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'published'),
    supabase
      .from('destinations')
      .select('id', { count: 'exact', head: true }),
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle(),
  ]);

  let featuredTours = (featuredResult.data ?? []) as any[];

  if (featuredTours.length === 0) {
    const fallbackResult = await supabase
      .from('tours')
      .select('*, tour_destinations(destination:destinations(name))')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .limit(3);

    featuredTours = (fallbackResult.data ?? []) as any[];
  }

  const destinations = (destinationResult.data ?? []) as any[];
  const services = (serviceResult.data ?? []) as any[];
  const pageContent = getHomepageContent(settingsResult.data);
  const showPublicPrices = shouldShowPublicPrices();
  const heroTour = featuredTours[0] ?? null;
  const previewTour = featuredTours[1] ?? null;
  const heroStops = getRouteDestinationNames(heroTour?.tour_destinations).slice(0, 3);
  const difficulty = getDifficultyLabel(locale, heroTour?.difficulty ?? null);
  const publishedTourCount = publishedTourCountResult.count ?? featuredTours.length;
  const destinationCount = destinationCountResult.count ?? destinations.length;
  const stats = [
    String(publishedTourCount).padStart(2, '0'),
    String(destinationCount).padStart(2, '0'),
    '03',
  ];

  return (
    <div className="pb-16 pt-32 md:pb-20">
      <section className="px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="frame-dark min-h-[34rem]">
            {heroTour?.cover_image ? (
              <>
                <img
                  src={heroTour.cover_image}
                  alt={getTourName(heroTour, locale)}
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(12,9,7,0.18)_0%,rgba(12,9,7,0.36)_35%,rgba(12,9,7,0.92)_100%)]" />
              </>
            ) : null}

            <div className="relative flex h-full flex-col justify-between p-6 md:p-8">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-white/14 bg-white/10 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/84 backdrop-blur-sm">
                    {copy.signature}
                  </span>
                  {heroStops.map((stop) => (
                    <span
                      key={stop}
                      className="rounded-full border border-white/12 bg-black/18 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/70 backdrop-blur-sm"
                    >
                      {stop}
                    </span>
                  ))}
                </div>

                {showPublicPrices && heroTour?.price != null && (
                  <span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary shadow-sm">
                    {formatPrice(heroTour.price, heroTour.currency)}
                  </span>
                )}
              </div>

              <div className="max-w-xl">
                {heroTour && (
                  <>
                    <h2 className="font-heading text-[clamp(2.5rem,4.4vw,4rem)] font-bold leading-[0.96] text-white">
                      {getTourName(heroTour, locale)}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-white/74">
                      {getTourShortDescription(heroTour, locale)}
                    </p>
                  </>
                )}

                <div className="mt-6 flex flex-wrap gap-3">
                  {heroTour?.duration && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      <Clock3 size={14} className="text-white/78" />
                      <span>{heroTour.duration}</span>
                    </span>
                  )}
                  {heroTour?.max_group_size && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      <Users size={14} className="text-white/78" />
                      <span>{heroTour.max_group_size}</span>
                    </span>
                  )}
                  {difficulty && (
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/12 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                      <Mountain size={14} className="text-white/78" />
                      <span>{difficulty}</span>
                    </span>
                  )}
                </div>

                {heroTour && (
                  <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                    <Link
                      href={`/circuits/${heroTour.slug}` as any}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5"
                    >
                      {copy.tourCard.cta}
                      <ArrowRight size={16} />
                    </Link>
                    <Link
                      href={`/contact?tour=${heroTour.id}` as any}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/14 bg-white/10 px-5 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/16"
                    >
                      <MessageCircle size={16} />
                      <span>{copy.heroSecondary}</span>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="section-shell px-7 py-8 md:px-9 md:py-10">
              <p className="section-kicker">
                {getLocalizedContent(locale, pageContent.heroKicker)}
              </p>
              <h1 className="mt-6 max-w-2xl font-heading text-[clamp(2.8rem,5vw,4.8rem)] font-extrabold leading-[0.96] tracking-[-0.04em] text-on-surface">
                {getLocalizedContent(locale, pageContent.heroTitle)}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-8 text-on-surface-variant">
                {getLocalizedContent(locale, pageContent.heroBody)}
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  href="/circuits"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {copy.heroPrimary}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
                >
                  <MessageCircle size={16} />
                  <span>{copy.heroSecondary}</span>
                </Link>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {stats.map((value, index) => (
                <div
                  key={copy.stats[index]}
                  className="surface-panel rounded-[1.6rem] px-5 py-5"
                >
                  <p className="font-heading text-3xl font-bold text-primary">{value}</p>
                  <p className="mt-2 text-sm text-on-surface-variant">
                    {copy.stats[index]}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="surface-panel rounded-[1.6rem] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {copy.miniTitle}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-on-surface-variant">
                  {copy.miniBody}
                </p>
              </div>

              <div className="surface-panel rounded-[1.6rem] px-5 py-5">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {copy.miniDirect}
                </p>
                <p className="mt-4 text-[15px] leading-7 text-on-surface-variant">
                  {copy.miniDirectBody}
                </p>
                {previewTour && (
                  <p className="mt-4 font-heading text-xl font-bold text-on-surface">
                    {getTourName(previewTour, locale)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="section-kicker">
              {getLocalizedContent(locale, pageContent.featuredKicker)}
            </p>
            <h2 className="mt-5 font-heading text-[clamp(2.2rem,4vw,3.6rem)] font-bold leading-[1.02] text-on-surface">
              {getLocalizedContent(locale, pageContent.featuredTitle)}
            </h2>
            <p className="mt-4 text-base leading-8 text-on-surface-variant">
              {getLocalizedContent(locale, pageContent.featuredBody)}
            </p>
          </div>

          <div className="grid gap-8 xl:grid-cols-3">
            {featuredTours.map((tour) => (
              <TourCard
                key={tour.id}
                tour={tour}
                locale={locale}
                labels={copy.tourCard}
                showPrice={showPublicPrices}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="frame-dark-solid px-7 py-8 text-white md:px-9 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
              {getLocalizedContent(locale, pageContent.processKicker)}
            </p>
            <h2 className="mt-5 max-w-xl font-heading text-[clamp(2rem,3.8vw,3.2rem)] font-bold leading-[1.02]">
              {getLocalizedContent(locale, pageContent.processTitle)}
            </h2>
            <p className="mt-4 max-w-xl text-base leading-8 text-white/72">
              {getLocalizedContent(locale, pageContent.processBody)}
            </p>

            <div className="mt-8 space-y-4">
              {copy.processSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-[1.5rem] border border-white/10 bg-white/6 px-5 py-5 backdrop-blur-sm"
                >
                  <div className="flex gap-4">
                    <span className="font-heading text-3xl font-bold text-[#ffca94]">
                      {step.step}
                    </span>
                    <div>
                      <h3 className="font-heading text-xl font-bold text-white">
                        {step.title}
                      </h3>
                      <p className="mt-2 text-sm leading-7 text-white/68">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell px-7 py-8 md:px-9 md:py-10">
            <h2 className="max-w-xl font-heading text-[clamp(2rem,3.6vw,3.1rem)] font-bold leading-[1.02] text-on-surface">
              {getLocalizedContent(locale, pageContent.servicesTitle)}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {(services.length > 0
                ? services
                : [
                    {
                      id: 'fallback-transport',
                      name: 'Transport prive',
                      name_en: 'Private transport',
                      name_es: 'Transporte privado',
                      description:
                        'Transport confortable en vehicule climatise.',
                      description_en:
                        'Comfortable transport in an air-conditioned vehicle.',
                      description_es:
                        'Transporte comodo en vehiculo climatizado.',
                      icon: 'car',
                    },
                  ]
              ).map((service) => {
                const Icon =
                  serviceIcons[(service.icon as keyof typeof serviceIcons) || 'sparkles'] ||
                  Sparkles;

                return (
                  <div
                    key={service.id}
                    className="surface-panel rounded-[1.5rem] px-5 py-5"
                  >
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                      <Icon size={20} />
                    </span>
                    <h3 className="mt-5 font-heading text-2xl font-bold text-on-surface">
                      {getLocalizedValue(locale, {
                        fr: service.name,
                        en: service.name_en,
                        es: service.name_es,
                      })}
                    </h3>
                    <p className="mt-3 text-[15px] leading-7 text-on-surface-variant">
                      {getLocalizedValue(locale, {
                        fr: service.description,
                        en: service.description_en,
                        es: service.description_es,
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-10 max-w-3xl">
            <p className="section-kicker">
              {getLocalizedContent(locale, pageContent.destinationKicker)}
            </p>
            <h2 className="mt-5 font-heading text-[clamp(2.2rem,4vw,3.6rem)] font-bold leading-[1.02] text-on-surface">
              {getLocalizedContent(locale, pageContent.destinationTitle)}
            </h2>
            <p className="mt-4 text-base leading-8 text-on-surface-variant">
              {getLocalizedContent(locale, pageContent.destinationBody)}
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                locale={locale}
                ctaLabel={copy.destinationCta}
                countLabel={copy.destinationCount(
                  destination.tour_destinations?.length ?? 0
                )}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="frame-dark-solid px-7 py-8 text-white md:px-10 md:py-12">
            <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
                  Explore Senegal
                </p>
                <h2 className="mt-5 max-w-3xl font-heading text-[clamp(2.3rem,4vw,3.8rem)] font-bold leading-[1.02]">
                  {getLocalizedContent(locale, pageContent.finalTitle)}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
                  {getLocalizedContent(locale, pageContent.finalBody)}
                </p>
              </div>

              <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {getLocalizedContent(locale, pageContent.finalPrimary)}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/circuits"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/14"
                >
                  <Compass size={16} />
                  <span>{getLocalizedContent(locale, pageContent.finalSecondary)}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
