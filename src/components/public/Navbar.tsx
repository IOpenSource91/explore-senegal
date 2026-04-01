'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { ArrowRight, Compass, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export function Navbar() {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const links = [
    { href: '/', label: t('home') },
    { href: '/circuits', label: t('tours') },
    { href: '/destinations', label: t('destinations') },
    { href: '/about', label: t('about') },
    { href: '/contact', label: t('contact') },
  ];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  const isActiveLink = (href: string) =>
    href === '/'
      ? pathname === '/'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-4 pt-4 md:px-6">
      <nav
        className={cn(
          'glass mx-auto max-w-7xl rounded-[1.6rem] px-4 transition-all duration-300 md:px-6',
          scrolled ? 'py-2.5' : 'py-3.5'
        )}
      >
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="flex min-w-0 items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-ambient">
              <Compass size={19} />
            </span>
            <span className="min-w-0">
              <span className="block truncate font-heading text-lg font-bold text-on-surface">
                Explore Senegal
              </span>
              <span className="hidden text-[11px] uppercase tracking-[0.22em] text-on-surface-variant lg:block">
                Private routes. Local rhythm.
              </span>
            </span>
          </Link>

          <ul className="hidden items-center gap-1 xl:flex">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={cn(
                    'rounded-full px-4 py-2 text-sm font-medium transition-colors',
                    isActiveLink(link.href)
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:bg-surface-container-low hover:text-on-surface'
                  )}
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 md:gap-3">
            <LanguageSwitcher />
            <Link
              href="/contact"
              className="hidden items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-white transition-transform duration-300 hover:-translate-y-0.5 lg:inline-flex"
            >
              {t('bookNow')}
              <ArrowRight size={16} />
            </Link>
            <button
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-on-surface xl:hidden"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="mx-auto mt-3 max-w-7xl xl:hidden">
          <div className="surface-panel-strong rounded-[1.75rem] px-6 py-6">
            <ul className="space-y-3">
              {links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'block rounded-2xl px-4 py-3 text-base font-medium',
                      isActiveLink(link.href)
                        ? 'bg-primary text-white'
                        : 'bg-surface-container-low text-on-surface'
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  href="/contact"
                  onClick={() => setMobileOpen(false)}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3.5 text-center text-sm font-semibold text-white"
                >
                  {t('bookNow')}
                  <ArrowRight size={16} />
                </Link>
              </li>
            </ul>
          </div>
        </div>
      )}
    </header>
  );
}
