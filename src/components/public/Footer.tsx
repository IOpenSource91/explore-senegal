import { getLocale, getTranslations } from 'next-intl/server';
import { Mail, MapPin, MessageCircle } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { formatWhatsAppHref, getContactDetails } from '@/lib/public';

export async function Footer() {
  const [locale, t, nav] = await Promise.all([
    getLocale(),
    getTranslations('footer'),
    getTranslations('nav'),
  ]);

  const copy = {
    fr: {
      title: 'Des journees guides avec plus de presence locale et moins de tourisme impersonnel.',
      location: 'Ancrage',
      locationBody: 'Mbodienne, Lac Rose, Goree et la cote senegalaise.',
    },
    en: {
      title: 'Guided days with more local presence and less impersonal tourism.',
      location: 'Base',
      locationBody: 'Mbodienne, Lac Rose, Goree, and the Senegalese coast.',
    },
    es: {
      title: 'Jornadas guiadas con mas presencia local y menos turismo impersonal.',
      location: 'Base',
      locationBody: 'Mbodienne, Lac Rose, Goree y la costa senegalesa.',
    },
  }[(locale === 'en' || locale === 'es' ? locale : 'fr') as 'fr' | 'en' | 'es'];

  const supabase = await createServerSupabaseClient();
  const { data: settings } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'default')
    .maybeSingle();

  const contact = getContactDetails(settings);
  const whatsappHref = formatWhatsAppHref(contact.whatsapp);

  return (
    <footer className="mt-20 border-t border-outline-variant/25 bg-[#19120d] text-white">
      <div className="mx-auto max-w-7xl px-6 py-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_0.7fr_0.8fr]">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d29d6c]">
              Explore Senegal
            </p>
            <h3 className="mt-5 max-w-xl font-heading text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.02] text-white">
              {copy.title}
            </h3>
            <p className="mt-4 max-w-xl text-base leading-7 text-white/68">
              {t('tagline')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/circuits"
                className="inline-flex items-center rounded-full bg-white px-5 py-3 text-sm font-semibold text-[#7a360d] transition-transform duration-300 hover:-translate-y-0.5"
              >
                {nav('tours')}
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center rounded-full border border-white/12 px-5 py-3 text-sm font-semibold text-white/88 transition-colors hover:bg-white/8"
              >
                {nav('contact')}
              </Link>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d29d6c]">
              {t('quickLinks')}
            </h4>
            <div className="mt-5 grid gap-3">
              {[
                { href: '/', label: nav('home') },
                { href: '/circuits', label: nav('tours') },
                { href: '/destinations', label: nav('destinations') },
                { href: '/about', label: nav('about') },
                { href: '/contact', label: nav('contact') },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className="text-sm text-white/68 transition-colors hover:text-white"
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.22em] text-[#d29d6c]">
              {t('support')}
            </h4>
            <div className="mt-5 space-y-4">
              <a
                href={`mailto:${contact.email}`}
                className="block rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:bg-white/8"
              >
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-white/10 p-2 text-[#d29d6c]">
                    <Mail size={15} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">Email</span>
                    <span className="text-sm text-white/68">{contact.email}</span>
                  </span>
                </div>
              </a>

              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4 transition-colors hover:bg-white/8"
                >
                  <div className="flex items-start gap-3">
                    <span className="rounded-full bg-white/10 p-2 text-[#d29d6c]">
                      <MessageCircle size={15} />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-white">
                        WhatsApp
                      </span>
                      <span className="text-sm text-white/68">{contact.whatsapp}</span>
                    </span>
                  </div>
                </a>
              )}

              <div className="rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                <div className="flex items-start gap-3">
                  <span className="rounded-full bg-white/10 p-2 text-[#d29d6c]">
                    <MapPin size={15} />
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white">
                      {copy.location}
                    </span>
                    <span className="text-sm text-white/68">{copy.locationBody}</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-5 text-sm text-white/48">
          &copy; {new Date().getFullYear()} {contact.siteName}. {t('rights')}.
        </div>
      </div>
    </footer>
  );
}
