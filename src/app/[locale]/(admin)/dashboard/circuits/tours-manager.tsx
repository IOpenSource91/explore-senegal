'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from '@/i18n/routing';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { cn, slugify, formatPrice } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import {
  Plus,
  Star,
  Clock,
  Users,
  Pencil,
  Trash2,
  Loader2,
  ImageIcon,
  Search,
  MapPin,
} from 'lucide-react';

import { AdminImagePicker } from '@/components/admin/AdminImagePicker';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Tour {
  id: string;
  name: string;
  name_en?: string | null;
  name_es?: string | null;
  slug: string;
  short_description?: string | null;
  short_description_en?: string | null;
  short_description_es?: string | null;
  long_description?: string | null;
  long_description_en?: string | null;
  long_description_es?: string | null;
  price?: number | null;
  currency?: string | null;
  duration?: string | null;
  max_group_size?: number | null;
  language?: string | null;
  difficulty?: string | null;
  cover_image?: string | null;
  status?: string | null;
  featured?: boolean | null;
  created_at?: string | null;
}

type FormData = {
  name: string;
  name_en: string;
  name_es: string;
  slug: string;
  short_description: string;
  short_description_en: string;
  short_description_es: string;
  long_description: string;
  long_description_en: string;
  long_description_es: string;
  price: string;
  currency: string;
  duration: string;
  max_group_size: string;
  language: string;
  difficulty: string;
  cover_image: string;
  status: string;
  featured: boolean;
};

const emptyForm: FormData = {
  name: '',
  name_en: '',
  name_es: '',
  slug: '',
  short_description: '',
  short_description_en: '',
  short_description_es: '',
  long_description: '',
  long_description_en: '',
  long_description_es: '',
  price: '',
  currency: 'EUR',
  duration: '',
  max_group_size: '',
  language: 'fr',
  difficulty: 'easy',
  cover_image: '',
  status: 'draft',
  featured: false,
};

function tourToForm(tour: Tour): FormData {
  return {
    name: tour.name ?? '',
    name_en: tour.name_en ?? '',
    name_es: tour.name_es ?? '',
    slug: tour.slug ?? '',
    short_description: tour.short_description ?? '',
    short_description_en: tour.short_description_en ?? '',
    short_description_es: tour.short_description_es ?? '',
    long_description: tour.long_description ?? '',
    long_description_en: tour.long_description_en ?? '',
    long_description_es: tour.long_description_es ?? '',
    price: tour.price != null ? String(tour.price) : '',
    currency: tour.currency ?? 'EUR',
    duration: tour.duration != null ? String(tour.duration) : '',
    max_group_size: tour.max_group_size != null ? String(tour.max_group_size) : '',
    language: tour.language ?? 'fr',
    difficulty: tour.difficulty ?? 'easy',
    cover_image: tour.cover_image ?? '',
    status: tour.status ?? 'draft',
    featured: tour.featured ?? false,
  };
}

function formToPayload(form: FormData) {
  return {
    name: form.name,
    name_en: form.name_en || null,
    name_es: form.name_es || null,
    slug: form.slug,
    short_description: form.short_description || null,
    short_description_en: form.short_description_en || null,
    short_description_es: form.short_description_es || null,
    long_description: form.long_description || null,
    long_description_en: form.long_description_en || null,
    long_description_es: form.long_description_es || null,
    price: form.price ? parseFloat(form.price) : null,
    currency: form.currency,
    duration: form.duration || null,
    difficulty: form.difficulty,
    max_group_size: form.max_group_size ? parseInt(form.max_group_size, 10) : null,
    language: form.language,
    status: form.status,
    featured: form.featured,
    cover_image: form.cover_image || null,
  };
}

// ---------------------------------------------------------------------------
// Section tabs for the form dialog
// ---------------------------------------------------------------------------

const SECTIONS = [
  { key: 'general', label: 'General' },
  { key: 'descriptions', label: 'Descriptions' },
  { key: 'details', label: 'Details' },
  { key: 'publication', label: 'Publication' },
] as const;

type SectionKey = (typeof SECTIONS)[number]['key'];

// ---------------------------------------------------------------------------
// Difficulty / language / currency labels
// ---------------------------------------------------------------------------

const difficultyLabels: Record<string, string> = {
  easy: 'Facile',
  moderate: 'Modere',
  challenging: 'Difficile',
};

const currencyLabels: Record<string, string> = {
  EUR: 'EUR',
  XOF: 'XOF (CFA)',
  USD: 'USD',
};

const languageLabels: Record<string, string> = {
  fr: 'Francais',
  en: 'Anglais',
  es: 'Espagnol',
};

// ---------------------------------------------------------------------------
// Component: TourFormDialog
// ---------------------------------------------------------------------------

function TourFormDialog({
  open,
  onOpenChange,
  tour,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour?: Tour | null;
  onSuccess: () => void;
}) {
  const isEdit = !!tour;
  const [form, setForm] = useState<FormData>(emptyForm);
  const [section, setSection] = useState<SectionKey>('general');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setForm(tour ? tourToForm(tour) : emptyForm);
      setSection('general');
    }
  }, [open, tour]);

  const update = useCallback(
    <K extends keyof FormData>(key: K, value: FormData[K]) => {
      setForm((prev) => {
        const next = { ...prev, [key]: value };
        if (key === 'name' && !isEdit) {
          next.slug = slugify(value as string);
        }
        return next;
      });
    },
    [isEdit]
  );

  async function handleSave() {
    if (!form.name.trim()) {
      toast.error('Le nom du circuit est requis.');
      return;
    }

    setSaving(true);
    const supabase = createClient();
    const payload = formToPayload(form);

    if (isEdit && tour) {
      const { error } = await supabase
        .from('tours')
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq('id', tour.id);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Circuit mis a jour avec succes.');
    } else {
      const { error } = await supabase.from('tours').insert(payload);

      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Circuit cree avec succes.');
    }

    setSaving(false);
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-2xl max-h-[90vh] flex flex-col"
        showCloseButton
      >
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            {isEdit ? 'Modifier le circuit' : 'Nouveau circuit'}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? `Modification de "${tour?.name}"`
              : 'Renseignez les informations du circuit.'}
          </DialogDescription>
        </DialogHeader>

        {/* Section tabs */}
        <div className="flex gap-1 rounded-lg bg-muted/60 p-1">
          {SECTIONS.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setSection(s.key)}
              className={cn(
                'flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-all',
                section === s.key
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>

        {/* Form sections */}
        <ScrollArea className="flex-1 -mx-4 px-4 max-h-[54vh]">
          <div className="space-y-5 py-2">
            <AnimatePresence mode="wait">
              {section === 'general' && (
                <motion.div
                  key="general"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <Label htmlFor="name">Nom (FR) *</Label>
                    <Input
                      id="name"
                      value={form.name}
                      onChange={(e) => update('name', e.target.value)}
                      placeholder="Circuit Casamance Authentique"
                      className="mt-1.5"
                    />
                  </FieldGroup>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup>
                      <Label htmlFor="name_en">Nom (EN)</Label>
                      <Input
                        id="name_en"
                        value={form.name_en}
                        onChange={(e) => update('name_en', e.target.value)}
                        placeholder="Authentic Casamance Tour"
                        className="mt-1.5"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label htmlFor="name_es">Nom (ES)</Label>
                      <Input
                        id="name_es"
                        value={form.name_es}
                        onChange={(e) => update('name_es', e.target.value)}
                        placeholder="Circuito Casamance Autentico"
                        className="mt-1.5"
                      />
                    </FieldGroup>
                  </div>

                  <FieldGroup>
                    <Label htmlFor="slug">Slug</Label>
                    <Input
                      id="slug"
                      value={form.slug}
                      onChange={(e) => update('slug', e.target.value)}
                      placeholder="circuit-casamance-authentique"
                      className="mt-1.5"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">
                      Genere automatiquement a partir du nom
                    </p>
                  </FieldGroup>
                </motion.div>
              )}

              {section === 'descriptions' && (
                <motion.div
                  key="descriptions"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <Label>Description courte (FR)</Label>
                    <Textarea
                      value={form.short_description}
                      onChange={(e) => update('short_description', e.target.value)}
                      placeholder="Un apercu du circuit..."
                      rows={2}
                      className="mt-1.5"
                    />
                  </FieldGroup>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup>
                      <Label>Description courte (EN)</Label>
                      <Textarea
                        value={form.short_description_en}
                        onChange={(e) => update('short_description_en', e.target.value)}
                        rows={2}
                        className="mt-1.5"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label>Description courte (ES)</Label>
                      <Textarea
                        value={form.short_description_es}
                        onChange={(e) => update('short_description_es', e.target.value)}
                        rows={2}
                        className="mt-1.5"
                      />
                    </FieldGroup>
                  </div>

                  <Separator className="my-2" />

                  <FieldGroup>
                    <Label>Description longue (FR)</Label>
                    <Textarea
                      value={form.long_description}
                      onChange={(e) => update('long_description', e.target.value)}
                      placeholder="Description detaillee du circuit..."
                      rows={4}
                      className="mt-1.5"
                    />
                  </FieldGroup>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FieldGroup>
                      <Label>Description longue (EN)</Label>
                      <Textarea
                        value={form.long_description_en}
                        onChange={(e) => update('long_description_en', e.target.value)}
                        rows={4}
                        className="mt-1.5"
                      />
                    </FieldGroup>
                    <FieldGroup>
                      <Label>Description longue (ES)</Label>
                      <Textarea
                        value={form.long_description_es}
                        onChange={(e) => update('long_description_es', e.target.value)}
                        rows={4}
                        className="mt-1.5"
                      />
                    </FieldGroup>
                  </div>
                </motion.div>
              )}

              {section === 'details' && (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FieldGroup>
                      <Label htmlFor="price">Prix</Label>
                      <Input
                        id="price"
                        type="number"
                        value={form.price}
                        onChange={(e) => update('price', e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="450"
                        className="mt-1.5"
                      />
                      <p className="mt-1 text-xs text-muted-foreground">
                        Laissez vide pour masquer le prix sur le site public.
                      </p>
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor="currency">Devise</Label>
                      <select
                        id="currency"
                        value={form.currency}
                        onChange={(e) => update('currency', e.target.value)}
                        className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {Object.entries(currencyLabels).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor="duration">Duree</Label>
                      <Input
                        id="duration"
                        value={form.duration}
                        onChange={(e) => update('duration', e.target.value)}
                        placeholder="1 journee"
                        className="mt-1.5"
                      />
                    </FieldGroup>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FieldGroup>
                      <Label htmlFor="difficulty">Difficulte</Label>
                      <select
                        id="difficulty"
                        value={form.difficulty}
                        onChange={(e) => update('difficulty', e.target.value)}
                        className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {Object.entries(difficultyLabels).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor="max_group_size">Taille max. groupe</Label>
                      <Input
                        id="max_group_size"
                        type="number"
                        value={form.max_group_size}
                        onChange={(e) => update('max_group_size', e.target.value)}
                        min="1"
                        placeholder="12"
                        className="mt-1.5"
                      />
                    </FieldGroup>

                    <FieldGroup>
                      <Label htmlFor="language">Langue</Label>
                      <select
                        id="language"
                        value={form.language}
                        onChange={(e) => update('language', e.target.value)}
                        className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                      >
                        {Object.entries(languageLabels).map(([v, l]) => (
                          <option key={v} value={v}>{l}</option>
                        ))}
                      </select>
                    </FieldGroup>
                  </div>
                </motion.div>
              )}

              {section === 'publication' && (
                <motion.div
                  key="publication"
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 8 }}
                  transition={{ duration: 0.15 }}
                  className="space-y-4"
                >
                  <FieldGroup>
                    <Label htmlFor="status">Statut</Label>
                    <select
                      id="status"
                      value={form.status}
                      onChange={(e) => update('status', e.target.value)}
                      className="mt-1.5 h-8 w-full rounded-lg border border-input bg-transparent px-2.5 text-sm outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                    >
                      <option value="draft">Brouillon</option>
                      <option value="published">Publie</option>
                    </select>
                  </FieldGroup>

                  <FieldGroup>
                    <AdminImagePicker
                      open={open}
                      value={form.cover_image}
                      onChange={(value) => update('cover_image', value)}
                      uploadBaseName={form.name}
                      label="Image de couverture"
                      description="Selectionnez une image de la mediatheque ou televersez-en une nouvelle. Aucun collage d URL n est necessaire ici."
                    />
                  </FieldGroup>

                  <div className="flex items-center justify-between rounded-xl bg-muted/40 px-4 py-3">
                    <div>
                      <p className="text-sm font-medium">Mettre en vedette</p>
                      <p className="text-xs text-muted-foreground">
                        Afficher sur la page d&apos;accueil
                      </p>
                    </div>
                    <Switch
                      checked={form.featured}
                      onCheckedChange={(val) => update('featured', val as boolean)}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Annuler
          </Button>
          <Button
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="bg-[#9c3d00] text-white hover:bg-[#9c3d00]/90"
          >
            {saving && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {isEdit ? 'Enregistrer' : 'Creer le circuit'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Component: DeleteConfirmDialog
// ---------------------------------------------------------------------------

function DeleteConfirmDialog({
  open,
  onOpenChange,
  tour,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tour: Tour | null;
  onSuccess: () => void;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    if (!tour) return;
    setDeleting(true);

    const supabase = createClient();

    // Delete related records first
    await supabase.from('tour_itinerary').delete().eq('tour_id', tour.id);
    await supabase.from('tour_destinations').delete().eq('tour_id', tour.id);

    const { error } = await supabase.from('tours').delete().eq('id', tour.id);

    if (error) {
      toast.error(error.message);
      setDeleting(false);
      return;
    }

    toast.success(`"${tour.name}" a ete supprime.`);
    setDeleting(false);
    onOpenChange(false);
    onSuccess();
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="font-heading text-lg">
            Supprimer ce circuit ?
          </DialogTitle>
          <DialogDescription>
            Cette action est irreversible. Le circuit &laquo;{tour?.name}&raquo; et
            toutes ses donnees associees seront definitivement supprimes.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            disabled={deleting}
          >
            Annuler
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            Supprimer definitivement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ---------------------------------------------------------------------------
// Component: FieldGroup (small wrapper)
// ---------------------------------------------------------------------------

function FieldGroup({ children }: { children: React.ReactNode }) {
  return <div className="space-y-0">{children}</div>;
}

// ---------------------------------------------------------------------------
// Row animation variants
// ---------------------------------------------------------------------------

const cardVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.04, duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

// ---------------------------------------------------------------------------
// Main: ToursManager
// ---------------------------------------------------------------------------

export function ToursManager({
  initialTours,
  error,
}: {
  initialTours: Tour[];
  error?: string;
}) {
  const router = useRouter();
  const [search, setSearch] = useState('');

  // Dialog states
  const [formOpen, setFormOpen] = useState(false);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingTour, setDeletingTour] = useState<Tour | null>(null);

  function handleRefresh() {
    router.refresh();
  }

  function openCreate() {
    setEditingTour(null);
    setFormOpen(true);
  }

  function openEdit(tour: Tour) {
    setEditingTour(tour);
    setFormOpen(true);
  }

  function openDelete(tour: Tour) {
    setDeletingTour(tour);
    setDeleteOpen(true);
  }

  const filtered = initialTours.filter((t) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  );

  const publishedCount = initialTours.filter((t) => t.status === 'published').length;
  const draftCount = initialTours.filter((t) => t.status === 'draft').length;

  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Circuits
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Gerez vos circuits touristiques
          </p>
        </div>
        <Button
          onClick={openCreate}
          size="lg"
          className="bg-[#9c3d00] text-white shadow-[0_20px_40px_rgba(156,61,0,0.08)] hover:bg-[#9c3d00]/90"
        >
          <Plus className="mr-1.5 size-4" />
          Nouveau Circuit
        </Button>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="rounded-xl bg-muted/40 px-5 py-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {initialTours.length}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-emerald-500/5 px-5 py-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-600">
            Publies
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-emerald-700">
            {publishedCount}
          </p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="rounded-xl bg-muted/40 px-5 py-4"
        >
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Brouillons
          </p>
          <p className="mt-1 font-heading text-2xl font-bold text-foreground">
            {draftCount}
          </p>
        </motion.div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un circuit..."
          className="pl-9"
        />
      </div>

      {/* Error state */}
      {error && (
        <div className="rounded-xl bg-destructive/5 px-5 py-4 text-sm text-destructive">
          Erreur lors du chargement des circuits.
        </div>
      )}

      {/* Empty state */}
      {!error && filtered.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center rounded-xl bg-muted/20 py-16 text-center"
        >
          <div className="flex size-14 items-center justify-center rounded-full bg-[#9c3d00]/10">
            <MapPin className="size-6 text-[#9c3d00]" />
          </div>
          <p className="mt-4 font-heading text-lg font-semibold text-foreground">
            {search ? 'Aucun resultat' : 'Aucun circuit'}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            {search
              ? 'Essayez un autre terme de recherche.'
              : 'Creez votre premier circuit pour commencer.'}
          </p>
          {!search && (
            <Button
              onClick={openCreate}
              size="sm"
              className="mt-5 bg-[#9c3d00] text-white hover:bg-[#9c3d00]/90"
            >
              <Plus className="mr-1.5 size-3.5" />
              Creer un circuit
            </Button>
          )}
        </motion.div>
      )}

      {/* Tour cards */}
      {filtered.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {filtered.map((tour, i) => (
              <motion.div
                key={tour.id}
                layout
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="group relative flex flex-col overflow-hidden rounded-xl bg-background shadow-[0_20px_40px_rgba(156,61,0,0.08)] transition-shadow hover:shadow-[0_20px_50px_rgba(156,61,0,0.14)]"
              >
                {/* Cover image */}
                <div className="relative h-40 overflow-hidden bg-muted/30">
                  {tour.cover_image ? (
                    <img
                      src={tour.cover_image}
                      alt={tour.name}
                      className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center">
                      <ImageIcon className="size-10 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Badges overlay */}
                  <div className="absolute left-3 top-3 flex items-center gap-1.5">
                    <Badge
                      variant={tour.status === 'published' ? 'default' : 'secondary'}
                      className={cn(
                        'text-[10px] uppercase tracking-wider',
                        tour.status === 'published' &&
                          'bg-emerald-600 text-white'
                      )}
                    >
                      {tour.status === 'published' ? 'Publie' : 'Brouillon'}
                    </Badge>
                  </div>

                  {tour.featured && (
                    <div className="absolute right-3 top-3">
                      <Star
                        className="size-5 text-amber-400 drop-shadow-md"
                        fill="currentColor"
                      />
                    </div>
                  )}
                </div>

                {/* Card body */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="font-heading text-base font-semibold leading-snug text-foreground line-clamp-2">
                    {tour.name}
                  </h3>

                  {tour.short_description && (
                    <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground line-clamp-2">
                      {tour.short_description}
                    </p>
                  )}

                  {/* Meta row */}
                  <div className="mt-auto flex items-center gap-3 pt-4 text-xs text-muted-foreground">
                    {tour.price != null && (
                      <span className="font-semibold text-[#9c3d00]">
                        {formatPrice(tour.price, tour.currency || 'EUR')}
                      </span>
                    )}
                    {tour.duration && (
                      <span className="inline-flex items-center gap-1">
                        <Clock className="size-3" />
                        {tour.duration}
                      </span>
                    )}
                    {tour.max_group_size && (
                      <span className="inline-flex items-center gap-1">
                        <Users className="size-3" />
                        {tour.max_group_size}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(tour)}
                      className="flex-1"
                    >
                      <Pencil className="mr-1 size-3" />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => openDelete(tour)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Dialogs */}
      <TourFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        tour={editingTour}
        onSuccess={handleRefresh}
      />
      <DeleteConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        tour={deletingTour}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
