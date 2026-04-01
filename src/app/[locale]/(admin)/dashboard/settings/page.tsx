'use client';

import { useState, useEffect, useCallback, type FormEvent, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  ChevronDown,
  FileText,
  Languages,
  Palette,
  Save,
  Settings,
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import {
  getAboutPageContent,
  getCircuitsPageContent,
  getDestinationsPageContent,
  getHomepageContent,
  type AboutPageContent,
  type CircuitsPageContent,
  type DestinationsPageContent,
  type HomepageContent,
  type LocalizedContent,
} from '@/lib/site-content';
import { getThemeById, themePresets, themeToCSSVars } from '@/lib/themes';
import type { ThemePreset } from '@/lib/themes';

type SettingsForm = {
  siteName: string;
  whatsapp: string;
  email: string;
  homepageContent: HomepageContent;
  circuitsPageContent: CircuitsPageContent;
  destinationsPageContent: DestinationsPageContent;
  aboutPageContent: AboutPageContent;
};

type ContentSectionKey =
  | 'homepageContent'
  | 'circuitsPageContent'
  | 'destinationsPageContent'
  | 'aboutPageContent';

type FieldConfig = {
  key: string;
  label: string;
  group: string;
  rows?: number;
};

const locales: Array<{
  key: keyof LocalizedContent;
  label: string;
  hint: string;
}> = [
  { key: 'fr', label: 'FR', hint: 'Francais' },
  { key: 'en', label: 'EN', hint: 'English' },
  { key: 'es', label: 'ES', hint: 'Espanol' },
];

const homepageFields: FieldConfig[] = [
  { key: 'heroKicker', label: 'Accroche', group: 'Hero', rows: 2 },
  { key: 'heroTitle', label: 'Titre', group: 'Hero', rows: 4 },
  { key: 'heroBody', label: 'Texte', group: 'Hero', rows: 4 },
  { key: 'featuredKicker', label: 'Accroche', group: 'Circuits phares', rows: 2 },
  { key: 'featuredTitle', label: 'Titre', group: 'Circuits phares', rows: 4 },
  { key: 'featuredBody', label: 'Texte', group: 'Circuits phares', rows: 4 },
  { key: 'processKicker', label: 'Accroche', group: 'Pourquoi cela fonctionne mieux', rows: 2 },
  { key: 'processTitle', label: 'Titre', group: 'Pourquoi cela fonctionne mieux', rows: 4 },
  { key: 'processBody', label: 'Texte', group: 'Pourquoi cela fonctionne mieux', rows: 4 },
  { key: 'servicesTitle', label: 'Titre', group: 'Services', rows: 3 },
  { key: 'destinationKicker', label: 'Accroche', group: 'Destinations', rows: 2 },
  { key: 'destinationTitle', label: 'Titre', group: 'Destinations', rows: 4 },
  { key: 'destinationBody', label: 'Texte', group: 'Destinations', rows: 4 },
  { key: 'finalTitle', label: 'Titre', group: 'Bloc final', rows: 4 },
  { key: 'finalBody', label: 'Texte', group: 'Bloc final', rows: 4 },
  { key: 'finalPrimary', label: 'CTA principal', group: 'Bloc final', rows: 2 },
  { key: 'finalSecondary', label: 'CTA secondaire', group: 'Bloc final', rows: 2 },
];

const circuitsFields: FieldConfig[] = [
  { key: 'kicker', label: 'Accroche', group: 'Hero', rows: 2 },
  { key: 'title', label: 'Titre', group: 'Hero', rows: 4 },
  { key: 'subtitle', label: 'Texte', group: 'Hero', rows: 4 },
  { key: 'primaryCta', label: 'CTA principal', group: 'Actions', rows: 2 },
  { key: 'secondaryCta', label: 'CTA secondaire', group: 'Actions', rows: 2 },
  { key: 'spotlight', label: 'Badge circuit en vedette', group: 'Actions', rows: 2 },
  { key: 'helpTitle', label: 'Titre', group: 'Bloc aide', rows: 3 },
  { key: 'helpBody', label: 'Texte', group: 'Bloc aide', rows: 4 },
];

const destinationsFields: FieldConfig[] = [
  { key: 'kicker', label: 'Accroche', group: 'Hero', rows: 2 },
  { key: 'title', label: 'Titre', group: 'Hero', rows: 4 },
  { key: 'subtitle', label: 'Texte', group: 'Hero', rows: 4 },
  { key: 'primaryCta', label: 'CTA principal', group: 'Actions', rows: 2 },
  { key: 'secondaryCta', label: 'CTA secondaire', group: 'Actions', rows: 2 },
  { key: 'cardCta', label: 'CTA des cartes destination', group: 'Actions', rows: 2 },
  { key: 'previewTitle', label: 'Titre du bloc de previsualisation', group: 'Previsualisation', rows: 3 },
];

const aboutFields: FieldConfig[] = [
  { key: 'kicker', label: 'Accroche', group: 'Hero', rows: 2 },
  { key: 'title', label: 'Titre', group: 'Hero', rows: 4 },
  { key: 'subtitle', label: 'Texte', group: 'Hero', rows: 4 },
  { key: 'quote', label: 'Citation principale', group: 'Hero', rows: 5 },
  { key: 'storyTitle', label: 'Titre', group: 'Histoire', rows: 3 },
  { key: 'storyBody1', label: 'Paragraphe 1', group: 'Histoire', rows: 4 },
  { key: 'storyBody2', label: 'Paragraphe 2', group: 'Histoire', rows: 4 },
  { key: 'methodTitle', label: 'Titre', group: 'Methode', rows: 3 },
  { key: 'valuesTitle', label: 'Titre', group: 'Valeurs', rows: 3 },
  { key: 'ctaTitle', label: 'Titre', group: 'Bloc final', rows: 4 },
  { key: 'ctaBody', label: 'Texte', group: 'Bloc final', rows: 4 },
  { key: 'ctaPrimary', label: 'CTA principal', group: 'Bloc final', rows: 2 },
  { key: 'ctaSecondary', label: 'CTA secondaire', group: 'Bloc final', rows: 2 },
];

function createDefaultForm(): SettingsForm {
  return {
    siteName: 'Explore Senegal',
    whatsapp: '',
    email: '',
    homepageContent: getHomepageContent(null),
    circuitsPageContent: getCircuitsPageContent(null),
    destinationsPageContent: getDestinationsPageContent(null),
    aboutPageContent: getAboutPageContent(null),
  };
}

function asLocalizedRecord(
  value:
    | HomepageContent
    | CircuitsPageContent
    | DestinationsPageContent
    | AboutPageContent
) {
  return value as unknown as Record<string, LocalizedContent>;
}

function getLocalizedPreview(value: string) {
  const trimmed = value.trim();
  if (!trimmed) {
    return 'Vide';
  }

  return trimmed.length > 72 ? `${trimmed.slice(0, 72)}...` : trimmed;
}

function ContentEditorSection({
  title,
  description,
  icon,
  content,
  fields,
  onChange,
  defaultOpen = false,
}: {
  title: string;
  description: string;
  icon: ReactNode;
  content: Record<string, LocalizedContent>;
  fields: FieldConfig[];
  onChange: (field: string, locale: keyof LocalizedContent, value: string) => void;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [activeLocale, setActiveLocale] = useState<keyof LocalizedContent>('fr');
  const groupedFields = fields.reduce<Array<{ group: string; fields: FieldConfig[] }>>(
    (groups, field) => {
      const currentGroup = groups[groups.length - 1];

      if (!currentGroup || currentGroup.group !== field.group) {
        groups.push({ group: field.group, fields: [field] });
      } else {
        currentGroup.fields.push(field);
      }

      return groups;
    },
    []
  );

  return (
    <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
      <button
        type="button"
        onClick={() => setIsOpen((current) => !current)}
        className="flex w-full items-start justify-between gap-4 text-left"
      >
        <div className="flex items-start gap-3">
          <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
            {icon}
          </div>
          <div>
            <h2 className="font-heading text-lg font-bold text-on-surface">{title}</h2>
            <p className="mt-1 text-sm text-on-surface-variant">{description}</p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-surface-container-low px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                {fields.length} champs
              </span>
              <span className="rounded-full bg-primary/8 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
                {activeLocale.toUpperCase()} actif
              </span>
            </div>
          </div>
        </div>
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface-container-low text-on-surface-variant">
          <ChevronDown
            size={18}
            className={`transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
          />
        </span>
      </button>

      {isOpen ? (
        <>
          <Separator className="my-4 bg-surface-container-low" />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              <Languages size={14} />
              <span>Langue d edition</span>
            </div>

            <div className="inline-flex rounded-full bg-surface-container-low p-1">
              {locales.map((localeItem) => {
                const isActive = activeLocale === localeItem.key;

                return (
                  <button
                    key={localeItem.key}
                    type="button"
                    onClick={() => setActiveLocale(localeItem.key)}
                    className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors ${
                      isActive
                        ? 'bg-primary text-white'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    {localeItem.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-5 space-y-5">
            {groupedFields.map((group) => (
              <div
                key={group.group}
                className="rounded-[1.25rem] border border-outline-variant/30 bg-surface-container-low p-4 md:p-5"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-on-surface">{group.group}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                      {group.fields.length} champ{group.fields.length > 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="rounded-full bg-surface-container-lowest px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                    {locales.find((localeItem) => localeItem.key === activeLocale)?.hint}
                  </span>
                </div>

                <div className="grid gap-4 lg:grid-cols-2">
                  {group.fields.map((field) => {
                    const localized = content[field.key] ?? { fr: '', en: '', es: '' };
                    const currentValue = localized[activeLocale] ?? '';

                    return (
                      <div
                        key={field.key}
                        className="rounded-xl border border-outline-variant/35 bg-surface-container-lowest p-4"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-on-surface">{field.label}</p>
                            <p className="mt-1 text-xs text-on-surface-variant">
                              {getLocalizedPreview(currentValue)}
                            </p>
                          </div>
                          <div className="flex gap-1.5">
                            {locales.map((localeItem) => {
                              const hasValue = Boolean(localized[localeItem.key]?.trim());
                              return (
                                <span
                                  key={localeItem.key}
                                  className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${
                                    localeItem.key === activeLocale
                                      ? 'bg-primary text-white'
                                      : hasValue
                                        ? 'bg-primary/10 text-primary'
                                        : 'bg-surface-container-low text-on-surface-variant'
                                  }`}
                                >
                                  {localeItem.label}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <div className="mt-4 space-y-2">
                          <div className="flex items-center justify-between">
                            <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                              {activeLocale.toUpperCase()}
                            </Label>
                            <span className="text-[11px] uppercase tracking-[0.18em] text-on-surface-variant">
                              {locales.find((localeItem) => localeItem.key === activeLocale)?.hint}
                            </span>
                          </div>

                          <Textarea
                            value={currentValue}
                            onChange={(event) =>
                              onChange(field.key, activeLocale, event.target.value)
                            }
                            rows={field.rows ?? 3}
                            className="min-h-[5.25rem] rounded-xl bg-surface-container-low"
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}

export default function SettingsPage() {
  const [supabase] = useState(() => createClient());
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [activeTheme, setActiveTheme] = useState('terracotta');
  const [form, setForm] = useState<SettingsForm>(() => createDefaultForm());

  const fetchSettings = useCallback(async () => {
    const { data } = await supabase
      .from('site_settings')
      .select('*')
      .eq('id', 'default')
      .maybeSingle();

    if (data) {
      setForm({
        siteName: data.site_name || 'Explore Senegal',
        whatsapp: data.whatsapp || '',
        email: data.email || '',
        homepageContent: getHomepageContent(data),
        circuitsPageContent: getCircuitsPageContent(data),
        destinationsPageContent: getDestinationsPageContent(data),
        aboutPageContent: getAboutPageContent(data),
      });

      const themeId = data.theme || 'terracotta';
      setActiveTheme(themeId);
      applyThemeToDOM(themeId);
    }

    setLoaded(true);
  }, [supabase]);

  useEffect(() => {
    void fetchSettings();
  }, [fetchSettings]);

  function updateField(field: 'siteName' | 'whatsapp' | 'email', value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  function updateLocalizedField(
    section: ContentSectionKey,
    field: string,
    locale: keyof LocalizedContent,
    value: string
  ) {
    setForm((prev) => {
      const currentSection = asLocalizedRecord(prev[section]);

      return {
        ...prev,
        [section]: {
          ...currentSection,
          [field]: {
            ...(currentSection[field] ?? { fr: '', en: '', es: '' }),
            [locale]: value,
          },
        },
      };
    });
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

    const { error } = await supabase.from('site_settings').upsert({
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

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);

    const { error } = await supabase.from('site_settings').upsert({
      id: 'default',
      theme: activeTheme,
      site_name: form.siteName,
      whatsapp: form.whatsapp || null,
      email: form.email || null,
      homepage_content: form.homepageContent,
      circuits_page_content: form.circuitsPageContent,
      destinations_page_content: form.destinationsPageContent,
      about_page_content: form.aboutPageContent,
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
      <div className="flex items-center gap-4">
        <div className="inline-flex rounded-2xl bg-primary/10 p-3.5 text-primary">
          <Settings size={24} />
        </div>
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Parametres
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Configuration generale, theme et contenu editorial des pages publiques.
          </p>
        </div>
      </div>

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
                onChange={(event) => updateField('siteName', event.target.value)}
                placeholder="Nom du site"
                className="rounded-xl"
              />
            </div>
          </div>
        </div>

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
                onChange={(event) => updateField('whatsapp', event.target.value)}
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
                onChange={(event) => updateField('email', event.target.value)}
                placeholder="contact@example.com"
                className="rounded-xl"
              />
              <p className="text-xs text-on-surface-variant">
                Les notifications de contact seront envoyees a cette adresse.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-lowest p-6 shadow-ambient">
          <div className="flex items-start gap-3">
            <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
              <FileText size={20} />
            </div>
            <div>
              <h2 className="font-heading text-lg font-bold text-on-surface">
                Contenu editorial public
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                Les circuits, destinations, services et photos restent geres dans leurs
                modules respectifs. Ici, vous pilotez les textes structurants des pages
                publiques.
              </p>
            </div>
          </div>
        </div>

        <ContentEditorSection
          title="Accueil"
          description="Titres, accroches et appels a l action visibles sur la page d accueil."
          icon={<FileText size={18} />}
          content={asLocalizedRecord(form.homepageContent)}
          fields={homepageFields}
          defaultOpen
          onChange={(field, locale, value) =>
            updateLocalizedField('homepageContent', field, locale, value)
          }
        />

        <ContentEditorSection
          title="Page circuits"
          description="Hero, circuit mis en avant et bloc d aide de la page des circuits."
          icon={<FileText size={18} />}
          content={asLocalizedRecord(form.circuitsPageContent)}
          fields={circuitsFields}
          onChange={(field, locale, value) =>
            updateLocalizedField('circuitsPageContent', field, locale, value)
          }
        />

        <ContentEditorSection
          title="Page destinations"
          description="Hero, titre de previsualisation et libelles d action pour les destinations."
          icon={<FileText size={18} />}
          content={asLocalizedRecord(form.destinationsPageContent)}
          fields={destinationsFields}
          onChange={(field, locale, value) =>
            updateLocalizedField('destinationsPageContent', field, locale, value)
          }
        />

        <ContentEditorSection
          title="Page a propos"
          description="Presentation du guide, citation, histoire et appel a l action final."
          icon={<FileText size={18} />}
          content={asLocalizedRecord(form.aboutPageContent)}
          fields={aboutFields}
          onChange={(field, locale, value) =>
            updateLocalizedField('aboutPageContent', field, locale, value)
          }
        />

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
