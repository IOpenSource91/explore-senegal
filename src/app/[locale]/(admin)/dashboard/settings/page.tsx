'use client';

import { useState } from 'react';
import { Save, Settings } from 'lucide-react';

export default function SettingsPage() {
  const [form, setForm] = useState({
    siteName: 'Explore Senegal',
    whatsapp: '',
  });
  const [saved, setSaved] = useState(false);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Placeholder: save to Supabase settings table or .env
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  const inputClass =
    'w-full rounded-xl bg-surface-container-low px-4 py-3 text-body-md text-on-surface placeholder:text-on-surface-variant/50 border border-outline-variant/15 focus:outline-none focus:ring-2 focus:ring-primary/30';
  const labelClass =
    'text-label-md font-semibold uppercase tracking-wider text-on-surface-variant';

  return (
    <div>
      <div className="flex items-center gap-3">
        <div className="inline-flex rounded-xl bg-primary-fixed p-3 text-primary">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Parametres
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Configuration generale du site.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-headline-md font-bold text-on-surface">
            Informations du site
          </h2>

          <div className="mt-6 space-y-6">
            <div>
              <label className={labelClass}>Nom du site</label>
              <input
                type="text"
                value={form.siteName}
                onChange={(e) => updateField('siteName', e.target.value)}
                className={inputClass}
                placeholder="Nom du site"
              />
            </div>
            <div>
              <label className={labelClass}>Numero WhatsApp</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                className={inputClass}
                placeholder="+221 77 000 00 00"
              />
              <p className="mt-1 text-body-md text-on-surface-variant">
                Ce numero sera utilise pour le bouton WhatsApp sur le site
                public.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            type="submit"
            className="inline-flex items-center gap-2 rounded-xl gradient-primary px-6 py-3 text-label-md font-semibold uppercase tracking-wider text-white shadow-ambient"
          >
            <Save size={18} />
            Enregistrer
          </button>
          {saved && (
            <span className="text-body-md text-tertiary">
              Parametres enregistres avec succes.
            </span>
          )}
        </div>
      </form>
    </div>
  );
}
