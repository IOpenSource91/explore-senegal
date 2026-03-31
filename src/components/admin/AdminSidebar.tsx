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
    <aside className="hidden w-64 flex-shrink-0 bg-surface-container-lowest lg:block">
      <div className="flex h-full flex-col">
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
            const isActive = pathname.includes(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.key}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary-fixed text-on-primary-fixed-variant'
                    : 'text-on-surface-variant hover:bg-surface-container-low'
                )}
              >
                <Icon size={20} />
                {t(item.key as any)}
              </Link>
            );
          })}
        </nav>

        {/* Quick action */}
        <div className="p-4">
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
