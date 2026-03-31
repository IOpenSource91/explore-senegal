'use client';

import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';

export function Footer() {
  const t = useTranslations('footer');
  const nav = useTranslations('nav');

  return (
    <footer className="bg-surface-container-high">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="font-heading text-xl font-bold text-on-surface">
              Explore Sénégal
            </h3>
            <p className="mt-4 max-w-md text-body-md text-on-surface-variant">
              {t('tagline')}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-on-surface">
              {t('quickLinks')}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <Link href="/circuits" className="text-sm text-on-surface-variant hover:text-primary">
                  {nav('tours')}
                </Link>
              </li>
              <li>
                <Link href="/destinations" className="text-sm text-on-surface-variant hover:text-primary">
                  {nav('destinations')}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-on-surface-variant hover:text-primary">
                  {nav('about')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-sm text-on-surface-variant hover:text-primary">
                  {nav('contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading text-sm font-semibold uppercase tracking-wider text-on-surface">
              {t('support')}
            </h4>
            <ul className="mt-4 space-y-3">
              <li>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary">
                  {t('privacy')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary">
                  {t('terms')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary">
                  {t('faq')}
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-on-surface-variant hover:text-primary">
                  {t('sustainability')}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-outline-variant/15 pt-8 text-center text-sm text-on-surface-variant">
          &copy; {new Date().getFullYear()} Explore Sénégal. {t('rights')}.
        </div>
      </div>
    </footer>
  );
}
