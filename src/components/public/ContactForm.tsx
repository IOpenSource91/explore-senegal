'use client';

import { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { MessageCircle, Send } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { getTourName } from '@/lib/public';
import type { SiteSettings, Tour } from '@/types/database';

type ContactFormTour = Pick<Tour, 'id' | 'name' | 'name_en' | 'name_es'>;

interface ContactFormProps {
  tours: ContactFormTour[];
  initialTourId?: string | null;
  siteSettings: Pick<SiteSettings, 'site_name' | 'email' | 'whatsapp'> | null;
}

export function ContactForm({
  tours,
  initialTourId,
  siteSettings,
}: ContactFormProps) {
  const t = useTranslations('contact');
  const locale = useLocale();
  const copy = {
    fr: {
      formEyebrow: 'Demarrer la conversation',
      formTitle: 'Parlez-nous de votre voyage ideal',
      formSubtitle:
        'Partagez votre rythme, vos dates et le type d experience recherche. Nous revenons avec une proposition claire et humaine.',
      preferredTourPlaceholder: 'Choisir un circuit (optionnel)',
      selectedTourNote: 'Le circuit choisi sera rattache a votre demande.',
      messagePlaceholder:
        'Dates souhaitees, nombre de voyageurs, envies speciales, questions logistiques...',
      successTitle: 'Demande bien recue',
      successBody:
        'Merci. Votre message est dans notre file et nous revenons rapidement avec une reponse utile.',
      successTour: 'Circuit selectionne',
      buttonLoading: 'Envoi...',
      buttonIdle: t('send'),
      responseHint: 'Reponse rapide par email ou WhatsApp selon votre preference.',
      plannerTitle: 'Coordonnees directes',
      plannerBody:
        'Si votre demande est urgente, utilisez aussi les contacts ci-dessous pour accelerer la planification.',
    },
    en: {
      formEyebrow: 'Start the conversation',
      formTitle: 'Tell us about your ideal trip',
      formSubtitle:
        'Share your pace, your dates and the kind of experience you want. We will reply with a clear, human proposal.',
      preferredTourPlaceholder: 'Choose a tour (optional)',
      selectedTourNote: 'Your selected tour will be attached to this request.',
      messagePlaceholder:
        'Preferred dates, number of travelers, special wishes, logistics questions...',
      successTitle: 'Request received',
      successBody:
        'Thank you. Your message is in our queue and we will reply quickly with something useful.',
      successTour: 'Selected tour',
      buttonLoading: 'Sending...',
      buttonIdle: t('send'),
      responseHint: 'Fast reply by email or WhatsApp depending on your preference.',
      plannerTitle: 'Direct contacts',
      plannerBody:
        'If your request is urgent, you can also use the contact details below to speed up planning.',
    },
    es: {
      formEyebrow: 'Inicia la conversacion',
      formTitle: 'Cuéntanos tu viaje ideal',
      formSubtitle:
        'Comparte tu ritmo, tus fechas y el tipo de experiencia que buscas. Responderemos con una propuesta clara y humana.',
      preferredTourPlaceholder: 'Elegir un circuito (opcional)',
      selectedTourNote: 'El circuito elegido se adjuntara a esta solicitud.',
      messagePlaceholder:
        'Fechas deseadas, numero de viajeros, deseos especiales, preguntas logisticas...',
      successTitle: 'Solicitud recibida',
      successBody:
        'Gracias. Tu mensaje ya esta en cola y responderemos pronto con una respuesta util.',
      successTour: 'Circuito seleccionado',
      buttonLoading: 'Enviando...',
      buttonIdle: t('send'),
      responseHint: 'Respuesta rapida por email o WhatsApp segun tu preferencia.',
      plannerTitle: 'Contactos directos',
      plannerBody:
        'Si tu solicitud es urgente, tambien puedes usar los datos de contacto de abajo para agilizar la planificacion.',
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
    tourId: initialTourId ?? '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const selectedTour = tours.find((tour) => tour.id === form.tourId) ?? null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: submitError } = await supabase.from('contacts').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message,
      tour_id: form.tourId || null,
      status: 'new',
    });

    if (submitError) {
      setError(submitError.message);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setForm({
      name: '',
      email: '',
      phone: '',
      message: '',
      tourId: initialTourId ?? '',
    });
    setLoading(false);
  }

  return (
    <div className="surface-panel-strong rounded-[2rem] p-8 md:p-10">
      {success ? (
        <div className="flex min-h-[28rem] flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-tertiary-container text-tertiary shadow-sm">
            <MessageCircle size={30} />
          </div>
          <p className="section-kicker mt-8">{copy.formEyebrow}</p>
          <h2 className="mt-5 font-heading text-headline-lg font-bold text-on-surface">
            {copy.successTitle}
          </h2>
          <p className="mt-4 max-w-lg text-body-lg text-on-surface-variant">
            {copy.successBody}
          </p>
          {selectedTour && (
            <div className="soft-outline mt-8 rounded-2xl bg-surface-container-low px-5 py-4 text-left">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                {copy.successTour}
              </p>
              <p className="mt-2 font-heading text-lg text-on-surface">
                {getTourName(selectedTour, locale)}
              </p>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="max-w-2xl">
            <p className="section-kicker">{copy.formEyebrow}</p>
            <h2 className="mt-5 font-heading text-headline-lg font-bold text-on-surface">
              {copy.formTitle}
            </h2>
            <p className="mt-4 text-body-lg text-on-surface-variant">
              {copy.formSubtitle}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="text-label-md font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                {t('preferredTour')}
              </label>
              <select
                value={form.tourId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, tourId: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">{copy.preferredTourPlaceholder}</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {getTourName(tour, locale)}
                  </option>
                ))}
              </select>
              {form.tourId && (
                <p className="mt-2 text-sm text-on-surface-variant">
                  {copy.selectedTourNote}
                </p>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <label className="text-label-md font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {t('name')}
                </label>
                <input
                  type="text"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-label-md font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                  {t('phone')}
                </label>
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, phone: event.target.value }))
                  }
                  className="mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div>
              <label className="text-label-md font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                {t('email')}
              </label>
              <input
                type="email"
                required
                value={form.email}
                onChange={(event) =>
                  setForm((current) => ({ ...current, email: event.target.value }))
                }
                className="mt-2 w-full rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-label-md font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
                {t('message')}
              </label>
              <textarea
                required
                rows={6}
                value={form.message}
                onChange={(event) =>
                  setForm((current) => ({ ...current, message: event.target.value }))
                }
                placeholder={copy.messagePlaceholder}
                className="mt-2 w-full resize-none rounded-2xl border border-outline-variant/50 bg-surface-container-low px-4 py-3.5 text-sm text-on-surface placeholder:text-on-surface-variant/70 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            {error && (
              <p className="rounded-2xl bg-error-container px-4 py-3 text-sm text-on-error-container">
                {error}
              </p>
            )}

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-medium text-on-surface">
                  {copy.responseHint}
                </p>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {copy.plannerTitle}: {siteSettings?.email || 'contact@explore-senegal.com'}
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3.5 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Send size={16} />
                <span>{loading ? copy.buttonLoading : copy.buttonIdle}</span>
              </button>
            </div>

            <div className="soft-outline rounded-2xl bg-surface-container-low px-5 py-4">
              <p className="text-sm font-semibold text-on-surface">{copy.plannerTitle}</p>
              <p className="mt-2 text-sm text-on-surface-variant">
                {copy.plannerBody}
              </p>
            </div>
          </form>
        </>
      )}
    </div>
  );
}
