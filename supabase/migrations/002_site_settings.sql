CREATE TABLE IF NOT EXISTS site_settings (
  id TEXT PRIMARY KEY DEFAULT 'default',
  theme TEXT NOT NULL DEFAULT 'terracotta',
  site_name TEXT DEFAULT 'Explore Sénégal',
  whatsapp TEXT DEFAULT '',
  email TEXT DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public can read settings" ON site_settings FOR SELECT USING (true);
CREATE POLICY "Admin can update settings" ON site_settings FOR ALL USING (auth.role() = 'authenticated');
INSERT INTO site_settings (id, theme) VALUES ('default', 'terracotta') ON CONFLICT DO NOTHING;
