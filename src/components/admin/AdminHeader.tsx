'use client';

import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/shared/LanguageSwitcher';
import { Search, Bell, LogOut } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';

export function AdminHeader() {
  const t = useTranslations('admin');
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login' as any);
  }

  return (
    <header className="flex items-center justify-between border-b border-outline-variant/10 bg-surface-container-lowest px-6 py-4">
      {/* Search */}
      <div className="flex items-center gap-3 rounded-xl bg-surface-container-low px-4 py-2.5">
        <Search size={18} className="text-on-surface-variant" />
        <input
          type="text"
          placeholder="Rechercher des destinations, utilisateurs ou réservations..."
          className="w-80 bg-transparent text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none"
        />
      </div>

      {/* Right */}
      <div className="flex items-center gap-4">
        <LanguageSwitcher />
        <button className="relative rounded-xl p-2 text-on-surface-variant hover:bg-surface-container-low">
          <Bell size={20} />
        </button>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-on-surface-variant hover:bg-surface-container-low"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">{t('signOut')}</span>
        </button>
      </div>
    </header>
  );
}
