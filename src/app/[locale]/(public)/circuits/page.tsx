import { useTranslations } from 'next-intl';
import { setRequestLocale } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { Link } from '@/i18n/routing';
import { Clock, Users } from 'lucide-react';

export default async function CircuitsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const { data: tours } = await supabase
    .from('tours')
    .select('*, tour_destinations(destination:destinations(*))')
    .eq('status', 'published')
    .order('created_at', { ascending: false });

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-heading text-display-md font-extrabold text-on-surface">
          Nos Circuits
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
          Plongez dans le rythme de l'Afrique de l'Ouest. Des eaux roses du Lac
          Rose aux échos historiques de l'Île de Gorée, découvrez l'âme du
          Sénégal à travers des expériences uniques.
        </p>
      </section>

      {/* Tour Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {tours?.map((tour) => (
            <Link
              key={tour.id}
              href={`/circuits/${tour.slug}` as any}
              className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient transition-all hover:shadow-ambient-lg"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
                {tour.cover_image && (
                  <img
                    src={tour.cover_image}
                    alt={tour.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                )}
                {tour.price && (
                  <span className="absolute right-4 top-4 rounded-full bg-secondary-container px-3 py-1 text-label-md font-bold text-on-surface">
                    {tour.price}$
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h2 className="font-heading text-lg font-bold text-on-surface">
                  {locale === 'en' && tour.name_en
                    ? tour.name_en
                    : locale === 'es' && tour.name_es
                      ? tour.name_es
                      : tour.name}
                </h2>
                <p className="mt-2 line-clamp-2 text-body-md text-on-surface-variant">
                  {locale === 'en' && tour.short_description_en
                    ? tour.short_description_en
                    : locale === 'es' && tour.short_description_es
                      ? tour.short_description_es
                      : tour.short_description}
                </p>

                <div className="mt-4 flex items-center gap-4 text-sm text-on-surface-variant">
                  {tour.duration && (
                    <span className="flex items-center gap-1.5">
                      <Clock size={14} />
                      {tour.duration}
                    </span>
                  )}
                  {tour.max_group_size && (
                    <span className="flex items-center gap-1.5">
                      <Users size={14} />
                      {tour.max_group_size} pers.
                    </span>
                  )}
                </div>

                <div className="mt-4">
                  <span className="text-sm font-semibold text-primary">
                    Voir les détails →
                  </span>
                </div>
              </div>
            </Link>
          ))}

          {(!tours || tours.length === 0) && (
            <div className="col-span-full py-16 text-center">
              <p className="text-body-lg text-on-surface-variant">
                Aucun circuit disponible pour le moment. Revenez bientôt !
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
