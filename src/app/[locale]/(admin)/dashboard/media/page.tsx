import { setRequestLocale } from 'next-intl/server';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { Image as ImageIcon, Upload, Film } from 'lucide-react';

export default async function MediaPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const { data: mediaItems } = await supabase
    .from('media')
    .select('*, tours(name), destinations(name)')
    .order('sort_order', { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Mediatheque
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez vos images et videos.
          </p>
        </div>
      </div>

      {/* Upload placeholder */}
      <div className="mt-8 rounded-xl border-2 border-dashed border-outline-variant/15 bg-surface-container-lowest p-10 text-center">
        <Upload size={40} className="mx-auto text-on-surface-variant" />
        <p className="mt-4 font-heading text-body-lg font-semibold text-on-surface">
          Zone de telechargement
        </p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Glissez-deposez vos fichiers ici ou cliquez pour selectionner.
        </p>
        <button
          type="button"
          className="mt-4 inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient"
        >
          <Upload size={16} />
          Selectionner des fichiers
        </button>
      </div>

      {/* Media grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {mediaItems && mediaItems.length > 0 ? (
          mediaItems.map((media) => {
            const linkedName =
              (media as Record<string, unknown>).tours
                ? ((media as Record<string, unknown>).tours as { name: string })?.name
                : (media as Record<string, unknown>).destinations
                  ? ((media as Record<string, unknown>).destinations as { name: string })?.name
                  : null;

            return (
              <div
                key={media.id}
                className="group rounded-xl bg-surface-container-lowest shadow-ambient overflow-hidden"
              >
                <div className="relative aspect-square bg-surface-container-low">
                  {media.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={media.url}
                      alt={media.alt_text || ''}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Film size={40} className="text-on-surface-variant" />
                    </div>
                  )}
                  <div className="absolute left-2 top-2">
                    <span className="rounded-xl bg-surface-container-lowest/80 px-2 py-1 text-label-md font-semibold uppercase tracking-wider text-on-surface">
                      {media.type}
                    </span>
                  </div>
                </div>
                <div className="p-3">
                  {media.alt_text && (
                    <p className="text-body-md text-on-surface line-clamp-1">
                      {media.alt_text}
                    </p>
                  )}
                  {linkedName && (
                    <p className="mt-1 text-label-md text-on-surface-variant">
                      {linkedName}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient">
            <ImageIcon size={40} className="mx-auto text-on-surface-variant" />
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Aucun media pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
