'use client';

import { useState, useEffect, useCallback, type FormEvent } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  House,
  Languages,
  MapPinned,
  Palette,
  Route,
  Save,
  Settings,
  UserRound,
  type LucideIcon,
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
import { cn } from '@/lib/utils';

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

type ContentSectionConfig = {
  key: ContentSectionKey;
  title: string;
  description: string;
  icon: LucideIcon;
  fields: FieldConfig[];
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
  { key: 'guideName', label: 'Nom', group: 'Profil du guide', rows: 2 },
  { key: 'guideRole', label: 'Role', group: 'Profil du guide', rows: 2 },
  { key: 'guideIntro', label: 'Presentation courte', group: 'Profil du guide', rows: 4 },
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

const contentSections: ContentSectionConfig[] = [
  {
    key: 'homepageContent',
    title: 'Accueil',
    description: 'Hero, circuits phares, services et bloc final.',
    icon: House,
    fields: homepageFields,
  },
  {
    key: 'circuitsPageContent',
    title: 'Circuits',
    description: 'Hero, aide au choix et circuit en vedette.',
    icon: Route,
    fields: circuitsFields,
  },
  {
    key: 'destinationsPageContent',
    title: 'Destinations',
    description: 'Hero, actions et bloc de previsualisation.',
    icon: MapPinned,
    fields: destinationsFields,
  },
  {
    key: 'aboutPageContent',
    title: 'A propos',
    description: 'Profil du guide, histoire, valeurs et CTA final.',
    icon: UserRound,
    fields: aboutFields,
  },
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

function groupFieldConfigs(fields: FieldConfig[]) {
  return fields.reduce<Array<{ group: string; fields: FieldConfig[] }>>(
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
}

function countFilledFields(
  content: Record<string, LocalizedContent>,
  fields: FieldConfig[]
) {
  return fields.filter((field) =>
    locales.some((localeItem) => Boolean(content[field.key]?.[localeItem.key]?.trim()))
  ).length;
}

function ContentWorkspace({
  form,
  onChange,
}: {
  form: Pick<SettingsForm, ContentSectionKey>;
  onChange: (section: ContentSectionKey, field: string, locale: keyof LocalizedContent, value: string) => void;
}) {
  const [activeSectionKey, setActiveSectionKey] = useState<ContentSectionKey>('homepageContent');
  const [activeLocale, setActiveLocale] = useState<keyof LocalizedContent>('fr');
  const activeSection =
    contentSections.find((section) => section.key === activeSectionKey) ??
    contentSections[0];
  const groupedFields = groupFieldConfigs(activeSection.fields);
  const defaultGroup = groupedFields[0]?.group ?? '';
  const [activeGroup, setActiveGroup] = useState(defaultGroup);

  useEffect(() => {
    setActiveGroup(defaultGroup);
  }, [activeSectionKey, defaultGroup]);

  const activeContent = asLocalizedRecord(form[activeSection.key]);
  const currentGroup =
    groupedFields.find((group) => group.group === activeGroup) ?? groupedFields[0];
  const filledCount = countFilledFields(activeContent, activeSection.fields);

  return (
    <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 shadow-ambient md:p-7">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h2 className="font-heading text-xl font-bold text-on-surface">
            Contenu editorial public
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-on-surface-variant">
            Choisissez d abord la page a modifier, puis le bloc, puis la langue.
            L edition devient plus directe et beaucoup moins chargee.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-surface-container-low px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            {contentSections.length} pages
          </span>
          <span className="rounded-full bg-primary/8 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
            {locales.length} langues
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {contentSections.map((section) => {
          const Icon = section.icon;
          const content = asLocalizedRecord(form[section.key]);
          const sectionFilledCount = countFilledFields(content, section.fields);
          const isActive = section.key === activeSectionKey;

          return (
            <button
              key={section.key}
              type="button"
              onClick={() => setActiveSectionKey(section.key)}
              className={cn(
                'rounded-[1.35rem] border p-4 text-left transition-all',
                isActive
                  ? 'border-primary bg-primary/6 shadow-[0_16px_34px_-28px_rgba(156,61,0,0.65)]'
                  : 'border-outline-variant/30 bg-surface-container-low hover:border-outline-variant'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span
                  className={cn(
                    'inline-flex rounded-2xl p-3',
                    isActive ? 'bg-primary text-white' : 'bg-surface-container-lowest text-primary'
                  )}
                >
                  <Icon size={18} />
                </span>
                <span className="rounded-full bg-surface-container-lowest px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
                  {sectionFilledCount}/{section.fields.length}
                </span>
              </div>
              <p className="mt-4 font-heading text-lg font-bold text-on-surface">
                {section.title}
              </p>
              <p className="mt-2 text-sm leading-6 text-on-surface-variant">
                {section.description}
              </p>
            </button>
          );
        })}
      </div>

      <Separator className="my-6 bg-surface-container-low" />

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Page active
          </p>
          <h3 className="mt-2 font-heading text-2xl font-bold text-on-surface">
            {activeSection.title}
          </h3>
          <p className="mt-2 text-sm text-on-surface-variant">
            {filledCount} champ{filledCount > 1 ? 's' : ''} rempli{filledCount > 1 ? 's' : ''} sur {activeSection.fields.length}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
            <Languages size={14} />
            <span>Langue</span>
          </div>
          <div className="inline-flex rounded-full bg-surface-container-low p-1">
            {locales.map((localeItem) => {
              const isActive = activeLocale === localeItem.key;

              return (
                <button
                  key={localeItem.key}
                  type="button"
                  onClick={() => setActiveLocale(localeItem.key)}
                  className={cn(
                    'rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] transition-colors',
                    isActive
                      ? 'bg-primary text-white'
                      : 'text-on-surface-variant hover:text-on-surface'
                  )}
                >
                  {localeItem.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[15rem_minmax(0,1fr)]">
        <div className="rounded-[1.35rem] bg-surface-container-low p-3">
          <p className="px-2 pb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-on-surface-variant">
            Blocs
          </p>
          <div className="space-y-2">
            {groupedFields.map((group) => {
              const groupFilledCount = countFilledFields(activeContent, group.fields);
              const isActive = group.group === currentGroup?.group;

              return (
                <button
                  key={group.group}
                  type="button"
                  onClick={() => setActiveGroup(group.group)}
                  className={cn(
                    'w-full rounded-[1.1rem] px-3 py-3 text-left transition-colors',
                    isActive
                      ? 'bg-surface-container-lowest shadow-sm'
                      : 'hover:bg-surface-container-lowest/70'
                  )}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{group.group}</p>
                      <p className="mt-1 text-xs text-on-surface-variant">
                        {group.fields.length} champ{group.fields.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/8 px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary">
                      {groupFilledCount}/{group.fields.length}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="rounded-[1.35rem] bg-surface-container-low p-4 md:p-5">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-on-surface">
                {currentGroup?.group ?? 'Bloc'}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-on-surface-variant">
                Edition en {locales.find((localeItem) => localeItem.key === activeLocale)?.hint}
              </p>
            </div>
            <span className="rounded-full bg-surface-container-lowest px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-on-surface-variant">
              {currentGroup?.fields.length ?? 0} champ{(currentGroup?.fields.length ?? 0) > 1 ? 's' : ''}
            </span>
          </div>

          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {currentGroup?.fields.map((field) => {
              const localized = activeContent[field.key] ?? { fr: '', en: '', es: '' };
              const currentValue = localized[activeLocale] ?? '';

              return (
                <div
                  key={field.key}
                  className="rounded-[1.15rem] border border-outline-variant/35 bg-surface-container-lowest p-4"
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
                            className={cn(
                              'rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]',
                              localeItem.key === activeLocale
                                ? 'bg-primary text-white'
                                : hasValue
                                  ? 'bg-primary/10 text-primary'
                                  : 'bg-surface-container-low text-on-surface-variant'
                            )}
                          >
                            {localeItem.label}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <Label className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      {field.label} ({activeLocale.toUpperCase()})
                    </Label>
                    <Textarea
                      value={currentValue}
                      onChange={(event) =>
                        onChange(activeSection.key, field.key, activeLocale, event.target.value)
                      }
                      rows={field.rows ?? 3}
                      className="min-h-[6.5rem] rounded-xl bg-surface-container-low"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
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
            Configuration generale, theme, profil du guide et contenu editorial des pages publiques.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="mt-6 space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.06fr_0.94fr]">
          <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 shadow-ambient md:p-7">
            <div className="flex items-start gap-3">
              <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Settings size={20} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-on-surface">
                  Informations essentielles
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Commencez par les informations simples et vraiment utiles.
                </p>
              </div>
            </div>

            <Separator className="my-5 bg-surface-container-low" />

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
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
                  Utilise pour le bouton WhatsApp du site public.
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
                  Utilise pour les demandes de contact.
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-[1.75rem] bg-surface-container-lowest p-6 shadow-ambient md:p-7">
            <div className="flex items-start gap-3">
              <div className="inline-flex rounded-2xl bg-primary/10 p-3 text-primary">
                <Palette size={20} />
              </div>
              <div>
                <h2 className="font-heading text-lg font-bold text-on-surface">
                  Theme du site
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Choisissez rapidement la palette du site public.
                </p>
              </div>
            </div>

            <Separator className="my-5 bg-surface-container-low" />

            <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
              {themePresets.map((preset) => {
                const isActive = activeTheme === preset.id;

                return (
                  <motion.button
                    key={preset.id}
                    type="button"
                    onClick={() => handleThemeSelect(preset)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={cn(
                      'relative min-w-[10.5rem] shrink-0 rounded-[1.35rem] border p-4 text-left transition-colors',
                      isActive
                        ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                        : 'border-outline-variant/35 bg-surface-container-low hover:border-outline-variant'
                    )}
                  >
                    {isActive ? (
                      <span className="absolute right-3 top-3 inline-flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white">
                        <Check size={14} />
                      </span>
                    ) : null}

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
                      className="mt-3 h-3 w-full rounded-full border border-black/5"
                      style={{ backgroundColor: preset.colors.surface }}
                    />

                    <p className="mt-4 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      {preset.name}
                    </p>
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        <ContentWorkspace
          form={{
            homepageContent: form.homepageContent,
            circuitsPageContent: form.circuitsPageContent,
            destinationsPageContent: form.destinationsPageContent,
            aboutPageContent: form.aboutPageContent,
          }}
          onChange={updateLocalizedField}
        />

        <div className="flex flex-col gap-4 rounded-[1.5rem] bg-surface-container-lowest p-5 shadow-ambient sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-on-surface">
              Les changements restent locaux tant que vous n enregistrez pas.
            </p>
            <p className="mt-1 text-sm text-on-surface-variant">
              Utilisez ce bouton une fois votre page et votre langue verifiees.
            </p>
          </div>

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
