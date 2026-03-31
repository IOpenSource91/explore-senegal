'use client';

import { useState, useEffect, useCallback } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { Settings, Save, Palette, Check } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { themePresets, getThemeById, themeToCSSVars } from '@/lib/themes';
import type { ThemePreset } from '@/lib/themes';

export default function SettingsPage() {
  const supabase = createClient();
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeTheme, setActiveTheme] = useState('terracotta');

  const [form, setForm] = useState({
    siteName: 'Explore Senegal',
    whatsapp: '',
    email: '',
  });

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .single();

    if (data) {
      setForm({
        siteName: data.site_name || 'Explore Senegal',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
      });
      setActiveTheme(data.theme || 'terracotta');
    }
    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function applyThemeToDOM(themeId: string) {
    const theme = getThemeById(themeId);
    const vars = themeToCSSVars(theme);
    const root = document.documentElement;
    for (const [prop, value] of Object.entries(vars)) {
      root.style.setProperty(prop, value);
    }
  }

  async function handleThemeSelect(preset: ThemePreset) {
    setActiveTheme(preset.id);
    applyThemeToDOM(preset.id);

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'default',
        theme: preset.id,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast.error('Erreur lors du changement de theme: ' + error.message);
      return;
    }

    toast.success(`Theme "${preset.name}" applique`);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from('site_settings')
      .upsert({
        id: 'default',
        site_name: form.siteName,
        whatsapp: form.whatsapp || null,
        email: form.email || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      toast.error(error.message);
      setSaving(false);
      return;
    }

    toast.success('Parametres enregistres');
    setSaving(false);
    router.refresh();
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
    >
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="inline-flex rounded-2xl bg-primary/10 p-3.5 text-primary">
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

      {/* Theme Selector */}
      <div className="mt-8 rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
        <div className="flex items-center gap-3">
          <Palette size={20} className="text-primary" />
          <h2 className="font-heading text-lg font-bold text-on-surface">
            Theme du site
          </h2>
        </div>
        <p className="mt-1 text-sm text-on-surface-variant">
          Choisissez une palette de couleurs pour le site public.
        </p>
        <Separator className="my-4 bg-surface-container-low" />

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
          {themePresets.map((preset) => {
            const isActive = activeTheme === preset.id;
            return (
              <motion.button
                key={preset.id}
                type="button"
                onClick={() => handleThemeSelect(preset)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className={`relative flex flex-col items-center gap-3 rounded-xl border-2 p-4 transition-colors ${
                  isActive
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-outline-variant/40 bg-surface-container-low hover:border-outline-variant'
                }`}
              >
                {isActive && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -right-1.5 -top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white"
                  >
                    <Check size={14} />
                  </motion.div>
                )}

                {/* Color swatches */}
                <div className="flex gap-1.5">
                  <div
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors.primary }}
                  />
                  <div
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors.secondary }}
                  />
                  <div
                    className="h-8 w-8 rounded-full border border-black/10"
                    style={{ backgroundColor: preset.colors.tertiary }}
                  />
                </div>

                {/* Surface preview bar */}
                <div
                  className="h-3 w-full rounded-full border border-black/5"
                  style={{ backgroundColor: preset.colors.surface }}
                />

                <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  {preset.name}
                </span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        {/* Site Info */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-lg font-bold text-on-surface">
            Informations du site
          </h2>
          <Separator className="my-4 bg-surface-container-low" />

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Nom du site
              </Label>
              <Input
                value={form.siteName}
                onChange={(e) => updateField('siteName', e.target.value)}
                placeholder="Nom du site"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

        {/* Contact Info */}
        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <h2 className="font-heading text-lg font-bold text-on-surface">
            Coordonnees
          </h2>
          <Separator className="my-4 bg-surface-container-low" />

          <div className="space-y-5">
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Numero WhatsApp
              </Label>
              <Input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => updateField('whatsapp', e.target.value)}
                placeholder="+221 77 000 00 00"
                className="rounded-xl"
              />
              <p className="text-xs text-on-surface-variant">
                Ce numero sera utilise pour le bouton WhatsApp sur le site public.
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                Email de contact
              </Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => updateField('email', e.target.value)}
                placeholder="contact@example.com"
                className="rounded-xl"
              />
              <p className="text-xs text-on-surface-variant">
                Les notifications de contact seront envoyees a cette adresse.
              </p>
            </div>
          </div>
        </div>

        {/* Save */}
        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={saving || !loaded}
            className="rounded-xl gradient-primary px-6 py-3 text-white shadow-ambient hover:shadow-lg"
            size="lg"
          >
            <Save size={18} />
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
