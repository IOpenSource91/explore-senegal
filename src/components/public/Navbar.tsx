'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { href: '/', label: t('home') },
    { href: '/circuits', label: t('tours') },
    { href: '/destinations', label: t('destinations') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  return (
    <header className="glass fixed top-0 z-50 w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="font-heading text-xl font-bold text-primary">
          Explore Sénégal
        </Link>

        {/* Desktop Links */}
        <ul className="hidden items-center gap-8 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname === link.href
                    ? 'text-primary'
                    : 'text-on-surface-variant'
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Right section */}
        <div className="flex items-center gap-4">
          <LanguageSwitcher />
          <Link
            href="/contact"
            className="hidden rounded-xl bg-primary-container px-5 py-2.5 text-sm font-semibold text-on-primary-container transition-all hover:shadow-ambient md:block"
          >
            {t('bookNow')}
          </Link>

          {/* Mobile toggle */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="glass border-t border-outline-variant/15 px-6 pb-6 md:hidden">
          <ul className="space-y-4 pt-4">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'block text-base font-medium',
                    pathname === link.href
                      ? 'text-primary'
                      : 'text-on-surface-variant'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/contact"
                onClick={() => setMobileOpen(false)}
                className="mt-2 block rounded-xl bg-primary-container px-5 py-3 text-center text-sm font-semibold text-on-primary-container"
              >
                {t('bookNow')}
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
}
