import { ArrowRight, Heart, MapPinned, Shield, Sparkles, Star } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import {
  getAboutPageContent,
  getLocalizedContent,
} from '@/lib/site-content';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const copy = {
    fr: {
      kicker: 'Le guide',
      title: 'Une presence locale qui explique, relie et donne du sens au parcours.',
      subtitle:
        "L'intention n'est pas de faire seulement visiter, mais de faire comprendre le territoire, son rythme et les histoires qui le traversent.",
      quote:
        "Je veux que chaque visiteur reparte avec une sensation juste du Senegal: sa generosite, ses voix et ses paysages.",
      stats: ['circuits publies', 'destinations actives', 'langues de guidage'],
      storyTitle: 'Pourquoi ce projet existe',
      storyBody: [
        "Explore Senegal est ne d'une volonte simple: proposer des visites plus humaines, plus situees et moins impersonnelles.",
        "Le site doit prolonger cette logique. Il ne doit pas impressionner pour rien, mais aider a sentir le ton du voyage avant meme le premier message.",
      ],
      methodTitle: 'Comment je construis une journee',
      methodSteps: [
        {
          step: '01',
          title: 'Un territoire clair',
          body: 'Chaque circuit part d un lieu ou d une ambiance precise, pas d un assemblage flou.',
        },
        {
          step: '02',
          title: 'Un rythme annonce',
          body: 'On sait si la journee sera plus calme, plus active ou plus contemplative.',
        },
        {
          step: '03',
          title: 'Une relation directe',
          body: 'Le voyage se prepare avec un echange humain, pas avec un tunnel impersonnel.',
        },
      ],
      valuesTitle: 'Ce qui reste non negociable pendant le voyage',
      values: [
        {
          icon: Heart,
          title: 'Hospitalite',
          body: 'Le voyage doit etre accueillant et simple des le premier echange.',
        },
        {
          icon: MapPinned,
          title: 'Ancrage local',
          body: 'Les lieux sont racontes depuis le terrain, pas depuis un texte generique.',
        },
        {
          icon: Shield,
          title: 'Clarte',
          body: 'Rythme, logistique et intention restent lisibles avant de confirmer.',
        },
        {
          icon: Star,
          title: 'Exigence',
          body: 'Moins de decoratif gratuit, plus de coherence et plus d attention au detail.',
        },
      ],
      ctaTitle: 'Si cette maniere de guider vous parle, le prochain pas peut rester tres simple.',
      ctaBody:
        'Choisissez une route existante ou ecrivez avec votre idee de voyage. Le site a maintenant ete refait pour servir ce moment-la.',
      ctaPrimary: 'Voir les circuits',
      ctaSecondary: 'Ecrire maintenant',
    },
    en: {
      kicker: 'The guide',
      title: 'A local presence that explains, connects, and gives meaning to the route.',
      subtitle:
        'The intent is not only to show places, but to help people understand the territory, its rhythm, and the stories moving through it.',
      quote:
        'I want every traveler to leave with a truthful sense of Senegal: its generosity, its voices, and its landscapes.',
      stats: ['published tours', 'active destinations', 'guide languages'],
      storyTitle: 'Why this project exists',
      storyBody: [
        'Explore Senegal started from a simple intention: offer visits that feel more human, more situated, and less impersonal.',
        'The site should extend that logic. It should not impress for no reason, but help people feel the tone of the trip before the first message.',
      ],
      methodTitle: 'How I shape a day',
      methodSteps: [
        {
          step: '01',
          title: 'A clear territory',
          body: 'Each tour starts from a place or a mood, not from a vague bundle of stops.',
        },
        {
          step: '02',
          title: 'A stated pace',
          body: 'You should know whether the day is calmer, more active, or more contemplative.',
        },
        {
          step: '03',
          title: 'A direct relationship',
          body: 'The trip is prepared through a human exchange, not through an impersonal tunnel.',
        },
      ],
      valuesTitle: 'What remains non-negotiable during the trip',
      values: [
        {
          icon: Heart,
          title: 'Hospitality',
          body: 'Travel should feel welcoming and easy from the first exchange.',
        },
        {
          icon: MapPinned,
          title: 'Local grounding',
          body: 'Places are told from the field, not from generic copy.',
        },
        {
          icon: Shield,
          title: 'Clarity',
          body: 'Pace, logistics, and intention stay readable before confirmation.',
        },
        {
          icon: Star,
          title: 'Standards',
          body: 'Less empty decoration, more coherence, and more attention to detail.',
        },
      ],
      ctaTitle: 'If this way of guiding feels right, the next step can stay simple.',
      ctaBody:
        'Choose an existing route or write with your travel idea. The site was rebuilt to serve exactly that moment.',
      ctaPrimary: 'Browse tours',
      ctaSecondary: 'Write now',
    },
    es: {
      kicker: 'El guia',
      title: 'Una presencia local que explica, conecta y da sentido a la ruta.',
      subtitle:
        'La intencion no es solo mostrar lugares, sino ayudar a entender el territorio, su ritmo y las historias que lo atraviesan.',
      quote:
        'Quiero que cada viajero se vaya con una sensacion verdadera de Senegal: su generosidad, sus voces y sus paisajes.',
      stats: ['circuitos publicados', 'destinos activos', 'idiomas de guia'],
      storyTitle: 'Por que existe este proyecto',
      storyBody: [
        'Explore Senegal nacio de una intencion simple: proponer visitas mas humanas, mas situadas y menos impersonales.',
        'El sitio debe prolongar esa logica. No debe impresionar porque si, sino ayudar a sentir el tono del viaje antes del primer mensaje.',
      ],
      methodTitle: 'Como construyo una jornada',
      methodSteps: [
        {
          step: '01',
          title: 'Un territorio claro',
          body: 'Cada circuito parte de un lugar o de un ambiente, no de un conjunto difuso de paradas.',
        },
        {
          step: '02',
          title: 'Un ritmo anunciado',
          body: 'Se debe saber si la jornada sera mas tranquila, mas activa o mas contemplativa.',
        },
        {
          step: '03',
          title: 'Una relacion directa',
          body: 'El viaje se prepara con un intercambio humano, no con un tunel impersonal.',
        },
      ],
      valuesTitle: 'Lo que sigue siendo no negociable durante el viaje',
      values: [
        {
          icon: Heart,
          title: 'Hospitalidad',
          body: 'El viaje debe sentirse acogedor y simple desde el primer intercambio.',
        },
        {
          icon: MapPinned,
          title: 'Raiz local',
          body: 'Los lugares se cuentan desde el terreno y no desde un texto generico.',
        },
        {
          icon: Shield,
          title: 'Claridad',
          body: 'Ritmo, logistica e intencion siguen siendo legibles antes de confirmar.',
        },
        {
          icon: Star,
          title: 'Exigencia',
          body: 'Menos decoracion vacia, mas coherencia y mas atencion al detalle.',
        },
      ],
      ctaTitle: 'Si esta manera de guiar te convence, el siguiente paso puede seguir siendo simple.',
      ctaBody:
        'Elige una ruta existente o escribe con tu idea de viaje. El sitio se rehizo para servir justo a ese momento.',
      ctaPrimary: 'Ver circuitos',
      ctaSecondary: 'Escribir ahora',
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const supabase = await createServerSupabaseClient();
  const [tourCountResult, destinationCountResult, settingsResult] = await Promise.all([
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

  const pageContent = getAboutPageContent(settingsResult.data);
  const stats = [
    String(tourCountResult.count ?? 3).padStart(2, '0'),
    String(destinationCountResult.count ?? 5).padStart(2, '0'),
    '03',
  ];

  return (
    <div className="pb-16 pt-32 md:pb-20">
      <section className="px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.86fr_1.14fr]">
          <div className="frame-dark-solid px-7 py-8 text-white md:px-9 md:py-10">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
              Teranga
            </p>
            <blockquote className="mt-6 max-w-lg font-heading text-[clamp(2.2rem,4vw,3.7rem)] font-bold leading-[0.98]">
              "{getLocalizedContent(locale, pageContent.quote)}"
            </blockquote>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {stats.map((value, index) => (
                <div
                  key={copy.stats[index]}
                  className="rounded-[1.45rem] border border-white/10 bg-white/6 px-4 py-4 backdrop-blur-sm"
                >
                  <p className="font-heading text-3xl font-bold text-[#ffca94]">
                    {value}
                  </p>
                  <p className="mt-2 text-sm text-white/64">{copy.stats[index]}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-shell px-7 py-8 md:px-9 md:py-10">
            <p className="section-kicker">{getLocalizedContent(locale, pageContent.kicker)}</p>
            <h1 className="mt-6 max-w-3xl font-heading text-[clamp(2.6rem,5vw,4.5rem)] font-extrabold leading-[0.98] tracking-[-0.04em] text-on-surface">
              {getLocalizedContent(locale, pageContent.title)}
            </h1>
            <p className="mt-5 max-w-3xl text-base leading-8 text-on-surface-variant">
              {getLocalizedContent(locale, pageContent.subtitle)}
            </p>
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="section-shell px-7 py-8 md:px-9 md:py-10">
            <p className="section-kicker">{getLocalizedContent(locale, pageContent.storyTitle)}</p>
            <div className="mt-6 space-y-4 text-base leading-8 text-on-surface-variant">
              {[
                getLocalizedContent(locale, pageContent.storyBody1),
                getLocalizedContent(locale, pageContent.storyBody2),
              ].map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </div>
          </div>

          <div className="section-shell px-7 py-8 md:px-9 md:py-10">
            <p className="section-kicker">{getLocalizedContent(locale, pageContent.methodTitle)}</p>
            <div className="mt-8 space-y-4">
              {copy.methodSteps.map((step) => (
                <div
                  key={step.step}
                  className="surface-panel rounded-[1.5rem] px-5 py-5"
                >
                  <div className="flex gap-4">
                    <span className="font-heading text-3xl font-bold text-primary">
                      {step.step}
                    </span>
                    <div>
                      <h2 className="font-heading text-xl font-bold text-on-surface">
                        {step.title}
                      </h2>
                      <p className="mt-2 text-[15px] leading-7 text-on-surface-variant">
                        {step.body}
                      </p>
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
          <div className="section-shell px-7 py-8 md:px-10 md:py-10">
            <p className="section-kicker">{getLocalizedContent(locale, pageContent.valuesTitle)}</p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {copy.values.map(({ icon: Icon, title, body }) => (
                <div
                  key={title}
                  className="surface-panel rounded-[1.5rem] px-5 py-5"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-fixed text-primary">
                    <Icon size={20} />
                  </span>
                  <h2 className="mt-5 font-heading text-2xl font-bold text-on-surface">
                    {title}
                  </h2>
                  <p className="mt-3 text-[15px] leading-7 text-on-surface-variant">
                    {body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mt-16 px-6">
        <div className="mx-auto max-w-7xl">
          <div className="frame-dark-solid px-7 py-8 text-white md:px-10 md:py-10">
            <div className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/62">
                  Explore Senegal
                </p>
                <h2 className="mt-5 max-w-3xl font-heading text-[clamp(2rem,3.8vw,3.5rem)] font-bold leading-[1.02]">
                  {getLocalizedContent(locale, pageContent.ctaTitle)}
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-white/72">
                  {getLocalizedContent(locale, pageContent.ctaBody)}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:justify-end">
                <Link
                  href="/circuits"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-semibold text-primary transition-transform duration-300 hover:-translate-y-0.5"
                >
                  {getLocalizedContent(locale, pageContent.ctaPrimary)}
                  <ArrowRight size={16} />
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/8 px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-white/14"
                >
                  <Sparkles size={16} />
                  <span>{getLocalizedContent(locale, pageContent.ctaSecondary)}</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
