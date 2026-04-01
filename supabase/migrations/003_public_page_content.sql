ALTER TABLE site_settings
ADD COLUMN IF NOT EXISTS homepage_content JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS circuits_page_content JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS destinations_page_content JSONB NOT NULL DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS about_page_content JSONB NOT NULL DEFAULT '{}'::jsonb;
