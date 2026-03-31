'use client';

import { useState } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { ArrowLeft, Save } from 'lucide-react';
import { Link } from '@/i18n/routing';

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export default function NewDestinationPage() {
  const supabase = createClient();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  function handleNameChange(name: string) {
    setForm((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  }

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('destinations')
      .insert({
        name: form.name,
        slug: form.slug,
        description: form.description || null,
        description_en: form.description_en || null,
        description_es: form.description_es || null,
        tagline: form.tagline || null,
        tagline_en: form.tagline_en || null,
        tagline_es: form.tagline_es || null,
        cover_image: form.cover_image || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    router.push('/dashboard/destinations');
  }

  const inputClass =
    'w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/15 focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass =
    'text-label-md font-semibold uppercase tracking-wider text-on-surface-variant';

  return (
    <div>
      <Link
        href="/dashboard/destinations"
        className="inline-flex items-center gap-2 text-body-md text-primary"
      >
        <ArrowLeft size={16} />
        Retour aux destinations
      </Link>

      <h1 className="mt-4 font-heading text-headline-lg font-bold text-on-surface">
        Nouvelle destination
      </h1>

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
                onChange={(e) => handleNameChange(e.target.value)}
                className={inputClass}
                placeholder="Ex: Dakar"
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
                placeholder="dakar"
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
                placeholder="Accroche en francais"
              />
            </div>
            <div>
              <label className={labelClass}>Tagline (EN)</label>
              <input
                type="text"
                value={form.tagline_en}
                onChange={(e) => updateField('tagline_en', e.target.value)}
                className={inputClass}
                placeholder="Tagline in English"
              />
            </div>
            <div>
              <label className={labelClass}>Lema (ES)</label>
              <input
                type="text"
                value={form.tagline_es}
                onChange={(e) => updateField('tagline_es', e.target.value)}
                className={inputClass}
                placeholder="Lema en espanol"
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
                placeholder="Description en francais"
              />
            </div>
            <div>
              <label className={labelClass}>Description (EN)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => updateField('description_en', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="Description in English"
              />
            </div>
            <div>
              <label className={labelClass}>Description (ES)</label>
              <textarea
                value={form.description_es}
                onChange={(e) => updateField('description_es', e.target.value)}
                className={inputClass}
                rows={4}
                placeholder="Descripcion en espanol"
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient disabled:opacity-50"
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </div>
  );
}
