'use client';

import {
  useState,
  useEffect,
  useCallback,
  useRef,
  type ChangeEvent,
  type DragEvent,
} from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Image as ImageIcon,
  Upload,
  Film,
  Loader2,
  Trash2,
  ExternalLink,
  Copy,
  X,
} from 'lucide-react';

import { AdminPageLoader } from '@/components/admin/AdminPageLoader';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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

interface PendingUploadItem {
  id: string;
  file: File;
  previewUrl: string;
  type: 'image' | 'video';
  customName: string;
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
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [pendingUploads, setPendingUploads] = useState<PendingUploadItem[]>([]);
  const [altTextDraft, setAltTextDraft] = useState('');
  const [savingAltText, setSavingAltText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const pendingUploadsRef = useRef<PendingUploadItem[]>([]);

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

  useEffect(() => {
    pendingUploadsRef.current = pendingUploads;
  }, [pendingUploads]);

  useEffect(() => {
    return () => {
      pendingUploadsRef.current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });
    };
  }, []);

  function openDetail(media: MediaItem) {
    setSelectedMedia(media);
    setAltTextDraft(media.alt_text ?? '');
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

  async function handleSaveAltText() {
    if (!selectedMedia) {
      return;
    }

    setSavingAltText(true);

    const nextAltText = altTextDraft.trim() || null;
    const { error } = await supabase
      .from('media')
      .update({ alt_text: nextAltText })
      .eq('id', selectedMedia.id);

    if (error) {
      toast.error(error.message);
      setSavingAltText(false);
      return;
    }

    const updatedMedia = {
      ...selectedMedia,
      alt_text: nextAltText,
    };

    setSelectedMedia(updatedMedia);
    setMediaItems((current) =>
      current.map((item) =>
        item.id === selectedMedia.id ? { ...item, alt_text: nextAltText } : item
      )
    );

    toast.success('Texte alternatif enregistre');
    setSavingAltText(false);
    router.refresh();
  }

  function normalizeBaseName(fileName: string) {
    return fileName.replace(/\.[^.]+$/, '').replace(/[-_]+/g, ' ').trim();
  }

  function formatFileSize(size: number) {
    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(1)} MB`;
    }

    return `${Math.max(1, Math.round(size / 1024))} KB`;
  }

  function addPendingFiles(files: File[]) {
    const validFiles = files.filter(
      (file) => file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    const invalidCount = files.length - validFiles.length;

    if (invalidCount > 0) {
      toast.error(
        invalidCount === 1
          ? '1 fichier a ete ignore car son format n est pas supporte'
          : `${invalidCount} fichiers ont ete ignores car leur format n est pas supporte`
      );
    }

    if (validFiles.length === 0) {
      return;
    }

    setPendingUploads((current) => [
      ...current,
      ...validFiles.map<PendingUploadItem>((file, index) => ({
        id: `${file.name}-${file.size}-${file.lastModified}-${Date.now()}-${index}`,
        file,
        previewUrl: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
        customName: normalizeBaseName(file.name),
      })),
    ]);
  }

  function removePendingUpload(id: string) {
    setPendingUploads((current) => {
      const item = current.find((entry) => entry.id === id);
      if (item) {
        URL.revokeObjectURL(item.previewUrl);
      }

      return current.filter((entry) => entry.id !== id);
    });
  }

  function clearPendingUploads() {
    setPendingUploads((current) => {
      current.forEach((item) => {
        URL.revokeObjectURL(item.previewUrl);
      });

      return [];
    });
  }

  function updatePendingName(id: string, value: string) {
    setPendingUploads((current) =>
      current.map((item) =>
        item.id === id ? { ...item, customName: value } : item
      )
    );
  }

  async function handleUploadPending() {
    if (pendingUploads.length === 0) {
      return;
    }

    setUploading(true);

    const formData = new FormData();
    pendingUploads.forEach((item) => {
      formData.append('files', item.file);
      formData.append('customNames', item.customName.trim());
    });

    try {
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            uploadedCount?: number;
            failed?: Array<{ name: string; error: string }>;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || 'Televersement impossible');
      }

      const uploadedCount = payload?.uploadedCount ?? pendingUploads.length;
      const failed = payload?.failed ?? [];

      if (uploadedCount > 0) {
        toast.success(
          uploadedCount === 1
            ? '1 fichier televerse dans la mediatheque'
            : `${uploadedCount} fichiers televerses dans la mediatheque`
        );
      }

      if (failed.length > 0) {
        toast.error(
          failed.length === 1
            ? `1 fichier a echoue: ${failed[0].name}`
            : `${failed.length} fichiers n ont pas pu etre televerses`
        );
      }

      await fetchMedia();
      clearPendingUploads();
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Televersement impossible'
      );
    } finally {
      setUploading(false);
    }
  }

  function handleFileInputChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files ?? []);
    addPendingFiles(files);
    event.target.value = '';
  }

  function handleOpenFilePicker() {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  }

  function handleDragOver(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (!uploading) {
      setDragActive(true);
    }
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    setDragActive(false);

    if (uploading) {
      return;
    }

    const files = Array.from(event.dataTransfer.files ?? []);
    addPendingFiles(files);
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
    return <AdminPageLoader />;
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
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        className="hidden"
        onChange={handleFileInputChange}
      />
      <div
        role="button"
        tabIndex={0}
        onClick={handleOpenFilePicker}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleOpenFilePicker();
          }
        }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={cn(
          'group mt-8 cursor-pointer rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient transition-all',
          uploading
            ? 'pointer-events-none opacity-80'
            : 'hover:shadow-lg',
          dragActive
            ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface-container-low'
            : ''
        )}
      >
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#feb234]/10 text-[#feb234] transition-transform group-hover:scale-110">
          {uploading ? (
            <Loader2 size={28} className="animate-spin" />
          ) : (
            <Upload size={28} />
          )}
        </div>
        <p className="mt-4 font-heading text-body-lg font-semibold text-on-surface">
          {uploading
            ? 'Televersement en cours...'
            : pendingUploads.length > 0
              ? 'Ajoutez d autres fichiers ou lancez l envoi'
              : 'Zone de telechargement'}
        </p>
        <p className="mt-1 text-body-md text-on-surface-variant">
          Glissez-deposez vos fichiers ici ou cliquez pour selectionner.
        </p>
        <p className="mt-1 text-sm text-on-surface-variant/70">
          Formats acceptes: JPG, PNG, WEBP, GIF, MP4 et autres medias standards.
        </p>
        <Button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            handleOpenFilePicker();
          }}
          disabled={uploading}
          className="mt-4 rounded-xl gradient-primary px-5 py-2.5 text-white shadow-ambient"
          size="lg"
        >
          {uploading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Upload size={16} />
          )}
          {uploading
            ? 'Televersement...'
            : pendingUploads.length > 0
              ? 'Ajouter des fichiers'
              : 'Selectionner des fichiers'}
        </Button>
      </div>

      {pendingUploads.length > 0 && (
        <div className="mt-8 rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h2 className="font-heading text-xl font-bold text-on-surface">
                Apercu avant envoi
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Verifiez le groupe d images, renommez chaque fichier si besoin, puis
                lancez le televersement.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={clearPendingUploads}
                disabled={uploading}
                className="rounded-xl"
              >
                <X size={16} />
                Vider la selection
              </Button>
              <Button
                type="button"
                onClick={() => void handleUploadPending()}
                disabled={uploading}
                className="rounded-xl gradient-primary px-5 text-white shadow-ambient"
              >
                {uploading ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <Upload size={16} />
                )}
                {uploading
                  ? 'Televersement...'
                  : `Televerser ${pendingUploads.length} fichier${
                      pendingUploads.length > 1 ? 's' : ''
                    }`}
              </Button>
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {pendingUploads.map((item) => (
              <div
                key={item.id}
                className="overflow-hidden rounded-[1.25rem] border border-outline-variant/30 bg-surface-container-low"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-surface-container">
                  {item.type === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt={item.customName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <video
                      src={item.previewUrl}
                      className="h-full w-full object-cover"
                      muted
                      playsInline
                      preload="metadata"
                    />
                  )}

                  <button
                    type="button"
                    onClick={() => removePendingUpload(item.id)}
                    disabled={uploading}
                    className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 bg-black/45 text-white backdrop-blur-sm transition-colors hover:bg-black/60"
                  >
                    <X size={16} />
                  </button>

                  <div className="absolute bottom-3 left-3 flex gap-2">
                    <Badge className="rounded-full bg-white/85 text-[#7a3100] shadow-sm">
                      {item.type === 'image' ? 'Image' : 'Video'}
                    </Badge>
                    <Badge className="rounded-full bg-black/45 text-white backdrop-blur-sm">
                      {formatFileSize(item.file.size)}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 p-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                      Nom actuel
                    </p>
                    <p className="mt-1 text-sm text-on-surface">{item.file.name}</p>
                  </div>

                  <div>
                    <label className="text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                      Renommer avant envoi
                    </label>
                    <input
                      type="text"
                      value={item.customName}
                      onChange={(event) =>
                        updatePendingName(item.id, event.target.value)
                      }
                      disabled={uploading}
                      className="mt-2 h-10 w-full rounded-xl border border-outline-variant/35 bg-surface-container-lowest px-3 text-sm text-on-surface outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring/20"
                      placeholder="Nom de l image"
                    />
                    <p className="mt-2 text-xs text-on-surface-variant">
                      L extension est conservee automatiquement.
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Texte alternatif
                    </p>
                    <Textarea
                      value={altTextDraft}
                      onChange={(event) => setAltTextDraft(event.target.value)}
                      rows={3}
                      className="mt-2 rounded-xl bg-surface-container-low"
                      placeholder="Decrivez l image pour l accessibilite et le SEO"
                    />
                    <p className="mt-2 text-xs text-on-surface-variant">
                      Ce texte est utilise pour decrire l image sur le site.
                    </p>
                  </div>
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
                  variant="outline"
                  onClick={() => void handleSaveAltText()}
                  disabled={savingAltText}
                  className="rounded-xl"
                >
                  {savingAltText && <Loader2 size={14} className="animate-spin" />}
                  Enregistrer le texte alternatif
                </Button>
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
