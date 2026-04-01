'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { Image as ImageIcon, Loader2, RefreshCw, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { cn, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';

interface MediaLibraryItem {
  id: string;
  url: string;
  alt_text: string | null;
  type: string;
  created_at?: string | null;
}

export function AdminImagePicker({
  open,
  value,
  onChange,
  uploadBaseName,
  label = 'Image de couverture',
  description = "Selectionnez une image de la mediatheque ou televersez-en une nouvelle.",
}: {
  open: boolean;
  value: string;
  onChange: (value: string) => void;
  uploadBaseName?: string;
  label?: string;
  description?: string;
}) {
  const [supabase] = useState(() => createClient());
  const [mediaItems, setMediaItems] = useState<MediaLibraryItem[]>([]);
  const [mediaLoading, setMediaLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const fetchMediaLibrary = useCallback(
    async (currentValue?: string) => {
      setMediaLoading(true);

      const { data, error } = await supabase
        .from('media')
        .select('id, url, alt_text, type, created_at')
        .eq('type', 'image')
        .order('created_at', { ascending: false })
        .limit(60);

      if (error) {
        toast.error(`Impossible de charger la mediatheque: ${error.message}`);
        setMediaLoading(false);
        return;
      }

      const items = (data as MediaLibraryItem[]) || [];
      setMediaItems(items);

      const nextValue = currentValue ?? '';
      if (nextValue) {
        const matchingItem = items.find((item) => item.url === nextValue);
        setSelectedMediaId(matchingItem?.id ?? null);
      } else {
        setSelectedMediaId(null);
      }

      setMediaLoading(false);
    },
    [supabase]
  );

  useEffect(() => {
    if (open) {
      void fetchMediaLibrary(value);
    }
  }, [open, fetchMediaLibrary, value]);

  useEffect(() => {
    if (!value) {
      setSelectedMediaId(null);
      return;
    }

    const matchingItem = mediaItems.find((item) => item.url === value);
    setSelectedMediaId(matchingItem?.id ?? null);
  }, [mediaItems, value]);

  function selectImage(mediaItem: MediaLibraryItem) {
    setSelectedMediaId(mediaItem.id);
    onChange(mediaItem.url);
  }

  function clearImage() {
    setSelectedMediaId(null);
    onChange('');
  }

  function openUploadPicker() {
    if (!uploadingImage) {
      fileInputRef.current?.click();
    }
  }

  async function uploadImage(file: File) {
    if (!file.type.startsWith('image/')) {
      toast.error('Utilisez une image valide.');
      return;
    }

    setUploadingImage(true);

    const formData = new FormData();
    formData.append('files', file);
    formData.append(
      'customNames',
      slugify(uploadBaseName || file.name.replace(/\.[^.]+$/, '')) ||
        file.name.replace(/\.[^.]+$/, '')
    );

    try {
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const payload = (await response.json().catch(() => null)) as
        | {
            error?: string;
            uploaded?: Array<{ id: string; url: string }>;
          }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error || 'Televersement impossible');
      }

      const uploadedItem = payload?.uploaded?.[0];

      if (!uploadedItem?.url) {
        throw new Error('Image televersee introuvable');
      }

      setSelectedMediaId(uploadedItem.id);
      onChange(uploadedItem.url);
      toast.success('Image televersee dans la mediatheque.');
      await fetchMediaLibrary(uploadedItem.url);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Televersement impossible'
      );
    } finally {
      setUploadingImage(false);
    }
  }

  async function handleUploadChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (file) {
      await uploadImage(file);
    }

    event.target.value = '';
  }

  return (
    <div className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <Label>{label}</Label>
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        </div>
        <div className="flex shrink-0 gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUploadChange}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void fetchMediaLibrary(value)}
            disabled={mediaLoading || uploadingImage}
          >
            {mediaLoading ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 size-3.5" />
            )}
            Actualiser
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={openUploadPicker}
            disabled={uploadingImage}
          >
            {uploadingImage ? (
              <Loader2 className="mr-1.5 size-3.5 animate-spin" />
            ) : (
              <Upload className="mr-1.5 size-3.5" />
            )}
            Televerser
          </Button>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/70 bg-muted/20">
        {value ? (
          <div className="space-y-3 p-3">
            <div className="overflow-hidden rounded-lg">
              <img
                src={value}
                alt="Apercu de l image selectionnee"
                className="h-40 w-full object-cover"
              />
            </div>
            <div className="flex items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                {selectedMediaId
                  ? 'Image selectionnee depuis la mediatheque.'
                  : 'Image prete a etre liee a ce contenu.'}
              </p>
              <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                <X className="mr-1.5 size-3.5" />
                Retirer
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 px-4 py-8 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#9c3d00]/10">
              <ImageIcon className="size-5 text-[#9c3d00]" />
            </div>
            <p className="text-sm font-medium text-foreground">
              Aucune image selectionnee
            </p>
            <p className="max-w-md text-xs text-muted-foreground">
              Choisissez une image plus bas ou televersez une nouvelle image
              directement depuis votre ordinateur.
            </p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border/70 bg-muted/10 p-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Mediatheque
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Cliquez sur une image pour l utiliser ici.
            </p>
          </div>
          <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {mediaItems.length} image{mediaItems.length > 1 ? 's' : ''}
          </span>
        </div>

        <ScrollArea className="mt-3 max-h-72">
          {mediaLoading ? (
            <div className="flex min-h-44 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-[#9c3d00]" />
            </div>
          ) : mediaItems.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {mediaItems.map((item, index) => {
                const isSelected =
                  selectedMediaId === item.id || value === item.url;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectImage(item)}
                    className={cn(
                      'overflow-hidden rounded-xl border bg-background text-left transition-all hover:border-[#9c3d00]/40 hover:shadow-sm',
                      isSelected
                        ? 'border-[#9c3d00] ring-2 ring-[#9c3d00]/20'
                        : 'border-border/70'
                    )}
                  >
                    <div className="relative h-28 overflow-hidden bg-muted/30">
                      <img
                        src={item.url}
                        alt={item.alt_text || `Image ${index + 1}`}
                        className="size-full object-cover"
                      />
                      {isSelected ? (
                        <span className="absolute right-2 top-2 rounded-full bg-[#9c3d00] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                          Choisie
                        </span>
                      ) : null}
                    </div>
                    <div className="p-3">
                      <p className="truncate text-sm font-medium text-foreground">
                        {item.alt_text?.trim() || `Image ${index + 1}`}
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {item.created_at
                          ? new Date(item.created_at).toLocaleDateString('fr-FR')
                          : 'Mediatheque'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center">
              <ImageIcon className="size-6 text-muted-foreground/50" />
              <p className="text-sm font-medium text-foreground">
                Aucune image disponible
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                Televersez une premiere image pour l utiliser ensuite dans les
                formulaires admin.
              </p>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
}
