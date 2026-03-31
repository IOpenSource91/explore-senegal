'use client';

import { useState, useTransition } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { Plus, Pencil, Trash2, Save, X, Layers } from 'lucide-react';

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

export default function ServiceActions({
  initialServices,
}: {
  initialServices: Service[];
}) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    name_en: '',
    name_es: '',
    description: '',
    description_en: '',
    description_es: '',
    icon: '',
  });

  function resetForm() {
    setForm({
      name: '',
      name_en: '',
      name_es: '',
      description: '',
      description_en: '',
      description_es: '',
      icon: '',
    });
    setShowForm(false);
    setEditId(null);
  }

  function startEdit(service: Service) {
    setForm({
      name: service.name || '',
      name_en: service.name_en || '',
      name_es: service.name_es || '',
      description: service.description || '',
      description_en: service.description_en || '',
      description_es: service.description_es || '',
      icon: service.icon || '',
    });
    setEditId(service.id);
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const payload = {
      name: form.name,
      name_en: form.name_en || null,
      name_es: form.name_es || null,
      description: form.description || null,
      description_en: form.description_en || null,
      description_es: form.description_es || null,
      icon: form.icon || null,
    };

    if (editId) {
      const { error: updateError } = await supabase
        .from('services')
        .update(payload)
        .eq('id', editId);
      if (updateError) {
        setError(updateError.message);
        return;
      }
    } else {
      const { error: insertError } = await supabase
        .from('services')
        .insert(payload);
      if (insertError) {
        setError(insertError.message);
        return;
      }
    }

    resetForm();
    startTransition(() => {
      router.refresh();
    });
  }

  async function handleDelete(id: string) {
    const { error: deleteError } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setDeleteConfirm(null);
    startTransition(() => {
      router.refresh();
    });
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const inputClass =
    'w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/15 focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass =
    'text-label-md font-semibold uppercase tracking-wider text-on-surface-variant';

  return (
    <div className="mt-8">
      {!showForm && (
        <button
          type="button"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="inline-flex items-center gap-2 rounded-xl gradient-primary px-5 py-2.5 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient"
        >
          <Plus size={18} />
          Ajouter un service
        </button>
      )}

      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="mb-8 rounded-xl bg-surface-container-lowest p-6 shadow-ambient"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-heading text-headline-md font-bold text-on-surface">
              {editId ? 'Modifier le service' : 'Nouveau service'}
            </h2>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl bg-surface-container-high p-2 text-on-surface-variant"
            >
              <X size={18} />
            </button>
          </div>

          {error && (
            <div className="mt-4 rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
              {error}
            </div>
          )}

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Nom (FR)</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClass}
                placeholder="Nom du service"
                required
              />
            </div>
            <div>
              <label className={labelClass}>Icone</label>
              <input
                type="text"
                value={form.icon}
                onChange={(e) => updateField('icon', e.target.value)}
                className={inputClass}
                placeholder="Ex: car, plane, hotel"
              />
            </div>
          </div>

          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Name (EN)</label>
              <input
                type="text"
                value={form.name_en}
                onChange={(e) => updateField('name_en', e.target.value)}
                className={inputClass}
                placeholder="Service name in English"
              />
            </div>
            <div>
              <label className={labelClass}>Nombre (ES)</label>
              <input
                type="text"
                value={form.name_es}
                onChange={(e) => updateField('name_es', e.target.value)}
                className={inputClass}
                placeholder="Nombre del servicio en espanol"
              />
            </div>
          </div>

          <div className="mt-6 space-y-4">
            <div>
              <label className={labelClass}>Description (FR)</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Description du service"
              />
            </div>
            <div>
              <label className={labelClass}>Description (EN)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => updateField('description_en', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Service description in English"
              />
            </div>
            <div>
              <label className={labelClass}>Description (ES)</label>
              <textarea
                value={form.description_es}
                onChange={(e) => updateField('description_es', e.target.value)}
                className={inputClass}
                rows={3}
                placeholder="Descripcion del servicio en espanol"
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient"
            >
              <Save size={18} />
              {editId ? 'Mettre a jour' : 'Enregistrer'}
            </button>
          </div>
        </form>
      )}

      {/* Services list */}
      <div className="space-y-4">
        {initialServices.length > 0 ? (
          initialServices.map((service) => (
            <div
              key={service.id}
              className="flex items-center justify-between rounded-xl bg-surface-container-lowest p-5 shadow-ambient"
            >
              <div className="flex items-center gap-4">
                <div className="inline-flex rounded-xl bg-secondary-container p-3 text-secondary">
                  <Layers size={20} />
                </div>
                <div>
                  <h3 className="font-heading text-body-lg font-semibold text-on-surface">
                    {service.name}
                  </h3>
                  {service.icon && (
                    <p className="text-label-md text-on-surface-variant">
                      Icone: {service.icon}
                    </p>
                  )}
                  {service.description && (
                    <p className="mt-1 text-body-md text-on-surface-variant line-clamp-1">
                      {service.description}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {deleteConfirm === service.id ? (
                  <>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="rounded-xl bg-error-container px-3 py-2 text-label-md font-semibold uppercase tracking-wider text-on-error-container"
                    >
                      Confirmer
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(null)}
                      className="rounded-xl bg-surface-container-high px-3 py-2 text-label-md font-semibold uppercase tracking-wider text-on-surface"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => startEdit(service)}
                      className="inline-flex items-center gap-1 rounded-xl bg-surface-container-high px-3 py-2 text-label-md font-semibold uppercase tracking-wider text-on-surface"
                    >
                      <Pencil size={14} />
                      Modifier
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(service.id)}
                      className="inline-flex items-center gap-1 rounded-xl bg-error-container px-3 py-2 text-label-md font-semibold uppercase tracking-wider text-on-error-container"
                    >
                      <Trash2 size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-xl bg-surface-container-lowest p-10 text-center shadow-ambient">
            <Layers size={40} className="mx-auto text-on-surface-variant" />
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Aucun service pour le moment.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
