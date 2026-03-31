import { setRequestLocale } from 'next-intl/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export default async function DestinationsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const { data: destinations } = await supabase
    .from('destinations')
    .select('*')
    .order('name');

  return (
    <div className="pt-24">
      {/* Header */}
      <section className="mx-auto max-w-7xl px-6 py-12">
        <h1 className="font-heading text-display-md font-extrabold text-on-surface">
          {locale === 'en'
            ? 'Our Destinations'
            : locale === 'es'
              ? 'Nuestros Destinos'
              : 'Nos Destinations'}
        </h1>
        <p className="mt-4 max-w-2xl text-body-lg text-on-surface-variant">
          {locale === 'en'
            ? 'Explore the most beautiful places in Senegal, from the pink waters of Lac Rose to the historic streets of Gorée Island.'
            : locale === 'es'
              ? 'Explore los lugares más bellos de Senegal, desde las aguas rosas del Lac Rose hasta las calles históricas de la Isla de Gorée.'
              : "Explorez les plus beaux lieux du Sénégal, des eaux roses du Lac Rose aux rues historiques de l'Île de Gorée."}
        </p>
      </section>

      {/* Grid */}
      <section className="mx-auto max-w-7xl px-6 pb-24">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {destinations?.map((dest) => {
            const description =
              locale === 'en' && dest.description_en
                ? dest.description_en
                : locale === 'es' && dest.description_es
                  ? dest.description_es
                  : dest.description;

            const tagline =
              locale === 'en' && dest.tagline_en
                ? dest.tagline_en
                : locale === 'es' && dest.tagline_es
                  ? dest.tagline_es
                  : dest.tagline;

            return (
              <div
                key={dest.id}
                className="group overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient transition-all hover:shadow-ambient-lg"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container-high">
                  {dest.cover_image ? (
                    <img
                      src={dest.cover_image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <span className="font-heading text-2xl font-bold text-on-surface-variant/30">
                        {dest.name}
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 scrim-bottom" />
                  {tagline && (
                    <span className="absolute left-4 top-4 rounded-full bg-secondary-container px-3 py-1 text-label-md font-bold text-on-surface">
                      {tagline}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <h2 className="font-heading text-lg font-bold text-on-surface">
                    {dest.name}
                  </h2>
                  {description && (
                    <p className="mt-2 line-clamp-3 text-body-md text-on-surface-variant">
                      {description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}

          {(!destinations || destinations.length === 0) && (
            <div className="col-span-full py-16 text-center">
              <p className="text-body-lg text-on-surface-variant">
                {locale === 'en'
                  ? 'No destinations available yet. Come back soon!'
                  : locale === 'es'
                    ? 'No hay destinos disponibles. ¡Vuelva pronto!'
                    : 'Aucune destination disponible pour le moment. Revenez bientôt !'}
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
