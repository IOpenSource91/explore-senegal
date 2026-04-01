import type { Json, SiteSettings } from '@/types/database';

export interface LocalizedContent {
  fr: string;
  en: string;
  es: string;
}

export interface HomepageContent {
  heroKicker: LocalizedContent;
  heroTitle: LocalizedContent;
  heroBody: LocalizedContent;
  featuredKicker: LocalizedContent;
  featuredTitle: LocalizedContent;
  featuredBody: LocalizedContent;
  processKicker: LocalizedContent;
  processTitle: LocalizedContent;
  processBody: LocalizedContent;
  servicesTitle: LocalizedContent;
  destinationKicker: LocalizedContent;
  destinationTitle: LocalizedContent;
  destinationBody: LocalizedContent;
  finalTitle: LocalizedContent;
  finalBody: LocalizedContent;
  finalPrimary: LocalizedContent;
  finalSecondary: LocalizedContent;
}

export interface CircuitsPageContent {
  kicker: LocalizedContent;
  title: LocalizedContent;
  subtitle: LocalizedContent;
  primaryCta: LocalizedContent;
  secondaryCta: LocalizedContent;
  spotlight: LocalizedContent;
  helpTitle: LocalizedContent;
  helpBody: LocalizedContent;
}

export interface DestinationsPageContent {
  kicker: LocalizedContent;
  title: LocalizedContent;
  subtitle: LocalizedContent;
  primaryCta: LocalizedContent;
  secondaryCta: LocalizedContent;
  cardCta: LocalizedContent;
  previewTitle: LocalizedContent;
}

export interface AboutPageContent {
  guideName: LocalizedContent;
  guideRole: LocalizedContent;
  guideIntro: LocalizedContent;
  kicker: LocalizedContent;
  title: LocalizedContent;
  subtitle: LocalizedContent;
  quote: LocalizedContent;
  storyTitle: LocalizedContent;
  storyBody1: LocalizedContent;
  storyBody2: LocalizedContent;
  methodTitle: LocalizedContent;
  valuesTitle: LocalizedContent;
  ctaTitle: LocalizedContent;
  ctaBody: LocalizedContent;
  ctaPrimary: LocalizedContent;
  ctaSecondary: LocalizedContent;
}

function text(fr: string, en: string, es: string): LocalizedContent {
  return { fr, en, es };
}

export const homepageContentDefaults: HomepageContent = {
  heroKicker: text(
    'Voyages prives au rythme local',
    'Private journeys with local rhythm',
    'Viajes privados con ritmo local'
  ),
  heroTitle: text(
    'Des routes senegalaises racontees avec plus de relief, moins de bruit.',
    'Senegalese routes told with more texture and less noise.',
    'Rutas senegalesas contadas con mas textura y menos ruido.'
  ),
  heroBody: text(
    "Le site doit donner envie, mais surtout aider a choisir. Cette version met en avant les ambiances, le rythme et la conversation directe avec le guide.",
    'The site should inspire, but it should also help people choose. This version brings mood, pace, and direct contact with the guide to the front.',
    'El sitio debe inspirar, pero tambien ayudar a elegir. Esta version pone delante el ambiente, el ritmo y el contacto directo con el guia.'
  ),
  featuredKicker: text(
    'Circuits phares',
    'Featured tours',
    'Circuitos destacados'
  ),
  featuredTitle: text(
    'Des experiences compactes, visuelles et faciles a lire.',
    'Compact, visual experiences that are easier to scan.',
    'Experiencias compactas, visuales y faciles de recorrer.'
  ),
  featuredBody: text(
    "Chaque carte montre d'abord le territoire, le rythme et la taille du groupe. Le reste vient ensuite.",
    'Each card shows territory, pace, and group size first. The rest follows from there.',
    'Cada tarjeta muestra primero territorio, ritmo y tamano del grupo. Lo demas llega despues.'
  ),
  processKicker: text(
    'Pourquoi cela fonctionne mieux',
    'Why this works better',
    'Por que funciona mejor'
  ),
  processTitle: text(
    'Une interface plus ancree dans le voyage reel.',
    'A public experience that feels closer to real travel.',
    'Una experiencia publica mas cercana al viaje real.'
  ),
  processBody: text(
    "Au lieu de grandes zones blanches et d'un hero trop envahissant, l'accueil assume une mise en page plus editoriale et plus utile.",
    'Instead of oversized empty space and a heavy hero, the landing page now uses a denser, more editorial composition.',
    'En lugar de grandes zonas vacias y un hero demasiado pesado, la pagina de inicio usa ahora una composicion mas densa y editorial.'
  ),
  servicesTitle: text(
    'L experience sur place reste simple et humaine.',
    'The experience on the ground stays simple and human.',
    'La experiencia en el terreno sigue siendo simple y humana.'
  ),
  destinationKicker: text('Territoires', 'Places', 'Lugares'),
  destinationTitle: text(
    'Des lieux avec une presence, pas juste des points sur une carte.',
    'Places with real presence, not just pins on a map.',
    'Lugares con presencia real, no solo puntos en un mapa.'
  ),
  destinationBody: text(
    "Le voyage avance mieux quand chaque etape a un vrai caractere: memoire, littoral, village, dune, architecture.",
    'Travel decisions get easier when each stop has a clear character: memory, coastline, village life, dunes, architecture.',
    'Elegir mejor es mas facil cuando cada parada tiene un caracter claro: memoria, costa, pueblo, duna, arquitectura.'
  ),
  finalTitle: text(
    'Vous avez une idee, une date ou juste une envie de Senegal ?',
    'You already have a date, an idea, or just a desire for Senegal?',
    'Ya tienes una fecha, una idea o solo unas ganas de Senegal?'
  ),
  finalBody: text(
    "Commencez par une route existante ou ecrivez simplement ce que vous voulez ressentir. Le site est maintenant concu pour bien demarrer cette conversation.",
    'Start from an existing route or describe what you want to feel. The site is now built to begin that conversation properly.',
    'Empieza con una ruta existente o describe lo que quieres sentir. El sitio ahora esta pensado para iniciar bien esa conversacion.'
  ),
  finalPrimary: text(
    'Demander une proposition',
    'Request a proposal',
    'Solicitar una propuesta'
  ),
  finalSecondary: text(
    'Explorer les circuits',
    'Explore tours',
    'Explorar circuitos'
  ),
};

export const circuitsPageContentDefaults: CircuitsPageContent = {
  kicker: text(
    'Collection de circuits',
    'Tour collection',
    'Coleccion de circuitos'
  ),
  title: text(
    'Des circuits plus compacts, plus nets et plus faciles a comparer.',
    'Tours that are denser, clearer, and easier to compare.',
    'Circuitos mas densos, mas claros y mas faciles de comparar.'
  ),
  subtitle: text(
    "Ici, chaque route doit pouvoir se comprendre vite: territoire, rythme, taille du groupe et promesse du guide.",
    'Each route should now read quickly: territory, pace, group size, and the guiding promise.',
    'Cada ruta debe leerse rapido: territorio, ritmo, tamano del grupo y promesa del guia.'
  ),
  primaryCta: text(
    'Demander conseil',
    'Ask for advice',
    'Pedir consejo'
  ),
  secondaryCta: text(
    'Voir le circuit en vedette',
    'See the featured tour',
    'Ver el circuito destacado'
  ),
  spotlight: text(
    'Circuit en vedette',
    'Featured tour',
    'Circuito destacado'
  ),
  helpTitle: text(
    'Vous hésitez entre plusieurs ambiances ?',
    'Unsure which mood fits you best?',
    'No sabes que ambiente te conviene mas?'
  ),
  helpBody: text(
    'Dites-nous si vous cherchez la memoire, le littoral, la dune ou la vie de village. Nous vous orienterons vers le bon circuit.',
    'Tell us whether you want memory, coastline, dunes, or village life. We will point you to the right route.',
    'Dinos si buscas memoria, costa, dunas o vida de pueblo. Te orientaremos hacia la ruta adecuada.'
  ),
};

export const destinationsPageContentDefaults: DestinationsPageContent = {
  kicker: text('Destinations', 'Destinations', 'Destinos'),
  title: text(
    'Des territoires avec un ton, une memoire et une vraie place dans le voyage.',
    'Territories with mood, memory, and a real role inside the journey.',
    'Territorios con tono, memoria y un papel real dentro del viaje.'
  ),
  subtitle: text(
    "Cette page doit donner du caractere a chaque lieu. On ne vend pas seulement un nom, mais une ambiance et un type d'experience.",
    'This page should give each place character. We are not selling only a name, but an atmosphere and a type of experience.',
    'Esta pagina debe dar caracter a cada lugar. No se vende solo un nombre, sino un ambiente y un tipo de experiencia.'
  ),
  primaryCta: text('Voir les circuits', 'Browse tours', 'Ver circuitos'),
  secondaryCta: text(
    'Demander conseil',
    'Ask for advice',
    'Pedir consejo'
  ),
  cardCta: text(
    'Explorer les circuits',
    'Explore tours',
    'Explorar circuitos'
  ),
  previewTitle: text(
    'Trois atmospheres pour commencer',
    'Three travel moods to start with',
    'Tres ambientes para empezar'
  ),
};

export const aboutPageContentDefaults: AboutPageContent = {
  guideName: text('', '', ''),
  guideRole: text('', '', ''),
  guideIntro: text('', '', ''),
  kicker: text('Le guide', 'The guide', 'El guia'),
  title: text(
    'Une presence locale qui explique, relie et donne du sens au parcours.',
    'A local presence that explains, connects, and gives meaning to the route.',
    'Una presencia local que explica, conecta y da sentido a la ruta.'
  ),
  subtitle: text(
    "L'intention n'est pas de faire seulement visiter, mais de faire comprendre le territoire, son rythme et les histoires qui le traversent.",
    'The intent is not only to show places, but to help people understand the territory, its rhythm, and the stories moving through it.',
    'La intencion no es solo mostrar lugares, sino ayudar a entender el territorio, su ritmo y las historias que lo atraviesan.'
  ),
  quote: text(
    'Je veux que chaque visiteur reparte avec une sensation juste du Senegal: sa generosite, ses voix et ses paysages.',
    'I want every traveler to leave with a truthful sense of Senegal: its generosity, its voices, and its landscapes.',
    'Quiero que cada viajero se vaya con una sensacion verdadera de Senegal: su generosidad, sus voces y sus paisajes.'
  ),
  storyTitle: text(
    'Pourquoi ce projet existe',
    'Why this project exists',
    'Por que existe este proyecto'
  ),
  storyBody1: text(
    "Explore Senegal est ne d'une volonte simple: proposer des visites plus humaines, plus situees et moins impersonnelles.",
    'Explore Senegal started from a simple intention: offer visits that feel more human, more situated, and less impersonal.',
    'Explore Senegal nacio de una intencion simple: proponer visitas mas humanas, mas situadas y menos impersonales.'
  ),
  storyBody2: text(
    "Le site doit prolonger cette logique. Il ne doit pas impressionner pour rien, mais aider a sentir le ton du voyage avant meme le premier message.",
    'The site should extend that logic. It should not impress for no reason, but help people feel the tone of the trip before the first message.',
    'El sitio debe prolongar esa logica. No debe impresionar porque si, sino ayudar a sentir el tono del viaje antes del primer mensaje.'
  ),
  methodTitle: text(
    'Comment je construis une journee',
    'How I shape a day',
    'Como construyo una jornada'
  ),
  valuesTitle: text(
    'Ce qui reste non negociable pendant le voyage',
    'What remains non-negotiable during the trip',
    'Lo que sigue siendo no negociable durante el viaje'
  ),
  ctaTitle: text(
    'Si cette maniere de guider vous parle, le prochain pas peut rester tres simple.',
    'If this way of guiding feels right, the next step can stay simple.',
    'Si esta manera de guiar te convence, el siguiente paso puede seguir siendo simple.'
  ),
  ctaBody: text(
    'Choisissez une route existante ou ecrivez avec votre idee de voyage. Le site a maintenant ete refait pour servir ce moment-la.',
    'Choose an existing route or write with your travel idea. The site was rebuilt to serve exactly that moment.',
    'Elige una ruta existente o escribe con tu idea de viaje. El sitio se rehizo para servir justo a ese momento.'
  ),
  ctaPrimary: text('Voir les circuits', 'Browse tours', 'Ver circuitos'),
  ctaSecondary: text('Ecrire maintenant', 'Write now', 'Escribir ahora'),
};

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function deepMerge<T>(defaults: T, value: unknown): T {
  if (!isObject(defaults) || !isObject(value)) {
    return (value as T) ?? defaults;
  }

  const result: Record<string, unknown> = { ...defaults };

  for (const key of Object.keys(defaults)) {
    const defaultValue = (defaults as Record<string, unknown>)[key];
    const incomingValue = value[key];

    result[key] =
      isObject(defaultValue) && isObject(incomingValue)
        ? deepMerge(defaultValue, incomingValue)
        : incomingValue ?? defaultValue;
  }

  return result as T;
}

function readContent<T>(value: Json | null | undefined, defaults: T): T {
  return deepMerge(defaults, value ?? {});
}

export function getLocalizedContent(
  locale: string,
  value: LocalizedContent
): string {
  if (locale === 'en') {
    return value.en || value.fr || value.es;
  }

  if (locale === 'es') {
    return value.es || value.fr || value.en;
  }

  return value.fr || value.en || value.es;
}

export function getHomepageContent(settings: SiteSettings | null) {
  return readContent(settings?.homepage_content, homepageContentDefaults);
}

export function getCircuitsPageContent(settings: SiteSettings | null) {
  return readContent(
    settings?.circuits_page_content,
    circuitsPageContentDefaults
  );
}

export function getDestinationsPageContent(settings: SiteSettings | null) {
  return readContent(
    settings?.destinations_page_content,
    destinationsPageContentDefaults
  );
}

export function getAboutPageContent(settings: SiteSettings | null) {
  return readContent(settings?.about_page_content, aboutPageContentDefaults);
}
