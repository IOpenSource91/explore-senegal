'use client';

import { useState, useEffect, use } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { Link } from '@/i18n/routing';
import { ArrowLeft, Save, Trash2 } from 'lucide-react';

export default function EditDestinationPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = use(params);
  const supabase = createClient();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [form, setForm] = useState({
    name: '',
    slug: '',
    description: '',
    description_en: '',
    description_es: '',
    tagline: '',
    tagline_en: '',
    tagline_es: '',
    cover_image: '',
  });

  useEffect(() => {
    async function fetchDestination() {
      const { data, error: fetchError } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError || !data) {
        setError('Destination introuvable.');
        setLoading(false);
        return;
      }

      setForm({
        name: data.name || '',
        slug: data.slug || '',
        description: data.description || '',
        description_en: data.description_en || '',
        description_es: data.description_es || '',
        tagline: data.tagline || '',
        tagline_en: data.tagline_en || '',
        tagline_es: data.tagline_es || '',
        cover_image: data.cover_image || '',
      });
      setLoading(false);
    }

    fetchDestination();
  }, [id, supabase]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const { error: updateError } = await supabase
      .from('destinations')
      .update({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        description_en: form.description_en || null,
        description_es: form.description_es || null,
        tagline: form.tagline || null,
        tagline_en: form.tagline_en || null,
        tagline_es: form.tagline_es || null,
        cover_image: form.cover_image || null,
      })
      .eq('id', id);

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    router.push('/dashboard/destinations');
  }

  async function handleDelete() {
    setSaving(true);
    const { error: deleteError } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id);

    if (deleteError) {
      setError(deleteError.message);
      setSaving(false);
      return;
    }

    router.push('/dashboard/destinations');
  }

  const inputClass =
    'w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/15 focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass =
    'text-label-md font-semibold uppercase tracking-wider text-on-surface-variant';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-body-lg text-on-surface-variant">Chargement...</p>
      </div>
    );
  }

  return (
    <div>
      <Link
        href="/dashboard/destinations"
        className="inline-flex items-center gap-2 text-body-md text-primary"
      >
        <ArrowLeft size={16} />
        Retour aux destinations
      </Link>

      <div className="mt-4 flex items-center justify-between">
        <h1 className="font-heading text-headline-lg font-bold text-on-surface">
          Modifier la destination
        </h1>
        <button
          type="button"
          onClick={() => setShowDeleteConfirm(true)}
          className="inline-flex items-center gap-2 rounded-xl bg-error-container px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-on-error-container"
        >
          <Trash2 size={16} />
          Supprimer
        </button>
      </div>

      {showDeleteConfirm && (
        <div className="mt-4 rounded-xl bg-error-container p-4 shadow-ambient">
          <p className="text-body-md text-on-error-container">
            Voulez-vous vraiment supprimer cette destination ? Cette action est
            irreversible.
          </p>
          <div className="mt-4 flex gap-3">
            <button
              onClick={handleDelete}
              disabled={saving}
              className="rounded-xl bg-error-container px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-on-error-container border border-outline-variant/15"
            >
              Confirmer la suppression
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="rounded-xl bg-surface-container-high px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-on-surface"
            >
              Annuler
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 rounded-xl bg-error-container p-4 text-body-md text-on-error-container">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Informations generales
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <div>
              <label className={labelClass}>Nom</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => updateField('slug', e.target.value)}
                className={inputClass}
                required
              />
            </div>
          </div>
          <div className="mt-6">
            <label className={labelClass}>Image de couverture (URL)</label>
            <input
              type="url"
              value={form.cover_image}
              onChange={(e) => updateField('cover_image', e.target.value)}
              className={inputClass}
              placeholder="https://..."
            />
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Accroche
          </h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <div>
              <label className={labelClass}>Accroche (FR)</label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => updateField('tagline', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Tagline (EN)</label>
              <input
                type="text"
                value={form.tagline_en}
                onChange={(e) => updateField('tagline_en', e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Lema (ES)</label>
              <input
                type="text"
                value={form.tagline_es}
                onChange={(e) => updateField('tagline_es', e.target.value)}
                className={inputClass}
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Descriptions
          </h2>
          <div className="mt-6 space-y-6">
            <div>
              <label className={labelClass}>Description (FR)</label>
              <textarea
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                className={inputClass}
                rows={4}
              />
            </div>
            <div>
              <label className={labelClass}>Description (EN)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => updateField('description_en', e.target.value)}
                className={inputClass}
                rows={4}
              />
            </div>
            <div>
              <label className={labelClass}>Description (ES)</label>
              <textarea
                value={form.description_es}
                onChange={(e) => updateField('description_es', e.target.value)}
                className={inputClass}
                rows={4}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient disabled:opacity-50"
          >
            <Save size={18} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
