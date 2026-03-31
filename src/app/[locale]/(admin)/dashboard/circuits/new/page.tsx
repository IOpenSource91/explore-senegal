'use client';

import { useState, useEffect } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { slugify } from '@/lib/utils';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';

const inputClass =
  'mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary';

const labelClass =
  'text-label-md font-semibold uppercase tracking-wider text-on-surface-variant';

const selectClass =
  'mt-2 w-full rounded-xl border-0 bg-surface-container-low px-4 py-3 text-sm text-on-surface focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary';

export default function NewTourPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form state
  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameEs, setNameEs] = useState('');
  const [slug, setSlug] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [shortDescriptionEn, setShortDescriptionEn] = useState('');
  const [shortDescriptionEs, setShortDescriptionEs] = useState('');
  const [longDescription, setLongDescription] = useState('');
  const [longDescriptionEn, setLongDescriptionEn] = useState('');
  const [longDescriptionEs, setLongDescriptionEs] = useState('');
  const [price, setPrice] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [duration, setDuration] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'moderate' | 'challenging'>('easy');
  const [maxGroupSize, setMaxGroupSize] = useState('');
  const [language, setLanguage] = useState('fr');
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [featured, setFeatured] = useState(false);
  const [coverImage, setCoverImage] = useState('');

  // Auto-generate slug from name
  useEffect(() => {
    setSlug(slugify(name));
  }, [name]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError('');

    const supabase = createClient();

    const { error: insertError } = await supabase.from('tours').insert({
      name,
      name_en: nameEn || null,
      name_es: nameEs || null,
      slug,
      short_description: shortDescription || null,
      short_description_en: shortDescriptionEn || null,
      short_description_es: shortDescriptionEs || null,
      long_description: longDescription || null,
      long_description_en: longDescriptionEn || null,
      long_description_es: longDescriptionEs || null,
      price: price ? parseFloat(price) : null,
      currency,
      duration: duration ? parseInt(duration, 10) : null,
      difficulty,
      max_group_size: maxGroupSize ? parseInt(maxGroupSize, 10) : null,
      language,
      status,
      featured,
      cover_image: coverImage || null,
    });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
    } else {
      router.push('/dashboard/circuits' as any);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link
          href={'/dashboard/circuits' as any}
          className="rounded-xl bg-surface-container p-2 text-on-surface-variant transition-colors hover:bg-surface-container-high"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Nouveau Circuit
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Creer un nouveau circuit touristique
          </p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {error && (
          <div className="rounded-xl bg-error-container px-4 py-3 text-sm text-on-error-container">
            {error}
          </div>
        )}

        {/* General info */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Informations generales
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div className="md:col-span-2">
              <label className={labelClass}>Nom (FR) *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className={inputClass}
                placeholder="Circuit Casamance Authentique"
              />
            </div>

            <div>
              <label className={labelClass}>Nom (EN)</label>
              <input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                className={inputClass}
                placeholder="Authentic Casamance Tour"
              />
            </div>

            <div>
              <label className={labelClass}>Nom (ES)</label>
              <input
                type="text"
                value={nameEs}
                onChange={(e) => setNameEs(e.target.value)}
                className={inputClass}
                placeholder="Circuito Casamance Autentico"
              />
            </div>

            <div className="md:col-span-2">
              <label className={labelClass}>Slug</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className={inputClass}
                placeholder="circuit-casamance-authentique"
              />
              <p className="mt-1 text-xs text-on-surface-variant">
                Genere automatiquement a partir du nom
              </p>
            </div>
          </div>
        </div>

        {/* Descriptions */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Descriptions
          </h2>

          <div className="mt-6 space-y-5">
            <div>
              <label className={labelClass}>Description courte (FR)</label>
              <textarea
                value={shortDescription}
                onChange={(e) => setShortDescription(e.target.value)}
                rows={2}
                className={inputClass}
                placeholder="Un apercu du circuit..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Description courte (EN)</label>
                <textarea
                  value={shortDescriptionEn}
                  onChange={(e) => setShortDescriptionEn(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description courte (ES)</label>
                <textarea
                  value={shortDescriptionEs}
                  onChange={(e) => setShortDescriptionEs(e.target.value)}
                  rows={2}
                  className={inputClass}
                />
              </div>
            </div>

            <div>
              <label className={labelClass}>Description longue (FR)</label>
              <textarea
                value={longDescription}
                onChange={(e) => setLongDescription(e.target.value)}
                rows={5}
                className={inputClass}
                placeholder="Description detaillee du circuit..."
              />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <label className={labelClass}>Description longue (EN)</label>
                <textarea
                  value={longDescriptionEn}
                  onChange={(e) => setLongDescriptionEn(e.target.value)}
                  rows={5}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Description longue (ES)</label>
                <textarea
                  value={longDescriptionEs}
                  onChange={(e) => setLongDescriptionEs(e.target.value)}
                  rows={5}
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Details du circuit
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <label className={labelClass}>Prix</label>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                min="0"
                step="0.01"
                className={inputClass}
                placeholder="450"
              />
            </div>

            <div>
              <label className={labelClass}>Devise</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className={selectClass}
              >
                <option value="EUR">EUR</option>
                <option value="XOF">XOF (CFA)</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Duree (jours)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                min="1"
                className={inputClass}
                placeholder="7"
              />
            </div>

            <div>
              <label className={labelClass}>Difficulte</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as any)}
                className={selectClass}
              >
                <option value="easy">Facile</option>
                <option value="moderate">Modere</option>
                <option value="challenging">Difficile</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Taille max. du groupe</label>
              <input
                type="number"
                value={maxGroupSize}
                onChange={(e) => setMaxGroupSize(e.target.value)}
                min="1"
                className={inputClass}
                placeholder="12"
              />
            </div>

            <div>
              <label className={labelClass}>Langue</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className={selectClass}
              >
                <option value="fr">Francais</option>
                <option value="en">Anglais</option>
                <option value="es">Espagnol</option>
              </select>
            </div>
          </div>
        </div>

        {/* Publication */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Publication
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label className={labelClass}>Statut</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className={selectClass}
              >
                <option value="draft">Brouillon</option>
                <option value="published">Publie</option>
              </select>
            </div>

            <div>
              <label className={labelClass}>Image de couverture (URL)</label>
              <input
                type="url"
                value={coverImage}
                onChange={(e) => setCoverImage(e.target.value)}
                className={inputClass}
                placeholder="https://..."
              />
            </div>

            <div className="flex items-center gap-3 md:col-span-2">
              <button
                type="button"
                onClick={() => setFeatured(!featured)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  featured ? 'bg-primary' : 'bg-surface-container-high'
                }`}
              >
                <span
                  className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${
                    featured ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
              <label className="text-body-md text-on-surface">
                Mettre en vedette sur la page d&apos;accueil
              </label>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-4">
          <Link
            href={'/dashboard/circuits' as any}
            className="rounded-xl bg-surface-container px-6 py-3 text-sm font-semibold text-on-surface-variant transition-colors hover:bg-surface-container-high"
          >
            Annuler
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="gradient-primary inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-ambient transition-all hover:shadow-ambient-lg disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            Creer le circuit
          </button>
        </div>
      </form>
    </div>
  );
}
