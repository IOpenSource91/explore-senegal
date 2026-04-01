# Explore Sénégal — Journal de développement

## Stack technique

- **Framework** : Next.js 15.5 + React 19
- **Styling** : Tailwind CSS 3.4 + shadcn/ui (Radix)
- **Backend** : Supabase (Auth, Database, Storage)
- **i18n** : next-intl v4 (FR / EN / ES)
- **Animations** : framer-motion
- **Fonts** : Epilogue (headings) + Inter (body)
- **Design System** : Sahelian Horizon (terracotta, golden hour, atlantic teal)

---

## Ce qui a été fait

### 1. Setup initial (existait déjà)

- Projet Next.js 15 avec `src/` directory
- Configuration Tailwind avec le design system Sahelian Horizon
- Supabase client/server avec SSR cookies
- i18n routing (fr, en, es) avec next-intl
- Schema SQL complet (`001_initial_schema.sql`) avec :
  - Tables : `destinations`, `tours`, `tour_destinations`, `tour_itinerary`, `media`, `services`, `contacts`
  - Enums : `tour_status`, `media_type`, `contact_status`, `difficulty_level`
  - RLS policies (public read, admin write)
  - Seed data : 5 destinations, 3 circuits, itinéraires, services
- Pages existantes : accueil, liste circuits, détail circuit, dashboard admin, login

---

### 2. Pages publiques créées

#### `/destinations`
- Server component avec fetch Supabase
- Grille de cartes responsive (1/2/3 colonnes)
- Image de couverture, tagline, description
- Traductions dynamiques FR/EN/ES

#### `/about`
- Page "Mon Histoire" — présentation de Moussa, le guide
- Sections : Hero, Story (photo + texte), Mission, 4 Valeurs (Passion, Savoir Local, Sécurité, Excellence), CTA
- Traductions complètes FR/EN/ES

#### `/contact`
- Formulaire client-side (nom, email, téléphone, message)
- Insertion dans la table `contacts` via Supabase
- État de succès avec animation
- Sidebar avec infos : WhatsApp, Email, Localisation

---

### 3. Pages admin (toutes sous `/dashboard/...`)

Toutes les pages admin utilisent :
- **shadcn/ui** : Dialog, Button, Input, Label, Textarea, Select, Badge, Table, Switch, DropdownMenu, ScrollArea
- **framer-motion** : AnimatePresence, layout animations, staggered card entries
- **Sonner** : toasts de feedback (succès/erreur)
- **Formulaires en popup Dialog** — plus de pages séparées pour créer/éditer

#### `/dashboard` — Tableau de bord
- Stats en temps réel : circuits, destinations, réservations, médias
- Cartes d'activité récente et circuits à venir

#### `/dashboard/circuits` — Gestion des circuits
- Grille de cartes avec thumbnails, badges de statut (published/draft), étoile featured
- Barre de recherche
- **Dialog création** : formulaire tabulé (Info Générale, Descriptions FR/EN/ES, Détails, Publication)
- **Dialog édition** : même formulaire pré-rempli
- **Dialog suppression** : confirmation avec suppression des relations (itinerary, destinations)
- Auto-génération du slug depuis le nom

#### `/dashboard/destinations` — Gestion des destinations
- Grille de cartes avec images de couverture
- Create/Edit/Delete en Dialog
- Champs : nom, slug (auto), descriptions FR/EN/ES, taglines FR/EN/ES, image de couverture

#### `/dashboard/reservations` — Contacts & Réservations
- Table shadcn avec colonnes : nom, contact, statut, date
- Filtres par onglets : Tous, Nouveaux, Répondus, Archivés
- Badges de statut colorés (rouge=nouveau, teal=répondu, gris=archivé)
- DropdownMenu pour changer le statut
- Clic sur une ligne → Dialog de détails complet
- Suppression avec confirmation

#### `/dashboard/services` — Services proposés
- Grille de cartes avec icône et description
- CRUD complet en Dialog (nom FR/EN/ES, description FR/EN/ES, icône)

#### `/dashboard/media` — Médiathèque
- Grille masonry (CSS columns) avec hover overlays
- Clic → Dialog de détails avec preview, copie URL, suppression
- Zone d'upload placeholder

#### `/dashboard/settings` — Paramètres
- **Sélecteur de thème** : 5 presets visuels avec swatches de couleurs
- Champs : nom du site, numéro WhatsApp, email
- Sauvegarde dans la table `site_settings`

---

### 4. Système de thèmes dynamiques

#### 5 presets de couleurs
| Preset | Primary | Secondary | Tertiary | Surface |
|--------|---------|-----------|----------|---------|
| Terracotta | `#9c3d00` | `#815500` | `#0c6475` | `#fff8f1` |
| Océan | `#1a5276` | `#1e8449` | `#d4ac0d` | `#f0f8ff` |
| Savane | `#8B7355` | `#CD853F` | `#556B2F` | `#faf5ef` |
| Forêt | `#2d5016` | `#6b4226` | `#1a6b5a` | `#f2f8f0` |
| Sunset | `#c0392b` | `#e67e22` | `#8e44ad` | `#fdf6f0` |

#### Architecture
- **`src/lib/themes.ts`** : définitions des presets + helpers
- **`ThemeProvider`** : charge le thème depuis `site_settings`, applique les CSS vars sur `:root`
- **`tailwind.config.ts`** : couleurs Tailwind pointent vers `var(--theme-*, fallback)` → les classes comme `bg-primary`, `text-on-surface` sont dynamiques
- **`globals.css`** : defaults terracotta en CSS pour éviter le flash (FOUC)
- **Table `site_settings`** : persiste le choix du thème

---

### 5. Organisation des images

#### Structure `/assets/` (gitignored)
```
assets/
├── lac-rose/          (8 images)
├── mbodienne/         (7 images)
├── goree/             (11 images)
├── guide/             (5 images — portraits de Moussa)
├── groupes/           (5 images — photos de groupe)
└── dakar/             (2 images — monument, statue)
```

38 images WhatsApp renommées avec des noms descriptifs et organisées par lieu.

#### Script de seed (`scripts/seed-media.ts`)
- Se connecte avec la service_role key
- Crée le bucket `media` dans Supabase Storage (public)
- Upload les 38 images depuis `/assets/`
- Met à jour les `cover_image` des 5 destinations
- Met à jour les `cover_image` des 3 circuits
- Insère 38 enregistrements `media` liés aux bons circuits/destinations
- Usage : `npx tsx scripts/seed-media.ts`

---

### 6. Corrections techniques

#### Middleware i18n
- Déplacé de `middleware.ts` (racine) vers `src/middleware.ts` (Next.js le cherche dans `src/` quand le projet utilise `src/`)
- `/` redirige maintenant vers `/fr`
- Session Supabase rafraîchie avec try/catch (non-bloquant)

#### Conflits de routes
- Les pages admin étaient sous `(admin)/circuits`, `(admin)/destinations` → conflit avec `(public)/circuits`, `(public)/destinations`
- Déplacées sous `(admin)/dashboard/circuits`, `(admin)/dashboard/destinations`, etc.
- Sidebar admin mise à jour avec les bons hrefs `/dashboard/...`

#### Types TypeScript
- Types `Database` circulaires corrigés (causaient `never` sur les mutations)
- Clients Supabase non-typés créés pour l'admin (`admin-client.ts`, `admin-server.ts`)
- `useTranslations` → `getTranslations` pour les composants async (Next.js 15)
- `params` → `Promise<{ locale: string }>` partout (Next.js 15)

#### shadcn/ui Dialog
- Background forcé `bg-white` (au lieu de `bg-popover` transparent)
- Overlay `bg-black/40` avec `backdrop-blur-sm`
- Footer avec `bg-surface-container-low` opaque
- Max-width élargi à `sm:max-w-lg`

---

### 7. Compte admin

- **Email** : `ikeecode@gmail.com`
- **Mot de passe** : `ExploreSenegal2026!`
- Créé via `supabase.auth.signUp()`, email confirmé

---

### 8. Migrations SQL

| Fichier | Contenu |
|---------|---------|
| `001_initial_schema.sql` | Tables, enums, RLS, triggers, seed data |
| `002_site_settings.sql` | Table `site_settings` pour le thème et les paramètres |

---

### 9. Déploiement

- **Repo GitHub** : https://github.com/ikeecode/explore-senegal (privé)
- **Branche** : `main`

---

## À faire ensuite

- [ ] Exécuter `002_site_settings.sql` dans le SQL Editor de Supabase
- [ ] Implémenter l'upload réel de médias (drag & drop → Supabase Storage)
- [ ] Gestion de l'itinéraire des circuits (CRUD des étapes)
- [ ] Page de détail destination publique
- [ ] SEO : métadonnées dynamiques par page
- [ ] Déploiement sur Vercel
- [ ] Configurer un vrai numéro WhatsApp et email de contact
- [ ] Ajouter les photos de Moussa sur la page About
- [ ] Formulaire de réservation lié à un circuit spécifique
- [ ] Newsletter (intégration Mailchimp ou Resend)
