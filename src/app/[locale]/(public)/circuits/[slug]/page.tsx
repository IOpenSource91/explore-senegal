import {
  ArrowLeft,
  ArrowRight,
  Clock3,
  Globe,
  MapPinned,
  MessageCircle,
  Mountain,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Link } from '@/i18n/routing';
import { TourCard } from '@/components/public/TourCard';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  formatWhatsAppHref,
  getContactDetails,
  getDifficultyLabel,
  getItineraryDescription,
  getItineraryTitle,
  getRouteDestinationNames,
  getTourLongDescription,
  getTourName,
} from '@/lib/public';
import { formatPrice } from '@/lib/utils';

export default async function TourDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const copy = {
    fr: {
      back: 'Retour aux circuits',
      route: 'Parcours',
      overview: 'Vue d ensemble',
      overviewBody:
        "Une fiche plus lisible pour mieux comprendre le rythme du circuit avant l'echange.",
      itinerary: 'Le voyage',
      gallery: 'Galerie',
      book: 'Demander ce circuit',
      direct: 'Ecrire directement',
      planningTitle: 'Preparation simple',
      planningPoints: [
        'Circuit relie directement au formulaire de contact.',
        'Reponse humaine avec disponibilites et ajustements.',
        'Possibilite de passer par WhatsApp si vous preferez.',
      ],
      priceNote: 'par personne',
      group: 'taille de groupe',
      language: 'langues',
      difficulty: 'niveau',
      duration: 'rythme',
      related: 'Vous aimerez aussi',
      noGallery: 'La galerie sera enrichie au fur et a mesure des prochains uploads.',
      contactCardTitle: 'Parler de ce circuit',
      contactCardBody:
        "Si cette route vous convient presque, ecrivez-nous. Nous pouvons valider la disponibilite et ajuster l'organisation.",
      tourCard: {
        cta: 'Voir les details',
        featured: 'A la une',
        from: 'Des',
        people: 'pers.',
        route: 'Parcours',
      },
    },
    en: {
      back: 'Back to tours',
      route: 'Route',
      overview: 'Overview',
      overviewBody:
        'A clearer page so you understand the pace of the tour before reaching out.',
      itinerary: 'The journey',
      gallery: 'Gallery',
      book: 'Request this tour',
      direct: 'Write directly',
      planningTitle: 'Simple planning',
      planningPoints: [
        'This tour is linked directly to the contact flow.',
        'Human reply with availability and possible adjustments.',
        'You can also switch to WhatsApp if that is easier.',
      ],
      priceNote: 'per person',
      group: 'group size',
      language: 'languages',
      difficulty: 'level',
      duration: 'pace',
      related: 'You may also like',
      noGallery: 'The gallery will expand as more media uploads are added.',
      contactCardTitle: 'Talk about this tour',
      contactCardBody:
        'If this route feels almost right, write to us. We can confirm availability and refine the plan.',
      tourCard: {
        cta: 'See details',
        featured: 'Featured',
        from: 'From',
        people: 'people',
        route: 'Route',
      },
    },
    es: {
      back: 'Volver a circuitos',
      route: 'Ruta',
      overview: 'Resumen',
      overviewBody:
        'Una ficha mas clara para entender el ritmo del circuito antes de escribir.',
      itinerary: 'El viaje',
      gallery: 'Galeria',
      book: 'Solicitar este circuito',
      direct: 'Escribir directamente',
      planningTitle: 'Planificacion simple',
      planningPoints: [
        'Este circuito se vincula directamente al formulario de contacto.',
        'Respuesta humana con disponibilidad y posibles ajustes.',
        'Tambien puedes pasar a WhatsApp si te resulta mas facil.',
      ],
      priceNote: 'por persona',
      group: 'tamano del grupo',
      language: 'idiomas',
      difficulty: 'nivel',
      duration: 'ritmo',
      related: 'Tambien podria gustarte',
      noGallery: 'La galeria crecera a medida que se suban mas medios.',
      contactCardTitle: 'Hablar de este circuito',
      contactCardBody:
        'Si esta ruta te encaja casi por completo, escribenos. Podemos confirmar disponibilidad y afinar el plan.',
      tourCard: {
        cta: 'Ver detalles',
        featured: 'Destacado',
        from: 'Desde',
        people: 'personas',
        route: 'Ruta',
      },
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const supabase = await createServerSupabaseClient();

  const [tourResult, settingsResult] = await Promise.all([
    supabase
      .from('tours')
      .select(
        '*, tour_itinerary(*), media(*), tour_destinations(destination:destinations(name))'
      )
      .eq('slug', slug)
      .eq('status', 'published')
      .maybeSingle(),
    supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle(),
  ]);

  const tour = tourResult.data as any;

  if (!tour) {
    notFound();
  }

  const { data: relatedToursData } = await supabase
    .from('tours')
    .select('*, tour_destinations(destination:destinations(name))')
    .eq('status', 'published')
    .neq('id', tour.id)
    .order('featured', { ascending: false })
    .limit(3);
  const relatedTours = (relatedToursData ?? []) as any[];

  const contact = getContactDetails(settingsResult.data);
  const whatsappHref = formatWhatsAppHref(contact.whatsapp);
  const name = getTourName(tour, locale);
  const description = getTourLongDescription(tour, locale);
  const routeStops = getRouteDestinationNames(tour.tour_destinations);
  const difficulty = getDifficultyLabel(locale, tour.difficulty);
  const itinerary = [...(tour.tour_itinerary ?? [])].sort(
    (left: any, right: any) => left.step_order - right.step_order
  );
  const images = (tour.media ?? []).filter((item: any) => item.type === 'image');
  const price = tour.price ? formatPrice(tour.price, tour.currency) : null;

  return (
    <div className="pb-12 pt-24 md:pb-20">
      <section className="relative overflow-hidden px-6 pb-12 pt-8 md:pb-16">
        <div className="absolute inset-x-0 top-0 h-[34rem]">
          {tour.cover_image ? (
            <>
              <img
                src={tour.cover_image}
                alt={name}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-[linear-gradient(130deg,rgba(16,12,8,0.72)_0%,rgba(16,12,8,0.46)_40%,rgba(16,12,8,0.82)_100%)]" />
            </>
          ) : (
            <div className="gradient-hero h-full w-full" />
          )}
        </div>

        <div className="absolute inset-x-0 top-[24rem] h-72 bg-gradient-to-b from-transparent to-surface" />

        <div className="relative mx-auto max-w-7xl">
          <Link
            href="/circuits"
            className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2.5 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/18"
          >
            <ArrowLeft size={16} />
            <span>{copy.back}</span>
          </Link>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div className="text-white">
              {routeStops.length > 0 && (
                <div className="mb-5 flex flex-wrap gap-2">
                  {routeStops.map((stop) => (
                    <span
                      key={stop}
                      className="rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm"
                    >
                      {stop}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="max-w-4xl font-heading text-[clamp(3rem,6vw,5rem)] font-extrabold leading-[1.02] tracking-[-0.04em]">
                {name}
              </h1>
              <p className="mt-5 max-w-3xl text-lg leading-8 text-white/78">
                {copy.overviewBody}
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {tour.duration && (
                  <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/78">
                      <Clock3 size={15} />
                      <span>{copy.duration}</span>
                    </div>
                    <p className="mt-3 font-medium text-white">{tour.duration}</p>
                  </div>
                )}
                {tour.max_group_size && (
                  <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/78">
                      <Users size={15} />
                      <span>{copy.group}</span>
                    </div>
                    <p className="mt-3 font-medium text-white">
                      {tour.max_group_size}
                    </p>
                  </div>
                )}
                {tour.language && (
                  <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/78">
                      <Globe size={15} />
                      <span>{copy.language}</span>
                    </div>
                    <p className="mt-3 font-medium text-white">{tour.language}</p>
                  </div>
                )}
                {difficulty && (
                  <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-5 py-5 backdrop-blur-sm">
                    <div className="flex items-center gap-2 text-sm text-white/78">
                      <Mountain size={15} />
                      <span>{copy.difficulty}</span>
                    </div>
                    <p className="mt-3 font-medium text-white">{difficulty}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="section-shell px-7 py-7 md:px-8 md:py-8">
              {price && (
                <div className="rounded-[1.5rem] bg-primary px-5 py-5 text-white">
                  <p className="text-sm uppercase tracking-[0.18em] text-white/70">
                    Price
                  </p>
                  <p className="mt-3 font-heading text-4xl font-bold">{price}</p>
                  <p className="mt-2 text-sm text-white/78">{copy.priceNote}</p>
                </div>
              )}

              <h2 className="mt-6 font-heading text-3xl font-bold text-on-surface">
                {copy.contactCardTitle}
              </h2>
              <p className="mt-4 text-body-lg text-on-surface-variant">
                {copy.contactCardBody}
              </p>

              <div className="mt-6 space-y-3">
                {copy.planningPoints.map((point) => (
                  <div
                    key={point}
                    className="surface-panel flex items-start gap-3 rounded-2xl px-4 py-4"
                  >
                    <span className="mt-0.5 rounded-full bg-primary-fixed p-2 text-primary">
                      <ShieldCheck size={16} />
                    </span>
                    <p className="text-sm text-on-surface-variant">{point}</p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Link
                  href={`/contact?tour=${tour.id}` as any}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5"
                >
                  <ArrowRight size={16} />
                  <span>{copy.book}</span>
                </Link>

                {whatsappHref && (
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-surface-container-high px-6 py-3.5 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container"
                  >
                    <MessageCircle size={16} />
                    <span>{copy.direct}</span>
                  </a>
                )}
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-surface-container-low px-5 py-5">
                <p className="text-sm font-semibold text-on-surface">Email</p>
                <a
                  href={`mailto:${contact.email}`}
                  className="mt-2 block text-body-md text-on-surface-variant hover:text-primary"
                >
                  {contact.email}
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-8">
          <div className="section-shell px-8 py-8 md:px-10 md:py-10">
            <p className="section-kicker">{copy.overview}</p>
            <div className="mt-6 whitespace-pre-line text-body-lg text-on-surface-variant">
              {description}
            </div>
          </div>

          <div className="section-shell px-8 py-8 md:px-10 md:py-10">
            <p className="section-kicker">{copy.route}</p>
            <div className="mt-6 flex flex-wrap gap-3">
              {routeStops.map((stop) => (
                <div
                  key={stop}
                  className="surface-panel flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium text-on-surface"
                >
                  <MapPinned size={15} className="text-primary" />
                  <span>{stop}</span>
                </div>
              ))}
            </div>
          </div>

          {itinerary.length > 0 && (
            <div className="section-shell px-8 py-8 md:px-10 md:py-10">
              <p className="section-kicker">{copy.itinerary}</p>
              <div className="mt-8 space-y-5">
                {itinerary.map((step: any) => (
                  <div
                    key={step.id}
                    className="surface-panel rounded-[1.5rem] px-5 py-5"
                  >
                    <div className="flex gap-4">
                      <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white">
                        {step.step_order}
                      </div>
                      <div>
                        <h3 className="font-heading text-xl font-bold text-on-surface">
                          {getItineraryTitle(step, locale)}
                        </h3>
                        <p className="mt-2 text-body-md text-on-surface-variant">
                          {getItineraryDescription(step, locale)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="section-shell px-8 py-8 md:px-10 md:py-10">
            <p className="section-kicker">{copy.gallery}</p>
            {images.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                {images.map((image: any, index: number) => (
                  <div
                    key={image.id}
                    className={index === 0 ? 'sm:col-span-2 xl:row-span-2' : ''}
                  >
                    <div className="overflow-hidden rounded-[1.5rem] bg-surface-container-high">
                      <img
                        src={image.url}
                        alt={image.alt_text || name}
                        className="aspect-[4/3] h-full w-full object-cover"
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-6 text-body-lg text-on-surface-variant">
                {copy.noGallery}
              </p>
            )}
          </div>
        </div>

        <aside className="space-y-8">
          <div className="section-shell px-8 py-8 md:px-9 md:py-9 lg:sticky lg:top-28">
            <p className="section-kicker">{copy.planningTitle}</p>
            <div className="mt-6 space-y-4">
              {copy.planningPoints.map((point) => (
                <div
                  key={point}
                  className="surface-panel rounded-[1.5rem] px-5 py-5 text-sm text-on-surface-variant"
                >
                  {point}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </section>

      {relatedTours && relatedTours.length > 0 && (
        <section className="mx-auto mt-14 max-w-7xl px-6">
          <div className="mb-8">
            <p className="section-kicker">{copy.related}</p>
          </div>
          <div className="grid gap-8 lg:grid-cols-3">
            {relatedTours.map((relatedTour) => (
              <TourCard
                key={relatedTour.id}
                tour={relatedTour}
                locale={locale}
                labels={copy.tourCard}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
