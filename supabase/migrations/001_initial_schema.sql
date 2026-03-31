-- ============================================================
-- Explore Sénégal — Schema Initial
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ──────────────────────────────────────────────────────
-- ENUMS
-- ──────────────────────────────────────────────────────
CREATE TYPE tour_status AS ENUM ('draft', 'published');
CREATE TYPE media_type AS ENUM ('image', 'video');
CREATE TYPE contact_status AS ENUM ('new', 'replied', 'archived');
CREATE TYPE difficulty_level AS ENUM ('easy', 'moderate', 'challenging');

-- ──────────────────────────────────────────────────────
-- DESTINATIONS
-- ──────────────────────────────────────────────────────
CREATE TABLE destinations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_en TEXT,
  description_es TEXT,
  cover_image TEXT,
  tagline TEXT,
  tagline_en TEXT,
  tagline_es TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────
-- TOURS (Circuits)
-- ──────────────────────────────────────────────────────
CREATE TABLE tours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  slug TEXT NOT NULL UNIQUE,
  short_description TEXT,
  short_description_en TEXT,
  short_description_es TEXT,
  long_description TEXT,
  long_description_en TEXT,
  long_description_es TEXT,
  duration TEXT,
  price NUMERIC(10, 2),
  currency TEXT NOT NULL DEFAULT 'EUR',
  max_group_size INTEGER,
  language TEXT DEFAULT 'Français',
  difficulty difficulty_level DEFAULT 'moderate',
  cover_image TEXT,
  status tour_status NOT NULL DEFAULT 'draft',
  featured BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────
-- TOUR <-> DESTINATIONS (many-to-many)
-- ──────────────────────────────────────────────────────
CREATE TABLE tour_destinations (
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  destination_id UUID NOT NULL REFERENCES destinations(id) ON DELETE CASCADE,
  PRIMARY KEY (tour_id, destination_id)
);

-- ──────────────────────────────────────────────────────
-- TOUR ITINERARY
-- ──────────────────────────────────────────────────────
CREATE TABLE tour_itinerary (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tour_id UUID NOT NULL REFERENCES tours(id) ON DELETE CASCADE,
  step_order INTEGER NOT NULL DEFAULT 1,
  title TEXT NOT NULL,
  title_en TEXT,
  title_es TEXT,
  description TEXT,
  description_en TEXT,
  description_es TEXT
);

-- ──────────────────────────────────────────────────────
-- MEDIA (photos & videos)
-- ──────────────────────────────────────────────────────
CREATE TABLE media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url TEXT NOT NULL,
  type media_type NOT NULL DEFAULT 'image',
  alt_text TEXT,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  destination_id UUID REFERENCES destinations(id) ON DELETE SET NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────
-- SERVICES
-- ──────────────────────────────────────────────────────
CREATE TABLE services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  name_en TEXT,
  name_es TEXT,
  description TEXT,
  description_en TEXT,
  description_es TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────
-- CONTACTS / BOOKINGS
-- ──────────────────────────────────────────────────────
CREATE TABLE contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  message TEXT,
  tour_id UUID REFERENCES tours(id) ON DELETE SET NULL,
  status contact_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ──────────────────────────────────────────────────────
-- INDEXES
-- ──────────────────────────────────────────────────────
CREATE INDEX idx_tours_status ON tours(status);
CREATE INDEX idx_tours_featured ON tours(featured);
CREATE INDEX idx_tours_slug ON tours(slug);
CREATE INDEX idx_destinations_slug ON destinations(slug);
CREATE INDEX idx_media_tour ON media(tour_id);
CREATE INDEX idx_media_destination ON media(destination_id);
CREATE INDEX idx_contacts_status ON contacts(status);

-- ──────────────────────────────────────────────────────
-- UPDATED_AT TRIGGER
-- ──────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_destinations_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_tours_updated_at
  BEFORE UPDATE ON tours
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ──────────────────────────────────────────────────────
-- ROW LEVEL SECURITY (RLS)
-- ──────────────────────────────────────────────────────

-- Enable RLS on all tables
ALTER TABLE destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tours ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE tour_itinerary ENABLE ROW LEVEL SECURITY;
ALTER TABLE media ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;

-- PUBLIC READ: Anyone can read published tours and destinations
CREATE POLICY "Public can view destinations"
  ON destinations FOR SELECT USING (true);

CREATE POLICY "Public can view published tours"
  ON tours FOR SELECT USING (status = 'published');

CREATE POLICY "Public can view tour destinations"
  ON tour_destinations FOR SELECT USING (true);

CREATE POLICY "Public can view itinerary"
  ON tour_itinerary FOR SELECT USING (true);

CREATE POLICY "Public can view media"
  ON media FOR SELECT USING (true);

CREATE POLICY "Public can view services"
  ON services FOR SELECT USING (true);

-- PUBLIC INSERT: Anyone can submit a contact form
CREATE POLICY "Public can submit contact"
  ON contacts FOR INSERT WITH CHECK (true);

-- ADMIN: Authenticated users can do everything
CREATE POLICY "Admin full access destinations"
  ON destinations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access tours"
  ON tours FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access tour_destinations"
  ON tour_destinations FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access itinerary"
  ON tour_itinerary FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access media"
  ON media FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access services"
  ON services FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Admin full access contacts"
  ON contacts FOR ALL USING (auth.role() = 'authenticated');

-- ──────────────────────────────────────────────────────
-- STORAGE BUCKETS (run in Supabase dashboard or via API)
-- ──────────────────────────────────────────────────────
-- Create bucket: 'media' (public)
-- This needs to be done via Supabase Dashboard > Storage > New Bucket
-- Name: media
-- Public: Yes
-- File size limit: 50MB
-- Allowed MIME types: image/jpeg, image/png, image/webp, video/mp4

-- ──────────────────────────────────────────────────────
-- SEED DATA — Your actual tours!
-- ──────────────────────────────────────────────────────

-- Destinations
INSERT INTO destinations (name, slug, description, description_en, description_es, tagline, tagline_en, tagline_es) VALUES
  ('Lac Rose', 'lac-rose',
   'Le célèbre lac aux eaux roses, entouré de dunes de sable dorées.',
   'The famous lake with pink waters, surrounded by golden sand dunes.',
   'El famoso lago de aguas rosas, rodeado de dunas de arena doradas.',
   'Les eaux roses du Sénégal',
   'The pink waters of Senegal',
   'Las aguas rosas de Senegal'),
  ('Île de Gorée', 'ile-de-goree',
   'Île historique au large de Dakar, classée au patrimoine mondial de l''UNESCO.',
   'Historic island off the coast of Dakar, UNESCO World Heritage site.',
   'Isla histórica frente a la costa de Dakar, patrimonio mundial de la UNESCO.',
   'Mémoire et beauté',
   'Memory and beauty',
   'Memoria y belleza'),
  ('Mbodienne', 'mbodienne',
   'Village paisible avec ses ruelles authentiques et sa vie locale.',
   'Peaceful village with its authentic alleys and local life.',
   'Pueblo tranquilo con sus callejuelas auténticas y vida local.',
   'L''authenticité villageoise',
   'Village authenticity',
   'La autenticidad del pueblo'),
  ('Baobab de Nianing', 'baobab-de-nianing',
   'Un baobab majestueux, symbole millénaire de l''Afrique de l''Ouest.',
   'A majestic baobab, a thousand-year-old symbol of West Africa.',
   'Un baobab majestuoso, símbolo milenario de África Occidental.',
   'Le géant millénaire',
   'The thousand-year giant',
   'El gigante milenario'),
  ('Église de Nianing', 'eglise-de-nianing',
   'La plus belle église de l''Afrique de l''Ouest, architecture remarquable.',
   'The most beautiful church in West Africa, remarkable architecture.',
   'La iglesia más bella de África Occidental, arquitectura notable.',
   'Joyau architectural',
   'Architectural jewel',
   'Joya arquitectónica');

-- Tours
INSERT INTO tours (name, name_en, name_es, slug, short_description, short_description_en, short_description_es, long_description, long_description_en, long_description_es, duration, price, max_group_size, language, difficulty, status, featured) VALUES
  ('Aventure au Lac Rose',
   'Lac Rose Adventure',
   'Aventura en el Lac Rose',
   'aventure-lac-rose',
   'Balade en jeep sur les dunes, visite du lac et repas délicieux dans un bon restaurant.',
   'Jeep ride on the dunes, lake visit and delicious meal at a great restaurant.',
   'Paseo en jeep por las dunas, visita al lago y deliciosa comida en un buen restaurante.',
   'Découvrez la merveille rose du Sénégal. Nous commencerons par une excitante balade en jeep sur les dunes de sable doré qui entourent le Lac Rose. Admirez les eaux roses uniques au monde, puis profitez d''un repas traditionnel sénégalais dans un restaurant local.',
   'Discover the pink wonder of Senegal. We will start with an exciting jeep ride on the golden sand dunes surrounding Lac Rose. Admire the unique pink waters and then enjoy a traditional Senegalese meal at a local restaurant.',
   'Descubre la maravilla rosa de Senegal. Comenzaremos con un emocionante paseo en jeep por las dunas de arena dorada que rodean el Lac Rose. Admire las aguas rosas únicas y disfrute de una comida tradicional senegalesa en un restaurante local.',
   '1 journée', 125, 8, 'Français, English', 'moderate', 'published', true),

  ('Découverte des Villages de Mbodienne',
   'Mbodienne Village Discovery',
   'Descubrimiento de los Pueblos de Mbodienne',
   'decouverte-villages-mbodienne',
   'Balade en quad dans les villages, visite du baobab de Nianing et de la belle église.',
   'Quad ride through villages, visit the Nianing baobab and beautiful church.',
   'Paseo en quad por los pueblos, visita al baobab de Nianing y la hermosa iglesia.',
   'Une aventure authentique à travers les villages de Mbodienne et ses environs. Nous ferons une balade en quad dans les ruelles des villages, découvrirons le majestueux baobab de Nianing et visiterons la plus belle église de l''Afrique de l''Ouest. Une petite pause au campement pour savourer des boissons locales et la bière du pays.',
   'An authentic adventure through the villages of Mbodienne and its surroundings. We will take a quad ride through the village alleys, discover the majestic Nianing baobab and visit the most beautiful church in West Africa. A short break at the camp to enjoy local drinks and the country''s beer.',
   'Una aventura auténtica a través de los pueblos de Mbodienne y sus alrededores. Haremos un paseo en quad por las callejuelas de los pueblos, descubriremos el majestuoso baobab de Nianing y visitaremos la iglesia más bella de África Occidental. Una pequeña pausa en el campamento para disfrutar de bebidas locales y la cerveza del país.',
   '1 journée', 95, 6, 'Français, English', 'easy', 'published', true),

  ('Île de Gorée — Histoire et Culture',
   'Gorée Island — History and Culture',
   'Isla de Gorée — Historia y Cultura',
   'ile-de-goree-histoire-culture',
   'Visite de l''île historique de Gorée, patrimoine mondial UNESCO.',
   'Visit to the historic Gorée Island, UNESCO World Heritage site.',
   'Visita a la histórica Isla de Gorée, patrimonio mundial de la UNESCO.',
   'Embarquez pour l''Île de Gorée, un lieu chargé d''histoire et de mémoire. Découvrez la Maison des Esclaves, les ruelles colorées, l''artisanat local et profitez de vues imprenables sur l''océan Atlantique. Un voyage émouvant et enrichissant.',
   'Embark for Gorée Island, a place steeped in history and memory. Discover the House of Slaves, colorful alleys, local craftsmanship and enjoy breathtaking views of the Atlantic Ocean. A moving and enriching journey.',
   'Embarque hacia la Isla de Gorée, un lugar cargado de historia y memoria. Descubra la Casa de los Esclavos, las callejuelas coloridas, la artesanía local y disfrute de vistas impresionantes del Océano Atlántico. Un viaje emocionante y enriquecedor.',
   '1 journée', 110, 10, 'Français, English', 'easy', 'published', true);

-- Link tours to destinations
INSERT INTO tour_destinations (tour_id, destination_id)
SELECT t.id, d.id FROM tours t, destinations d
WHERE t.slug = 'aventure-lac-rose' AND d.slug = 'lac-rose';

INSERT INTO tour_destinations (tour_id, destination_id)
SELECT t.id, d.id FROM tours t, destinations d
WHERE t.slug = 'decouverte-villages-mbodienne' AND d.slug = 'mbodienne';

INSERT INTO tour_destinations (tour_id, destination_id)
SELECT t.id, d.id FROM tours t, destinations d
WHERE t.slug = 'decouverte-villages-mbodienne' AND d.slug = 'baobab-de-nianing';

INSERT INTO tour_destinations (tour_id, destination_id)
SELECT t.id, d.id FROM tours t, destinations d
WHERE t.slug = 'decouverte-villages-mbodienne' AND d.slug = 'eglise-de-nianing';

INSERT INTO tour_destinations (tour_id, destination_id)
SELECT t.id, d.id FROM tours t, destinations d
WHERE t.slug = 'ile-de-goree-histoire-culture' AND d.slug = 'ile-de-goree';

-- Itinerary for Lac Rose
INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 1, 'Exploration des dunes', 'Dune exploration', 'Exploración de las dunas',
       'Balade en jeep 4x4 sur les dunes de sable doré autour du lac.',
       'Jeep 4x4 ride on the golden sand dunes around the lake.',
       'Paseo en jeep 4x4 por las dunas de arena dorada alrededor del lago.'
FROM tours t WHERE t.slug = 'aventure-lac-rose';

INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 2, 'Visite du Lac Rose', 'Lac Rose visit', 'Visita al Lac Rose',
       'Découverte des eaux roses et de l''extraction artisanale du sel.',
       'Discovery of the pink waters and artisanal salt extraction.',
       'Descubrimiento de las aguas rosas y la extracción artesanal de sal.'
FROM tours t WHERE t.slug = 'aventure-lac-rose';

INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 3, 'Repas traditionnel', 'Traditional meal', 'Comida tradicional',
       'Déjeuner délicieux dans un restaurant local au bord du lac.',
       'Delicious lunch at a local restaurant by the lake.',
       'Delicioso almuerzo en un restaurante local junto al lago.'
FROM tours t WHERE t.slug = 'aventure-lac-rose';

-- Itinerary for Mbodienne
INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 1, 'Balade en quad dans les villages', 'Quad ride through villages', 'Paseo en quad por los pueblos',
       'Découverte des villages de Mbodienne et ses environs en quad.',
       'Discover the villages of Mbodienne and surroundings by quad.',
       'Descubrimiento de los pueblos de Mbodienne y sus alrededores en quad.'
FROM tours t WHERE t.slug = 'decouverte-villages-mbodienne';

INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 2, 'Baobab de Nianing', 'Nianing Baobab', 'Baobab de Nianing',
       'Visite du majestueux baobab millénaire de Nianing.',
       'Visit the majestic thousand-year-old Nianing baobab.',
       'Visita al majestuoso baobab milenario de Nianing.'
FROM tours t WHERE t.slug = 'decouverte-villages-mbodienne';

INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 3, 'Église de Nianing', 'Nianing Church', 'Iglesia de Nianing',
       'Visite de la plus belle église de l''Afrique de l''Ouest.',
       'Visit the most beautiful church in West Africa.',
       'Visita a la iglesia más bella de África Occidental.'
FROM tours t WHERE t.slug = 'decouverte-villages-mbodienne';

INSERT INTO tour_itinerary (tour_id, step_order, title, title_en, title_es, description, description_en, description_es)
SELECT t.id, 4, 'Pause au campement', 'Break at the camp', 'Pausa en el campamento',
       'Détente au campement avec boissons locales et bière du pays.',
       'Relaxation at the camp with local drinks and country beer.',
       'Relax en el campamento con bebidas locales y cerveza del país.'
FROM tours t WHERE t.slug = 'decouverte-villages-mbodienne';

-- Services
INSERT INTO services (name, name_en, name_es, description, description_en, description_es, icon) VALUES
  ('Transport privé', 'Private transport', 'Transporte privado',
   'Transport confortable en véhicule climatisé.', 'Comfortable transport in air-conditioned vehicle.', 'Transporte cómodo en vehículo climatizado.', 'car'),
  ('Guide local', 'Local guide', 'Guía local',
   'Guide passionné parlant français et anglais.', 'Passionate guide speaking French and English.', 'Guía apasionado que habla francés e inglés.', 'user'),
  ('Repas inclus', 'Meals included', 'Comidas incluidas',
   'Repas traditionnel sénégalais inclus dans chaque circuit.', 'Traditional Senegalese meal included in each tour.', 'Comida tradicional senegalesa incluida en cada circuito.', 'utensils'),
  ('Circuits sur mesure', 'Custom tours', 'Circuitos a medida',
   'Créez votre propre aventure adaptée à vos envies.', 'Create your own adventure adapted to your wishes.', 'Cree su propia aventura adaptada a sus deseos.', 'sparkles');
