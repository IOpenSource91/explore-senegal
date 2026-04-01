'use client';

import { useState, useEffect, useCallback } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layers, Pencil, Trash2 } from 'lucide-react';

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

interface Service {
  id: string;
  name: string;
  name_en: string | null;
  name_es: string | null;
  description: string | null;
  description_en: string | null;
  description_es: string | null;
  icon: string | null;
  created_at: string;
}

const emptyForm = {
  name: '',
  name_en: '',
  name_es: '',
  description: '',
  description_en: '',
  description_es: '',
  icon: '',
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

export default function ServicesPage() {
  const supabase = createClient();
  const router = useRouter();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  const fetchServices = useCallback(async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .order('created_at', { ascending: false });
    setServices((data as Service[]) || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  }

  function openEdit(service: Service) {
    setForm({
      name: service.name || '',
      name_en: service.name_en || '',
      name_es: service.name_es || '',
      description: service.description || '',
      description_en: service.description_en || '',
      description_es: service.description_es || '',
      icon: service.icon || '',
    });
    setEditingId(service.id);
    setDialogOpen(true);
  }

  function openDelete(id: string) {
    setDeletingId(id);
    setDeleteDialogOpen(true);
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const payload = {
      name: form.name,
      name_en: form.name_en || null,
      name_es: form.name_es || null,
      description: form.description || null,
      description_en: form.description_en || null,
      description_es: form.description_es || null,
      icon: form.icon || null,
    };

    if (editingId) {
      const { error } = await supabase.from('services').update(payload).eq('id', editingId);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Service mis a jour');
    } else {
      const { error } = await supabase.from('services').insert(payload);
      if (error) {
        toast.error(error.message);
        setSaving(false);
        return;
      }
      toast.success('Service cree');
    }

    setSaving(false);
    setDialogOpen(false);
    fetchServices();
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingId) return;
    setSaving(true);

    const { error } = await supabase.from('services').delete().eq('id', deletingId);
    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success('Service supprime');
    setSaving(false);
    setDeleteDialogOpen(false);
    setDeletingId(null);
    fetchServices();
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
            Services
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez les services proposes.
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
          {services.length > 0 ? (
            services.map((service, i) => (
              <motion.div
                key={service.id}
                custom={i}
                variants={cardVariants}
                initial="hidden"
                animate="visible"
                exit="exit"
                layout
                className="group relative overflow-hidden rounded-xl bg-surface-container-lowest p-6 shadow-ambient transition-shadow hover:shadow-lg"
              >
                {/* Icon + Badge */}
                <div className="flex items-start justify-between">
                  <div className="inline-flex rounded-xl bg-[#0c6475]/10 p-3 text-[#0c6475]">
                    <Layers size={24} />
                  </div>
                  {service.icon && (
                    <Badge variant="secondary" className="rounded-lg">
                      {service.icon}
                    </Badge>
                  )}
                </div>

                {/* Content */}
                <div className="mt-4">
                  <h3 className="font-heading text-lg font-bold text-on-surface">
                    {service.name}
                  </h3>
                  {service.description && (
                    <p className="mt-2 text-sm text-on-surface-variant line-clamp-3 leading-relaxed">
                      {service.description}
                    </p>
                  )}
                </div>

                {/* Actions */}
                <div className="mt-4 flex items-center gap-2 border-t border-surface-container-low pt-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openEdit(service)}
                    className="rounded-xl text-[#0c6475]"
                  >
                    <Pencil size={14} />
                    Modifier
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => openDelete(service.id)}
                    className="rounded-xl text-red-600"
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </motion.div>
            ))
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient"
            >
              <Layers size={40} className="mx-auto text-on-surface-variant/40" />
              <p className="mt-4 text-body-lg text-on-surface-variant">
                Aucun service pour le moment.
              </p>
              <Button
                onClick={openCreate}
                className="mt-4 rounded-xl gradient-primary px-5 py-2.5 text-white shadow-ambient"
                size="lg"
              >
                <Plus size={18} />
                Ajouter un service
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-2xl rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-on-surface">
              {editingId ? 'Modifier le service' : 'Nouveau service'}
            </DialogTitle>
            <DialogDescription>
              {editingId
                ? 'Modifiez les informations du service.'
                : 'Remplissez les informations pour creer un nouveau service.'}
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="max-h-[60vh]">
            <form id="service-form" onSubmit={handleSubmit} className="space-y-5 pr-2">
              {/* Names + Icon */}
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Nom (FR)
                    </Label>
                    <Input
                      value={form.name}
                      onChange={(e) => updateField('name', e.target.value)}
                      placeholder="Nom du service"
                      required
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      Icone
                    </Label>
                    <Input
                      value={form.icon}
                      onChange={(e) => updateField('icon', e.target.value)}
                      placeholder="Ex: car, plane, hotel"
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>

              {/* Translated Names */}
              <div className="rounded-xl bg-surface-container-low/50 p-4 space-y-3">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Noms traduits
                </p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">EN</Label>
                    <Input
                      value={form.name_en}
                      onChange={(e) => updateField('name_en', e.target.value)}
                      placeholder="Service name in English"
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">ES</Label>
                    <Input
                      value={form.name_es}
                      onChange={(e) => updateField('name_es', e.target.value)}
                      placeholder="Nombre del servicio"
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
                      placeholder="Description du service"
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">EN</Label>
                    <Textarea
                      value={form.description_en}
                      onChange={(e) => updateField('description_en', e.target.value)}
                      placeholder="Service description in English"
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-on-surface-variant">ES</Label>
                    <Textarea
                      value={form.description_es}
                      onChange={(e) => updateField('description_es', e.target.value)}
                      placeholder="Descripcion del servicio"
                      rows={3}
                      className="rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </form>
          </ScrollArea>

          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="rounded-xl" />}>
              Annuler
            </DialogClose>
            <Button
              type="submit"
              form="service-form"
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
              Supprimer le service
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer ce service ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="rounded-xl" />}>
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
