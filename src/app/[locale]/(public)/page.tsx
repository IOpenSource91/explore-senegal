import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import { ArrowRight, Compass, Heart, Users, Sparkles } from 'lucide-react';

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('hero');
  const sections = await getTranslations('sections');
  const why = await getTranslations('whyUs');

  return (
    <>
      {/* Hero Section */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
        {/* Background placeholder — replace with actual image from Supabase */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary-container/30 to-tertiary/10" />
        <div className="absolute inset-0 scrim-bottom" />

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h1 className="font-heading text-display-md font-extrabold text-on-surface md:text-display-lg">
            {t('title')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-body-lg text-on-surface-variant">
            {t('subtitle')}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/circuits"
              className="gradient-primary flex items-center gap-2 rounded-xl px-8 py-4 text-sm font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg"
            >
              {t('cta')}
              <ArrowRight size={18} />
            </Link>
            <Link
              href="/contact"
              className="rounded-xl bg-surface-container-highest px-8 py-4 text-sm font-semibold text-on-surface transition-colors hover:bg-surface-container-high"
            >
              {t('ctaSecondary')}
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Tours — TODO: fetch from Supabase */}
      <section className="bg-surface-container-low py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-heading text-headline-lg font-bold text-on-surface">
            {sections('featuredTours')}
          </h2>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {/* Placeholder tour cards — will be dynamic */}
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient transition-all hover:shadow-ambient-lg"
              >
                <div className="aspect-[4/3] bg-surface-container-high" />
                <div className="p-6">
                  <h3 className="font-heading text-lg font-bold text-on-surface">
                    Circuit à venir
                  </h3>
                  <p className="mt-2 text-body-md text-on-surface-variant">
                    Description du circuit — sera chargée depuis Supabase.
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="rounded-full bg-secondary-container px-3 py-1 text-label-md font-semibold text-on-surface">
                      À partir de —€
                    </span>
                    <Link
                      href="/circuits"
                      className="text-sm font-semibold text-primary hover:underline"
                    >
                      Voir les détails →
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-center font-heading text-headline-lg font-bold text-on-surface">
            {sections('whyUs')}
          </h2>
          <div className="mt-16 grid gap-8 md:grid-cols-4">
            {[
              { icon: Compass, key: 'localExpert' },
              { icon: Heart, key: 'authentic' },
              { icon: Users, key: 'smallGroups' },
              { icon: Sparkles, key: 'custom' },
            ].map(({ icon: Icon, key }) => (
              <div key={key} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-fixed">
                  <Icon size={28} className="text-primary" />
                </div>
                <h3 className="mt-6 font-heading text-base font-bold text-on-surface">
                  {why(key as any)}
                </h3>
                <p className="mt-3 text-body-md text-on-surface-variant">
                  {why(`${key}Desc` as any)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations — TODO: fetch from Supabase */}
      <section className="bg-surface-container-high py-24">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="font-heading text-headline-lg font-bold text-on-surface">
            {sections('destinations')}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {['Lac Rose', 'Île de Gorée', 'Mbodienne', 'Baobab de Nianing', 'Église de Nianing'].map(
              (dest) => (
                <div
                  key={dest}
                  className="group relative aspect-[3/2] overflow-hidden rounded-xl bg-surface-container"
                >
                  <div className="absolute inset-0 scrim-bottom" />
                  <div className="absolute bottom-0 left-0 p-6">
                    <h3 className="font-heading text-lg font-bold text-white">
                      {dest}
                    </h3>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="bg-primary-container py-24">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="font-heading text-headline-lg font-bold text-on-primary-container">
            {sections('newsletter')}
          </h2>
          <p className="mt-4 text-body-lg text-on-primary-container/80">
            {sections('newsletterSub')}
          </p>
          <form className="mt-8 flex gap-3">
            <input
              type="email"
              placeholder="Email"
              className="flex-1 rounded-xl bg-white/20 px-5 py-3 text-sm text-on-primary-container placeholder:text-on-primary-container/50 focus:bg-white/30 focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-on-primary-container px-6 py-3 text-sm font-semibold text-primary-container transition-colors hover:bg-on-surface"
            >
              S'inscrire
            </button>
          </form>
        </div>
      </section>
    </>
  );
}
