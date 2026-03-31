'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from '@/i18n/routing';

export default function LoginPage() {
  const t = useTranslations('admin');
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push('/dashboard' as any);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface">
      <div className="w-full max-w-md">
        <div className="rounded-2xl bg-surface-container-lowest p-8 shadow-ambient">
          {/* Logo */}
          <div className="text-center">
            <h1 className="font-heading text-2xl font-bold text-primary-container">
              Explore Sénégal
            </h1>
            <p className="mt-2 text-body-md text-on-surface-variant">
              {t('loginTitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('emailLabel')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@explore-senegal.com"
              />
            </div>
            <div>
              <label className="text-label-md font-semibold uppercase tracking-wider text-on-surface-variant">
                {t('passwordLabel')}
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="••••••••"
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
              className="gradient-primary w-full rounded-xl px-6 py-3.5 text-sm font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg disabled:opacity-50"
            >
              {loading ? '...' : t('signIn')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
