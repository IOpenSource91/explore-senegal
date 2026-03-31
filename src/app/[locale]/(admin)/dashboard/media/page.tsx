'use client';

import { useState, useEffect, useCallback } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Film,
  Trash2,
  ExternalLink,
  Copy,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface MediaItem {
  id: string;
  url: string;
  alt_text: string | null;
  type: string;
  sort_order: number | null;
  tour_id: string | null;
  destination_id: string | null;
  created_at: string;
  tours?: { name: string } | null;
  destinations?: { name: string } | null;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, scale: 0.9, transition: { duration: 0.2 } },
};

export default function MediaPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mediaItems, setMediaItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null);

  const fetchMedia = useCallback(async () => {
    const { data } = await supabase
      .from('media')
      .select('*, tours(name), destinations(name)')
      .order('sort_order', { ascending: true });
    setMediaItems((data as MediaItem[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMedia();
  }, [fetchMedia]);

  function openDetail(media: MediaItem) {
    setSelectedMedia(media);
    setDetailOpen(true);
  }

  function openDeleteFromDetail() {
    setDetailOpen(false);
    setDeleteOpen(true);
  }

  async function handleDelete() {
    if (!selectedMedia) return;

    const { error } = await supabase.from('media').delete().eq('id', selectedMedia.id);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Media supprime');
    setDeleteOpen(false);
    setSelectedMedia(null);
    fetchMedia();
    router.refresh();
  }

  function copyUrl(url: string) {
    navigator.clipboard.writeText(url);
    toast.success('URL copiee');
  }

  function getLinkedName(media: MediaItem): string | null {
    if (media.tours) {
      return media.tours.name || null;
    }
    if (media.destinations) {
      return media.destinations.name || null;
    }
    return null;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9c3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="font-heading text-headline-lg font-bold text-on-surface">
          Mediatheque
        </h1>
        <p className="mt-1 text-body-lg text-on-surface-variant">
          Gerez vos images et videos.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="mt-8 group rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient transition-all hover:shadow-lg cursor-pointer">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#feb234]/10 text-[#feb234] transition-transform group-hover:scale-110">
          <Upload size={28} />
        </div>
        <p className="mt-4 font-heading text-body-lg font-semibold text-on-surface">
          Zone de telechargement
        </p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Glissez-deposez vos fichiers ici ou cliquez pour selectionner.
        </p>
        <Button
          className="mt-4 rounded-xl gradient-primary px-5 py-2.5 text-white shadow-ambient"
          size="lg"
        >
          <Upload size={16} />
          Selectionner des fichiers
        </Button>
      </div>

      {/* Media Grid (masonry-like with varied heights) */}
      <div className="mt-8 columns-2 gap-4 sm:columns-3 lg:columns-4 [&>*]:mb-4">
        <AnimatePresence mode="popLayout">
          {mediaItems.length > 0 ? (
            mediaItems.map((media, i) => {
              const linkedName = getLinkedName(media);
              return (
                <motion.div
                  key={media.id}
                  custom={i}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="group break-inside-avoid overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient transition-shadow hover:shadow-lg cursor-pointer"
                  onClick={() => openDetail(media)}
                >
                  <div className="relative bg-surface-container-low">
                    {media.type === 'image' ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={media.url}
                        alt={media.alt_text || ''}
                        className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex aspect-video w-full items-center justify-center">
                        <Film size={40} className="text-on-surface-variant/40" />
                      </div>
                    )}
                    {/* Overlay on hover */}
                    <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity group-hover:opacity-100">
                      <div className="p-3">
                        <Badge
                          variant="secondary"
                          className="rounded-lg bg-white/20 text-white backdrop-blur-sm text-xs"
                        >
                          {media.type}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="p-3">
                    {media.alt_text && (
                      <p className="text-sm text-on-surface line-clamp-1 font-medium">
                        {media.alt_text}
                      </p>
                    )}
                    {linkedName && (
                      <p className="mt-0.5 text-xs text-on-surface-variant">
                        {linkedName}
                      </p>
                    )}
                  </div>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient">
              <ImageIcon size={40} className="mx-auto text-on-surface-variant/40" />
              <p className="mt-4 text-body-lg text-on-surface-variant">
                Aucun media pour le moment.
              </p>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          {selectedMedia && (
            <>
              <DialogHeader>
                <DialogTitle className="font-heading text-lg font-bold text-on-surface">
                  {selectedMedia.alt_text || 'Media'}
                </DialogTitle>
                <DialogDescription>
                  <Badge variant="secondary" className="rounded-lg">
                    {selectedMedia.type}
                  </Badge>
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Preview */}
                <div className="overflow-hidden rounded-xl bg-surface-container-low">
                  {selectedMedia.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={selectedMedia.url}
                      alt={selectedMedia.alt_text || ''}
                      className="w-full object-contain max-h-80"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center">
                      <Film size={48} className="text-on-surface-variant/40" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="space-y-2">
                  {selectedMedia.alt_text && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Texte alternatif
                      </p>
                      <p className="text-sm text-on-surface">{selectedMedia.alt_text}</p>
                    </div>
                  )}
                  {getLinkedName(selectedMedia) && (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                        Associe a
                      </p>
                      <p className="text-sm text-on-surface">{getLinkedName(selectedMedia)}</p>
                    </div>
                  )}
                </div>

                {/* URL Actions */}
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyUrl(selectedMedia.url)}
                    className="rounded-lg"
                  >
                    <Copy size={14} />
                    Copier l&apos;URL
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(selectedMedia.url, '_blank')}
                    className="rounded-lg"
                  >
                    <ExternalLink size={14} />
                    Ouvrir
                  </Button>
                </div>
              </div>

              <DialogFooter>
                <Button
                  variant="destructive"
                  onClick={openDeleteFromDetail}
                  className="rounded-xl"
                >
                  <Trash2 size={14} />
                  Supprimer
                </Button>
                <DialogClose render={<Button variant="outline" className="rounded-xl" />}>
                  Fermer
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-on-surface">
              Supprimer le media
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer ce media ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="rounded-xl" />}>
              Annuler
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl"
            >
              <Trash2 size={14} />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
