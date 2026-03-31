'use client';

import { useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { Phone, Mail, MapPin, MessageCircle } from 'lucide-react';

export default function ContactPage() {
  const t = useTranslations('contact');
  const locale = useLocale();
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error: err } = await supabase.from('contacts').insert({
      name: form.name,
      email: form.email,
      phone: form.phone || null,
      message: form.message,
      status: 'new',
    });

    if (err) {
      setError(err.message);
    } else {
      setSuccess(true);
      setForm({ name: '', email: '', phone: '', message: '' });
    }
    setLoading(false);
  }

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-heading text-display-md font-extrabold text-on-surface">
          {t('title')}
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
          {t('subtitle')}
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-12 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <div className="rounded-xl bg-surface-container-lowest p-8 shadow-ambient">
              {success ? (
                <div className="py-12 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-tertiary-container">
                    <MessageCircle size={28} className="text-tertiary" />
                  </div>
                  <h2 className="mt-6 font-heading text-headline-md font-bold text-on-surface">
                    {locale === 'en'
                      ? 'Message sent!'
                      : locale === 'es'
                        ? '¡Mensaje enviado!'
                        : 'Message envoyé !'}
                  </h2>
                  <p className="mt-3 text-body-lg text-on-surface-variant">
                    {t('success')}
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                      {t('name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  <div className="grid gap-6 md:grid-cols-2">
                    <div>
                      <label className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                        {t('email')}
                      </label>
                      <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                        {t('phone')}
                      </label>
                      <input
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                      {t('message')}
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="mt-2 w-full resize-none rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {error && (
                    <p className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="gradient-primary w-full rounded-xl px-6 py-4 text-sm font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg disabled:opacity-50"
                  >
                    {loading ? '...' : t('send')}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-primary-fixed p-3">
                    <Phone size={20} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-on-surface">WhatsApp</h3>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                      {t('whatsapp')}
                    </p>
                    <a
                      href="https://wa.me/221770000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
                    >
                      +221 77 000 00 00
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-tertiary-fixed p-3">
                    <Mail size={20} className="text-tertiary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-on-surface">Email</h3>
                    <a
                      href="mailto:contact@explore-senegal.com"
                      className="mt-1 text-sm text-on-surface-variant hover:text-primary"
                    >
                      contact@explore-senegal.com
                    </a>
                  </div>
                </div>
              </div>

              <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
                <div className="flex items-start gap-4">
                  <div className="rounded-xl bg-secondary-fixed p-3">
                    <MapPin size={20} className="text-secondary" />
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-on-surface">
                      {locale === 'en' ? 'Location' : locale === 'es' ? 'Ubicación' : 'Localisation'}
                    </h3>
                    <p className="mt-1 text-body-md text-on-surface-variant">
                      Mbodienne, Sénégal
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
