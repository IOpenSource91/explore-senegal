'use client';

import { useState, useEffect, useCallback } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { slugify } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MapPin, Pencil, Trash2, Image as ImageIcon } from 'lucide-react';

import { AdminImagePicker } from '@/components/admin/AdminImagePicker';
import { AdminPageLoader } from '@/components/admin/AdminPageLoader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface Destination {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  tagline: string | null;
  tagline_en: string | null;
  tagline_es: string | null;
  cover_image: string | null;
  created_at: string;
}

const emptyForm = {
  name: '',
  slug: '',
  description: '',
  description_en: '',
  description_es: '',
  tagline: '',
  tagline_en: '',
  tagline_es: '',
  cover_image: '',
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.06, duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
  exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } },
};

export default function DestinationsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchDestinations = useCallback(async () => {
    const { data } = await supabase
      .from('destinations')
      .select('*')
      .order('created_at', { ascending: false });
    setDestinations((data as Destination[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchDestinations();
  }, [fetchDestinations]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(dest: Destination) {
    setForm({
      name: dest.name || '',
      slug: dest.slug || '',
      description: dest.description || '',
      description_en: dest.description_en || '',
      description_es: dest.description_es || '',
      tagline: dest.tagline || '',
      tagline_en: dest.tagline_en || '',
      tagline_es: dest.tagline_es || '',
      cover_image: dest.cover_image || '',
    });
    setEditingId(dest.id);
    setDialogOpen(true);
  }

  function openDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function handleNameChange(name: string) {
    setForm((prev) => ({ ...prev, name, slug: editingId ? prev.slug : slugify(name) }));
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      slug: form.slug,
      description: form.description || null,
      description_en: form.description_en || null,
      description_es: form.description_es || null,
      tagline: form.tagline || null,
      tagline_en: form.tagline_en || null,
      tagline_es: form.tagline_es || null,
      cover_image: form.cover_image || null,
    };

    if (editingId) {
      const { error } = await supabase.from('destinations').update(payload).eq('id', editingId);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Destination mise a jour');
    } else {
      const { error } = await supabase.from('destinations').insert(payload);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Destination creee');
    }

    setSaving(false);
    setDialogOpen(false);
    fetchDestinations();
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingId) return;
    setSaving(true);

    const { error } = await supabase.from('destinations').delete().eq('id', deletingId);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success('Destination supprimee');
    setSaving(false);
    setDeleteDialogOpen(false);
    setDeletingId(null);
    fetchDestinations();
    router.refresh();
  }

  if (loading) {
    return <AdminPageLoader />;
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Destinations
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez vos destinations touristiques.
          </p>
        </div>
        <Button
          onClick={openCreate}
          className="rounded-xl gradient-primary px-5 py-2.5 text-white shadow-ambient hover:shadow-lg"
          size="lg"
        >
          <Plus size={18} />
          Ajouter
        </Button>
      </div>

      {/* Card Grid */}
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {destinations.length > 0 ? (
            destinations.map((dest, i) => (
              <motion.div
                key={dest.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="group relative overflow-hidden rounded-xl bg-surface-container-lowest shadow-ambient transition-shadow hover:shadow-lg"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] bg-surface-container-low">
                  {dest.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={dest.cover_image}
                      alt={dest.name}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <ImageIcon size={40} className="text-on-surface-variant/30" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute bottom-3 left-3 right-3">
                    <h3 className="font-heading text-lg font-bold text-white drop-shadow-sm">
                      {dest.name}
                    </h3>
                    <Badge variant="secondary" className="mt-1 rounded-lg bg-white/20 text-white backdrop-blur-sm">
                      /{dest.slug}
                    </Badge>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {dest.tagline && (
                    <p className="text-body-md text-on-surface-variant italic line-clamp-2">
                      {dest.tagline}
                    </p>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openEdit(dest)}
                      className="rounded-xl text-[#0c6475]"
                    >
                      <Pencil size={14} />
                      Modifier
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => openDelete(dest.id)}
                      className="rounded-xl text-red-600"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient"
            >
              <MapPin size={40} className="mx-auto text-on-surface-variant/40" />
              <p className="mt-4 text-body-lg text-on-surface-variant">
                Aucune destination pour le moment.
              </p>
              <Button
                onClick={openCreate}
                className="mt-4 rounded-xl gradient-primary px-5 py-2.5 text-white shadow-ambient"
                size="lg"
              >
                <Plus size={18} />
                Ajouter une destination
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-h-[92vh] sm:max-w-5xl xl:max-w-6xl rounded-xl flex flex-col">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-on-surface">
              {editingId ? 'Modifier la destination' : 'Nouvelle destination'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifiez les informations de la destination.'
                : 'Remplissez les informations pour creer une nouvelle destination.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 -mx-4 max-h-[70vh] px-4">
            <form id="destination-form" onSubmit={handleSubmit} className="space-y-5 pr-2">
              {/* General Info */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Nom
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Ex: Dakar"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Slug
                    </Label>
                    <Input
                      value={form.slug}
                      onChange={(e) => updateField('slug', e.target.value)}
                      placeholder="dakar"
                      required
                      className="rounded-xl"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <AdminImagePicker
                    open={dialogOpen}
                    value={form.cover_image}
                    onChange={(value) => updateField('cover_image', value)}
                    uploadBaseName={form.name}
                    label="Image de couverture"
                    description="Choisissez une image existante dans la mediatheque ou televersez-en une nouvelle directement depuis ce formulaire."
                  />
                </div>
              </div>

              {/* Taglines */}
              <div className="rounded-xl bg-surface-container-low/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Accroches
                </p>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">FR</Label>
                    <Input
                      value={form.tagline}
                      onChange={(e) => updateField('tagline', e.target.value)}
                      placeholder="Accroche en francais"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">EN</Label>
                    <Input
                      value={form.tagline_en}
                      onChange={(e) => updateField('tagline_en', e.target.value)}
                      placeholder="Tagline in English"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">ES</Label>
                    <Input
                      value={form.tagline_es}
                      onChange={(e) => updateField('tagline_es', e.target.value)}
                      placeholder="Lema en espanol"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Descriptions */}
              <div className="rounded-xl bg-surface-container-low/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Descriptions
                </p>
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">FR</Label>
                    <Textarea
                      value={form.description}
                      onChange={(e) => updateField('description', e.target.value)}
                      placeholder="Description en francais"
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">EN</Label>
                    <Textarea
                      value={form.description_en}
                      onChange={(e) => updateField('description_en', e.target.value)}
                      placeholder="Description in English"
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">ES</Label>
                    <Textarea
                      value={form.description_es}
                      onChange={(e) => updateField('description_es', e.target.value)}
                      placeholder="Descripcion en espanol"
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" className="rounded-xl" />}
            >
              Annuler
            </DialogClose>
            <Button
              type="submit"
              form="destination-form"
              disabled={saving}
              className="rounded-xl gradient-primary text-white shadow-ambient"
            >
              {saving ? 'Enregistrement...' : editingId ? 'Mettre a jour' : 'Creer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-on-surface">
              Supprimer la destination
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer cette destination ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose
              render={<Button variant="outline" className="rounded-xl" />}
            >
              Annuler
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl"
            >
              <Trash2 size={14} />
              {saving ? 'Suppression...' : 'Supprimer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
