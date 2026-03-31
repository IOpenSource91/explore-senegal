import { setRequestLocale } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { Clock, Users, Globe, Mountain, ArrowLeft } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();

  // Fetch tour with itinerary and media
  const { data: tour } = await supabase
    .from('tours')
    .select(
      '*, tour_itinerary(*), media(*), tour_destinations(destination:destinations(*))'
    )
    .eq('slug', slug)
    .eq('status', 'published')
    .single();

  if (!tour) notFound();

  // Fetch related tours
  const { data: relatedTours } = await supabase
    .from('tours')
    .select('id, name, slug, cover_image, price, duration')
    .eq('status', 'published')
    .neq('id', tour.id)
    .limit(3);

  const name =
    locale === 'en' && tour.name_en
      ? tour.name_en
      : locale === 'es' && tour.name_es
        ? tour.name_es
        : tour.name;

  const description =
    locale === 'en' && tour.long_description_en
      ? tour.long_description_en
      : locale === 'es' && tour.long_description_es
        ? tour.long_description_es
        : tour.long_description;

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative aspect-[21/9] w-full overflow-hidden bg-surface-container-high">
        {tour.cover_image && (
          <img
            src={tour.cover_image}
            alt={name}
            className="h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 scrim-bottom" />
        <div className="absolute bottom-0 left-0 p-8 md:p-12">
          <div className="flex flex-wrap gap-2 text-label-md text-white/80">
            {tour.duration && <span>{tour.duration}</span>}
            {tour.difficulty && (
              <>
                <span>·</span>
                <span className="capitalize">{tour.difficulty}</span>
              </>
            )}
            {tour.language && (
              <>
                <span>·</span>
                <span>{tour.language}</span>
              </>
            )}
          </div>
          <h1 className="mt-3 font-heading text-display-md font-extrabold text-white md:text-display-lg">
            {name}
          </h1>
        </div>
      </section>

      {/* Content */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <div className="grid gap-12 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Meta */}
            <div className="flex flex-wrap gap-6 text-sm text-on-surface-variant">
              {tour.duration && (
                <span className="flex items-center gap-2">
                  <Clock size={16} /> {tour.duration}
                </span>
              )}
              {tour.max_group_size && (
                <span className="flex items-center gap-2">
                  <Users size={16} /> Max {tour.max_group_size} personnes
                </span>
              )}
              {tour.language && (
                <span className="flex items-center gap-2">
                  <Globe size={16} /> {tour.language}
                </span>
              )}
              {tour.difficulty && (
                <span className="flex items-center gap-2">
                  <Mountain size={16} className="capitalize" />{' '}
                  {tour.difficulty}
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="font-heading text-headline-md font-bold text-on-surface">
                Aperçu
              </h2>
              <div className="mt-4 whitespace-pre-line text-body-lg text-on-surface-variant">
                {description}
              </div>
            </div>

            {/* Itinerary */}
            {tour.tour_itinerary && tour.tour_itinerary.length > 0 && (
              <div className="mt-12">
                <h2 className="font-heading text-headline-md font-bold text-on-surface">
                  Le voyage
                </h2>
                <div className="mt-6 space-y-6">
                  {tour.tour_itinerary
                    .sort((a: any, b: any) => a.step_order - b.step_order)
                    .map((step: any) => (
                      <div
                        key={step.id}
                        className="flex gap-4 rounded-xl bg-surface-container-low p-6"
                      >
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container text-sm font-bold text-on-primary-container">
                          {step.step_order}
                        </div>
                        <div>
                          <h3 className="font-heading font-bold text-on-surface">
                            {locale === 'en' && step.title_en
                              ? step.title_en
                              : locale === 'es' && step.title_es
                                ? step.title_es
                                : step.title}
                          </h3>
                          <p className="mt-1 text-body-md text-on-surface-variant">
                            {locale === 'en' && step.description_en
                              ? step.description_en
                              : locale === 'es' && step.description_es
                                ? step.description_es
                                : step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Gallery */}
            {tour.media && tour.media.length > 0 && (
              <div className="mt-12">
                <h2 className="font-heading text-headline-md font-bold text-on-surface">
                  Galerie
                </h2>
                <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
                  {tour.media
                    .filter((m: any) => m.type === 'image')
                    .map((m: any) => (
                      <div
                        key={m.id}
                        className="aspect-square overflow-hidden rounded-xl"
                      >
                        <img
                          src={m.url}
                          alt={m.alt_text || name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Booking sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-28 rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
              {tour.price && (
                <div className="text-center">
                  <span className="font-heading text-headline-lg font-bold text-on-surface">
                    {formatPrice(tour.price)}
                  </span>
                  <span className="text-body-md text-on-surface-variant">
                    {' '}
                    / personne
                  </span>
                </div>
              )}
              <Link
                href="/contact"
                className="gradient-primary mt-6 block w-full rounded-xl px-6 py-4 text-center text-sm font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg"
              >
                Réserver ce circuit
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Related Tours */}
      {relatedTours && relatedTours.length > 0 && (
        <section className="bg-surface-container-low py-16">
          <div className="mx-auto max-w-7xl px-6">
            <h2 className="font-heading text-headline-md font-bold text-on-surface">
              Vous aimeriez aussi
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-3">
              {relatedTours.map((rt) => (
                <Link
                  key={rt.id}
                  href={`/circuits/${rt.slug}` as any}
                  className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient"
                >
                  <div className="aspect-[4/3] bg-surface-container-high">
                    {rt.cover_image && (
                      <img
                        src={rt.cover_image}
                        alt={rt.name}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-heading font-bold text-on-surface">
                      {rt.name}
                    </h3>
                    <div className="mt-2 flex items-center justify-between text-sm text-on-surface-variant">
                      {rt.duration && <span>{rt.duration}</span>}
                      {rt.price && (
                        <span className="font-bold text-primary">
                          {formatPrice(rt.price)}
                        </span>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
