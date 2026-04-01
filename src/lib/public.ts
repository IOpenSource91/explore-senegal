import type {
  Destination,
  SiteSettings,
  Tour,
  TourItinerary,
} from '@/types/database';

type LocaleKey = 'fr' | 'en' | 'es';

function resolveLocale(locale: string): LocaleKey {
  if (locale === 'en' || locale === 'es') {
    return locale;
  }

  return 'fr';
}

export function getLocalizedValue(locale: string, values: {
  fr?: string | null;
  en?: string | null;
  es?: string | null;
}): string {
  const activeLocale = resolveLocale(locale);

  if (activeLocale === 'en' && values.en) {
    return values.en;
  }

  if (activeLocale === 'es' && values.es) {
    return values.es;
  }

  return values.fr ?? values.en ?? values.es ?? '';
}

export function getTourName(
  tour: Pick<Tour, 'name' | 'name_en' | 'name_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: tour.name,
    en: tour.name_en,
    es: tour.name_es,
  });
}

export function getTourShortDescription(
  tour: Pick<Tour, 'short_description' | 'short_description_en' | 'short_description_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: tour.short_description,
    en: tour.short_description_en,
    es: tour.short_description_es,
  });
}

export function getTourLongDescription(
  tour: Pick<Tour, 'long_description' | 'long_description_en' | 'long_description_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: tour.long_description,
    en: tour.long_description_en,
    es: tour.long_description_es,
  });
}

export function getDestinationDescription(
  destination: Pick<Destination, 'description' | 'description_en' | 'description_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: destination.description,
    en: destination.description_en,
    es: destination.description_es,
  });
}

export function getDestinationTagline(
  destination: Pick<Destination, 'tagline' | 'tagline_en' | 'tagline_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: destination.tagline,
    en: destination.tagline_en,
    es: destination.tagline_es,
  });
}

export function getItineraryTitle(
  step: Pick<TourItinerary, 'title' | 'title_en' | 'title_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: step.title,
    en: step.title_en,
    es: step.title_es,
  });
}

export function getItineraryDescription(
  step: Pick<TourItinerary, 'description' | 'description_en' | 'description_es'>,
  locale: string
) {
  return getLocalizedValue(locale, {
    fr: step.description,
    en: step.description_en,
    es: step.description_es,
  });
}

export function getDifficultyLabel(locale: string, difficulty: string | null) {
  if (!difficulty) {
    return '';
  }

  const labels = {
    fr: {
      easy: 'Accessible',
      moderate: 'Rythme modere',
      challenging: 'Soutenu',
    },
    en: {
      easy: 'Easy pace',
      moderate: 'Moderate pace',
      challenging: 'Active pace',
    },
    es: {
      easy: 'Ritmo suave',
      moderate: 'Ritmo moderado',
      challenging: 'Ritmo activo',
    },
  } as const;

  const activeLocale = resolveLocale(locale);

  return (
    labels[activeLocale][difficulty as keyof (typeof labels)[typeof activeLocale]] ??
    difficulty
  );
}

export function getRouteDestinationNames(
  relations:
    | Array<{
        destination?: Pick<Destination, 'name'> | null;
      }>
    | null
    | undefined
) {
  return (relations ?? [])
    .map((relation) => relation.destination?.name)
    .filter((name): name is string => Boolean(name));
}

export function formatWhatsAppHref(phone: string | null | undefined) {
  const digits = phone?.replace(/[^\d]/g, '');

  if (!digits) {
    return null;
  }

  return `https://wa.me/${digits}`;
}

export function getContactDetails(settings: SiteSettings | null) {
  return {
    siteName: settings?.site_name?.trim() || 'Explore Senegal',
    email: settings?.email?.trim() || 'contact@explore-senegal.com',
    whatsapp: settings?.whatsapp?.trim() || '+221 77 000 00 00',
  };
}
