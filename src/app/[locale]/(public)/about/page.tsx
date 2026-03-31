import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { Heart, MapPin, Shield, Star } from 'lucide-react';

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="relative overflow-hidden bg-surface-container-high py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-tertiary/5" />
        <div className="relative mx-auto max-w-4xl px-6 text-center">
          <p className="text-label-md font-semibold uppercase tracking-widest text-primary">
            Explore Sénégal
          </p>
          <h1 className="mt-4 font-heading text-display-md font-extrabold text-on-surface md:text-display-lg">
            {t('title')}
          </h1>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="mx-auto max-w-4xl px-6">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="aspect-[4/5] overflow-hidden rounded-xl bg-surface-container-high">
              <div className="flex h-full items-center justify-center">
                <span className="font-heading text-xl font-bold text-on-surface-variant/30">
                  Moussa
                </span>
              </div>
            </div>
            <div>
              <h2 className="font-heading text-headline-lg font-bold text-on-surface">
                {locale === 'en'
                  ? 'Born in Senegal, Passionate Guide'
                  : locale === 'es'
                    ? 'Nacido en Senegal, Guía Apasionado'
                    : 'Né au Sénégal, Guide Passionné'}
              </h2>
              <div className="mt-6 space-y-4 text-body-lg text-on-surface-variant">
                <p>
                  {locale === 'en'
                    ? "My name is Moussa, and I was born and raised in Senegal. My deep love for my country and its incredible cultural richness led me to share this passion with travelers from around the world."
                    : locale === 'es'
                      ? 'Me llamo Moussa y nací y crecí en Senegal. Mi profundo amor por mi país y su increíble riqueza cultural me llevó a compartir esta pasión con viajeros de todo el mundo.'
                      : "Je m'appelle Moussa et je suis né et j'ai grandi au Sénégal. Mon amour profond pour mon pays et son incroyable richesse culturelle m'a amené à partager cette passion avec des voyageurs du monde entier."}
                </p>
                <p>
                  {locale === 'en'
                    ? "Every tour I lead is a personal invitation to discover the soul of Senegal — the warm smile of the people, the rhythm of the djembe, the taste of thieboudienne, and the breathtaking landscapes that stretch from the pink waters of Lac Rose to the historic shores of Gorée."
                    : locale === 'es'
                      ? 'Cada circuito que dirijo es una invitación personal a descubrir el alma de Senegal — la cálida sonrisa de la gente, el ritmo del djembé, el sabor del thieboudienne y los paisajes impresionantes.'
                      : "Chaque circuit que je dirige est une invitation personnelle à découvrir l'âme du Sénégal — le sourire chaleureux des habitants, le rythme du djembé, le goût du thieboudienne et les paysages époustouflants qui s'étendent des eaux roses du Lac Rose aux rivages historiques de Gorée."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-heading text-headline-lg font-bold text-on-surface">
            {t('mission')}
          </h2>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-on-surface-variant">
            {locale === 'en'
              ? "To offer authentic, human-centered travel experiences that connect visitors with the true spirit of Teranga — Senegalese hospitality. No mass tourism, no cookie-cutter itineraries. Just real moments, real people, and real stories."
              : locale === 'es'
                ? 'Ofrecer experiencias de viaje auténticas y centradas en el ser humano que conecten a los visitantes con el verdadero espíritu de la Teranga — la hospitalidad senegalesa.'
                : "Offrir des expériences de voyage authentiques et centrées sur l'humain, qui connectent les visiteurs avec le véritable esprit de la Teranga — l'hospitalité sénégalaise. Pas de tourisme de masse, pas d'itinéraires stéréotypés. Juste des moments vrais, des gens vrais et des histoires vraies."}
          </p>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: Heart,
                title: locale === 'en' ? 'Passion' : locale === 'es' ? 'Pasión' : 'Passion',
                desc: locale === 'en'
                  ? 'Every tour is guided with genuine love for this land and its people.'
                  : locale === 'es'
                    ? 'Cada circuito es guiado con verdadero amor por esta tierra y su gente.'
                    : 'Chaque circuit est guidé avec un amour sincère pour cette terre et ses habitants.',
              },
              {
                icon: MapPin,
                title: locale === 'en' ? 'Local Knowledge' : locale === 'es' ? 'Conocimiento Local' : 'Savoir Local',
                desc: locale === 'en'
                  ? 'Hidden spots and insider knowledge that only a local can share.'
                  : locale === 'es'
                    ? 'Lugares escondidos y conocimiento que solo un local puede compartir.'
                    : 'Des endroits cachés et un savoir intime que seul un local peut partager.',
              },
              {
                icon: Shield,
                title: locale === 'en' ? 'Safety' : locale === 'es' ? 'Seguridad' : 'Sécurité',
                desc: locale === 'en'
                  ? 'Your comfort and safety are my top priorities on every adventure.'
                  : locale === 'es'
                    ? 'Su comodidad y seguridad son mis principales prioridades.'
                    : 'Votre confort et votre sécurité sont mes priorités absolues à chaque aventure.',
              },
              {
                icon: Star,
                title: locale === 'en' ? 'Excellence' : locale === 'es' ? 'Excelencia' : 'Excellence',
                desc: locale === 'en'
                  ? 'Premium service and attention to detail for an unforgettable experience.'
                  : locale === 'es'
                    ? 'Servicio premium y atención al detalle para una experiencia inolvidable.'
                    : "Service premium et attention aux détails pour une expérience inoubliable.",
              },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="mt-6 font-heading text-base font-bold text-on-surface">
                  {title}
                </h3>
                <p className="mt-3 text-body-md text-on-surface-variant">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-primary-container py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-headline-lg font-bold text-on-primary-container">
            {t('cta')}
          </h2>
          <p className="mt-4 text-body-lg text-on-primary-container/80">
            {locale === 'en'
              ? "Let's create your perfect Senegal adventure together."
              : locale === 'es'
                ? 'Creemos juntos su aventura perfecta en Senegal.'
                : 'Créons ensemble votre aventure sénégalaise parfaite.'}
          </p>
          <Link
            href="/contact"
            className="mt-8 inline-block rounded-xl bg-on-primary-container px-8 py-4 text-sm font-semibold text-primary-container transition-colors hover:bg-on-surface"
          >
            {locale === 'en' ? 'Contact me' : locale === 'es' ? 'Contácteme' : 'Me contacter'}
          </Link>
        </div>
      </section>
    </div>
  );
}
