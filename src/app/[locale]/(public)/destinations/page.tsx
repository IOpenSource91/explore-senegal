import { ArrowRight, Compass, MapPinned, MessageCircle } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { DestinationCard } from '@/components/public/DestinationCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getDestinationTagline } from '@/lib/public';
import {
  getDestinationsPageContent,
  getLocalizedContent,
} from '@/lib/site-content';

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = {
    fr: {
      kicker: 'Destinations',
      title: 'Des territoires avec un ton, une memoire et une vraie place dans le voyage.',
      subtitle:
        "Cette page doit donner du caractere a chaque lieu. On ne vend pas seulement un nom, mais une ambiance et un type d'experience.",
      primaryCta: 'Voir les circuits',
      secondaryCta: 'Demander conseil',
      cardCta: 'Explorer les circuits',
      count: (count: number) =>
        count <= 1 ? '1 circuit associe' : `${count} circuits associes`,
      previewTitle: 'Trois atmospheres pour commencer',
      bands: [
        {
          title: 'Memoire',
          body: 'Des lieux ou l histoire impose un rythme plus calme et plus attentif.',
        },
        {
          title: 'Littoral',
          body: 'Une lumiere, un air salin, des routes plus ouvertes et plus respirables.',
        },
        {
          title: 'Village',
          body: 'Des rencontres plus proches du quotidien et du territoire reel.',
        },
      ],
    },
    en: {
      kicker: 'Destinations',
      title: 'Territories with mood, memory, and a real role inside the journey.',
      subtitle:
        'This page should give each place character. We are not selling only a name, but an atmosphere and a type of experience.',
      primaryCta: 'Browse tours',
      secondaryCta: 'Ask for advice',
      cardCta: 'Explore tours',
      count: (count: number) =>
        count === 1 ? '1 related tour' : `${count} related tours`,
      previewTitle: 'Three travel moods to start with',
      bands: [
        {
          title: 'Memory',
          body: 'Places where history asks for a calmer, more attentive rhythm.',
        },
        {
          title: 'Coastline',
          body: 'More light, more open air, and routes that feel broader and softer.',
        },
        {
          title: 'Village life',
          body: 'Encounters that sit closer to everyday life and the real territory.',
        },
      ],
    },
    es: {
      kicker: 'Destinos',
      title: 'Territorios con tono, memoria y un papel real dentro del viaje.',
      subtitle:
        'Esta pagina debe dar caracter a cada lugar. No se vende solo un nombre, sino un ambiente y un tipo de experiencia.',
      primaryCta: 'Ver circuitos',
      secondaryCta: 'Pedir consejo',
      cardCta: 'Explorar circuitos',
      count: (count: number) =>
        count === 1 ? '1 circuito relacionado' : `${count} circuitos relacionados`,
      previewTitle: 'Tres ambientes para empezar',
      bands: [
        {
          title: 'Memoria',
          body: 'Lugares donde la historia pide un ritmo mas sereno y mas atento.',
        },
        {
          title: 'Costa',
          body: 'Mas luz, mas aire abierto y rutas que respiran mejor.',
        },
        {
          title: 'Vida de pueblo',
          body: 'Encuentros mas cercanos a lo cotidiano y al territorio real.',
        },
      ],
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const supabase = await createServerSupabaseClient();
  const [destinationResult, settingsResult] = await Promise.all([
    supabase
      .from('destinations')
      .select('*, tour_destinations(tour_id)')
      .order('name'),
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle(),
  ]);

  const destinations = (destinationResult.data ?? []) as any[];
  const pageContent = getDestinationsPageContent(settingsResult.data);
  const previews = destinations.slice(0, 3);

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
                href="/circuits"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
              >
                {getLocalizedContent(locale, pageContent.primaryCta)}
                <ArrowRight size={16} />
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
              >
                <MessageCircle size={16} />
                <span>{getLocalizedContent(locale, pageContent.secondaryCta)}</span>
              </Link>
            </div>
          </div>

          <div className="frame-dark-solid px-6 py-6 text-white md:px-8 md:py-8">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
              {getLocalizedContent(locale, pageContent.previewTitle)}
            </p>
            <div className="mt-6 space-y-4">
              {previews.map((destination, index) => (
                <div
                  key={destination.id}
                  className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/6 backdrop-blur-sm"
                >
                  <div className="grid min-h-[9rem] md:grid-cols-[0.42fr_0.58fr]">
                    <div className="relative min-h-[10rem] overflow-hidden">
                      {destination.cover_image ? (
                        <img
                          src={destination.cover_image}
                          alt={destination.name}
                          className="absolute inset-0 h-full w-full object-cover"
                        />
                      ) : (
                        <div className="gradient-hero absolute inset-0" />
                      )}
                      <div className="absolute inset-0 bg-black/24" />
                    </div>
                    <div className="flex flex-col justify-between p-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/58">
                          0{index + 1}
                        </p>
                        <h2 className="mt-2 font-heading text-2xl font-bold text-white">
                          {destination.name}
                        </h2>
                        <p className="mt-2 text-sm leading-7 text-white/68">
                          {getDestinationTagline(destination, locale)}
                        </p>
                      </div>
                      <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[#ffd2ab]">
                        <MapPinned size={15} />
                        <span>
                          {copy.count(destination.tour_destinations?.length ?? 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 md:grid-cols-2 xl:grid-cols-3">
            {destinations.map((destination) => (
              <DestinationCard
                key={destination.id}
                destination={destination}
                locale={locale}
                ctaLabel={getLocalizedContent(locale, pageContent.cardCta)}
                countLabel={copy.count(destination.tour_destinations?.length ?? 0)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="section-shell px-7 py-8 md:px-10 md:py-10">
            <div className="mb-8 flex items-center gap-3">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                <Compass size={20} />
              </span>
              <h2 className="font-heading text-[clamp(1.9rem,3vw,2.8rem)] font-bold text-on-surface">
                {getLocalizedContent(locale, pageContent.previewTitle)}
              </h2>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {copy.bands.map((band) => (
                <div
                  key={band.title}
                  className="surface-panel rounded-[1.5rem] px-5 py-5"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {band.title}
                  </p>
                  <p className="mt-4 text-[15px] leading-7 text-on-surface-variant">
                    {band.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
