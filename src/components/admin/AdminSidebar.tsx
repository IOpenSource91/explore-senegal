'use client';

import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import {
  LayoutDashboard,
  Map,
  MapPin,
  Briefcase,
  Image,
  CalendarCheck,
  Settings,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const sidebarItems = [
  { key: 'dashboard', href: '/dashboard', icon: LayoutDashboard },
  { key: 'tours', href: '/dashboard/circuits', icon: Map },
  { key: 'destinations', href: '/dashboard/destinations', icon: MapPin },
  { key: 'services', href: '/dashboard/services', icon: Briefcase },
  { key: 'mediaLibrary', href: '/dashboard/media', icon: Image },
  { key: 'bookings', href: '/dashboard/reservations', icon: CalendarCheck },
  { key: 'settings', href: '/dashboard/settings', icon: Settings },
];

export function AdminSidebar() {
  const t = useTranslations('admin');
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-64 flex-shrink-0 border-r border-outline-variant/10 bg-surface-container-lowest lg:block">
      <div className="flex h-full flex-col overflow-hidden">
        {/* Logo */}
        <div className="px-6 py-6">
          <p className="text-label-md font-semibold uppercase tracking-widest text-primary-container">
            Portail Admin
          </p>
          <Link
            href="/"
            className="mt-1 font-heading text-lg font-bold text-on-surface"
          >
            Explore Sénégal
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3">
          {sidebarItems.map((item) => {
            const isActive =
              item.href === '/dashboard'
                ? pathname === item.href
                : pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'relative flex items-center gap-3 rounded-2xl border px-3.5 py-3 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'border-primary/15 bg-[linear-gradient(135deg,rgba(156,61,0,0.14),rgba(254,178,52,0.08))] text-on-surface shadow-[0_14px_34px_-26px_rgba(156,61,0,0.55)]'
                    : 'border-transparent text-on-surface-variant hover:border-outline-variant/25 hover:bg-surface-container-low hover:text-on-surface'
                )}
              >
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    isActive
                      ? 'bg-primary text-white shadow-[0_12px_24px_-16px_rgba(156,61,0,0.8)]'
                      : 'bg-surface-container-low text-on-surface-variant'
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className="flex-1">{t(item.key as any)}</span>
                <span
                  className={cn(
                    'h-2.5 w-2.5 rounded-full transition-all duration-200',
                    isActive
                      ? 'bg-primary shadow-[0_0_0_6px_rgba(156,61,0,0.08)]'
                      : 'bg-transparent'
                  )}
                />
              </Link>
            );
          })}
        </nav>

        {/* Quick action */}
        <div className="mt-auto p-4">
          <div className="rounded-xl bg-secondary-container/20 p-4">
            <p className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
              Action interne
            </p>
            <Link
              href="/dashboard/circuits/new"
              className="mt-3 flex items-center gap-2 rounded-xl bg-primary-container px-4 py-2.5 text-sm font-semibold text-on-primary-container transition-all hover:shadow-ambient"
            >
              <Plus size={16} />
              {t('addTour')}
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
