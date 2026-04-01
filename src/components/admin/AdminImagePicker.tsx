'use client';

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import {
  Image as ImageIcon,
  Loader2,
  RefreshCw,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { toast } from 'sonner';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { cn, slugify } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  const [search, setSearch] = useState('');
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

  const filteredItems = mediaItems.filter((item) => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return true;
    }

    const haystack = [item.alt_text, item.url]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return haystack.includes(query);
  });

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
    <div className="space-y-4">
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

      <div className="grid gap-4 lg:grid-cols-[minmax(0,0.92fr)_minmax(22rem,1.08fr)]">
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border border-border/70 bg-muted/20">
            {value ? (
              <div className="space-y-4 p-4">
                <div className="overflow-hidden rounded-xl bg-muted/30">
                  <img
                    src={value}
                    alt="Apercu de l image selectionnee"
                    className="h-72 w-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      Image de couverture selectionnee
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {selectedMediaId
                        ? 'Image liee depuis la mediatheque.'
                        : 'Image prete a etre liee a ce contenu.'}
                    </p>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                    <X className="mr-1.5 size-3.5" />
                    Retirer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex min-h-[22rem] flex-col items-center justify-center gap-3 px-6 py-10 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#9c3d00]/10">
                  <ImageIcon className="size-6 text-[#9c3d00]" />
                </div>
                <p className="text-base font-medium text-foreground">
                  Aucune image selectionnee
                </p>
                <p className="max-w-sm text-sm text-muted-foreground">
                  Choisissez une image dans la bibliotheque a droite ou
                  televersez-en une nouvelle directement.
                </p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Actions rapides
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
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
                Televerser une image
              </Button>
              {value ? (
                <Button type="button" variant="ghost" size="sm" onClick={clearImage}>
                  <X className="mr-1.5 size-3.5" />
                  Vider la selection
                </Button>
              ) : null}
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/10 p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Mediatheque
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Recherchez puis cliquez sur une image pour la choisir.
              </p>
            </div>
            <span className="rounded-full bg-background px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              {filteredItems.length}/{mediaItems.length}
            </span>
          </div>

          <div className="relative mt-4">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Rechercher une image..."
              className="pl-9"
            />
          </div>

          <ScrollArea className="mt-4 h-[34rem] pr-3">
          {mediaLoading ? (
            <div className="flex min-h-44 items-center justify-center">
              <Loader2 className="size-5 animate-spin text-[#9c3d00]" />
            </div>
          ) : filteredItems.length > 0 ? (
            <div className="space-y-3">
              {filteredItems.map((item, index) => {
                const isSelected =
                  selectedMediaId === item.id || value === item.url;

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => selectImage(item)}
                    className={cn(
                      'grid overflow-hidden rounded-xl border bg-background text-left transition-all hover:border-[#9c3d00]/40 hover:shadow-sm sm:grid-cols-[9rem_minmax(0,1fr)]',
                      isSelected
                        ? 'border-[#9c3d00] ring-2 ring-[#9c3d00]/20'
                        : 'border-border/70'
                    )}
                  >
                    <div className="relative h-32 overflow-hidden bg-muted/30 sm:h-full">
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
                    <div className="flex min-w-0 flex-col justify-between p-3">
                      <div>
                        <p className="truncate text-sm font-medium text-foreground">
                        {item.alt_text?.trim() || `Image ${index + 1}`}
                        </p>
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {item.url.split('/').pop()?.replace(/[-_]+/g, ' ') || 'Image'}
                        </p>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
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
                {search.trim() ? 'Aucun resultat' : 'Aucune image disponible'}
              </p>
              <p className="max-w-sm text-xs text-muted-foreground">
                {search.trim()
                  ? 'Essayez un autre mot-cle pour retrouver une image.'
                  : 'Televersez une premiere image pour l utiliser ensuite dans les formulaires admin.'}
              </p>
            </div>
          )}
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
