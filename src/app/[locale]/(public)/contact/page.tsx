import { Clock3, Mail, MapPin, MessageCircle } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { ContactForm } from '@/components/public/ContactForm';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import {
  formatWhatsAppHref,
  getContactDetails,
  getTourName,
} from '@/lib/public';

export default async function ContactPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tour?: string }>;
}) {
  const { locale } = await params;
  const { tour: selectedTourId } = await searchParams;
  setRequestLocale(locale);

  const copy = {
    fr: {
      kicker: 'Contact',
      title: 'Expliquez votre projet de voyage et obtenez une reponse utile.',
      subtitle:
        "Cette page ne sert plus seulement a envoyer un message. Elle aide maintenant a lier votre demande a un circuit, un rythme et un besoin reel.",
      noteSelected: 'Circuit preselectionne',
      notePrefix: 'Votre message sera rattache a',
      quickTitle: 'Reponse et coordination',
      quickBody:
        'Le plus simple est de partager vos dates, votre nombre de voyageurs et vos envies principales. Le retour pourra ensuite se faire par email ou WhatsApp.',
      quickFacts: [
        { icon: Clock3, title: 'Reponse rapide', body: 'Nous revenons rapidement avec une proposition ou une question utile.' },
        { icon: MessageCircle, title: 'WhatsApp possible', body: 'Pratique pour confirmer un detail ou accelerer un echange.' },
        { icon: MapPin, title: 'Base locale', body: 'Routes concues depuis le terrain, pas depuis un catalogue abstrait.' },
      ],
      location: 'Base locale',
      locationValue: 'Mbodienne, Senegal',
    },
    en: {
      kicker: 'Contact',
      title: 'Describe your trip and get a useful reply.',
      subtitle:
        'This page no longer only sends a message. It now helps connect your request to a specific route, pace, and planning need.',
      noteSelected: 'Preselected tour',
      notePrefix: 'Your message will be linked to',
      quickTitle: 'Reply and coordination',
      quickBody:
        'The simplest path is to share your dates, traveler count, and main wishes. The follow-up can then continue by email or WhatsApp.',
      quickFacts: [
        { icon: Clock3, title: 'Fast reply', body: 'We answer quickly with a proposal or a useful follow-up question.' },
        { icon: MessageCircle, title: 'WhatsApp available', body: 'Useful when you want to confirm a detail or move faster.' },
        { icon: MapPin, title: 'Local base', body: 'Routes shaped from the field, not from an abstract catalog.' },
      ],
      location: 'Local base',
      locationValue: 'Mbodienne, Senegal',
    },
    es: {
      kicker: 'Contacto',
      title: 'Describe tu viaje y recibe una respuesta util.',
      subtitle:
        'Esta pagina ya no sirve solo para enviar un mensaje. Ahora ayuda a conectar tu solicitud con una ruta, un ritmo y una necesidad real.',
      noteSelected: 'Circuito preseleccionado',
      notePrefix: 'Tu mensaje quedara vinculado a',
      quickTitle: 'Respuesta y coordinacion',
      quickBody:
        'La forma mas simple es compartir tus fechas, el numero de viajeros y tus deseos principales. El seguimiento puede continuar por email o WhatsApp.',
      quickFacts: [
        { icon: Clock3, title: 'Respuesta rapida', body: 'Respondemos pronto con una propuesta o una pregunta util.' },
        { icon: MessageCircle, title: 'WhatsApp disponible', body: 'Util para confirmar un detalle o acelerar el intercambio.' },
        { icon: MapPin, title: 'Base local', body: 'Rutas pensadas desde el terreno, no desde un catalogo abstracto.' },
      ],
      location: 'Base local',
      locationValue: 'Mbodienne, Senegal',
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const supabase = await createServerSupabaseClient();
  const [toursResult, settingsResult] = await Promise.all([
    supabase
      .from('tours')
      .select('id, name, name_en, name_es')
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
  const selectedTour = tours.find((tour) => tour.id === selectedTourId) ?? null;
  const contact = getContactDetails(settingsResult.data);
  const whatsappHref = formatWhatsAppHref(contact.whatsapp);

  return (
    <div className="px-6 pb-12 pt-32 md:pb-20">
      <section className="mx-auto max-w-7xl">
        <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <p className="section-kicker">{copy.kicker}</p>
            <h1 className="mt-6 max-w-4xl font-heading text-[clamp(2.9rem,6vw,4.8rem)] font-extrabold leading-[1.02] tracking-[-0.04em] text-on-surface">
              {copy.title}
            </h1>
            <p className="mt-6 max-w-3xl text-body-lg text-on-surface-variant">
              {copy.subtitle}
            </p>

            {selectedTour && (
              <div className="surface-panel mt-8 rounded-[1.75rem] px-6 py-6">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  {copy.noteSelected}
                </p>
                <p className="mt-3 text-body-lg text-on-surface-variant">
                  {copy.notePrefix}
                </p>
                <p className="mt-2 font-heading text-2xl font-bold text-on-surface">
                  {getTourName(selectedTour, locale)}
                </p>
              </div>
            )}

            <div className="section-shell mt-10 px-8 py-8 md:px-10 md:py-10">
              <p className="section-kicker">{copy.quickTitle}</p>
              <h2 className="mt-5 font-heading text-3xl font-bold text-on-surface">
                {copy.quickTitle}
              </h2>
              <p className="mt-4 text-body-lg text-on-surface-variant">
                {copy.quickBody}
              </p>

              <div className="mt-8 space-y-4">
                {copy.quickFacts.map(({ icon: Icon, title, body }) => (
                  <div
                    key={title}
                    className="surface-panel rounded-[1.5rem] px-5 py-5"
                  >
                    <div className="flex gap-4">
                      <span className="rounded-full bg-primary-fixed p-3 text-primary">
                        <Icon size={18} />
                      </span>
                      <div>
                        <h3 className="font-heading text-xl font-bold text-on-surface">
                          {title}
                        </h3>
                        <p className="mt-2 text-body-md text-on-surface-variant">
                          {body}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="surface-panel rounded-[1.75rem] px-6 py-6">
              <div className="flex items-start gap-4">
                <span className="rounded-full bg-primary-fixed p-3 text-primary">
                  <Mail size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    Email
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="mt-2 block text-body-lg font-medium text-on-surface hover:text-primary"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>
            </div>

            {whatsappHref && (
              <div className="surface-panel rounded-[1.75rem] px-6 py-6">
                <div className="flex items-start gap-4">
                  <span className="rounded-full bg-tertiary-container p-3 text-tertiary">
                    <MessageCircle size={18} />
                  </span>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                      WhatsApp
                    </p>
                    <a
                      href={whatsappHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 block text-body-lg font-medium text-on-surface hover:text-primary"
                    >
                      {contact.whatsapp}
                    </a>
                  </div>
                </div>
              </div>
            )}

            <div className="surface-panel rounded-[1.75rem] px-6 py-6">
              <div className="flex items-start gap-4">
                <span className="rounded-full bg-secondary-container p-3 text-secondary">
                  <MapPin size={18} />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                    {copy.location}
                  </p>
                  <p className="mt-2 text-body-lg font-medium text-on-surface">
                    {copy.locationValue}
                  </p>
                </div>
              </div>
            </div>

            <ContactForm
              tours={tours}
              initialTourId={selectedTourId ?? null}
              siteSettings={settingsResult.data}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
