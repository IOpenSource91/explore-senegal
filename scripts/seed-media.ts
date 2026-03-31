/**
 * Seed script — uploads images from /assets to Supabase Storage
 * then inserts media records and updates tour/destination cover images.
 *
 * Usage: npx tsx scripts/seed-media.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

// Load .env.local manually
const envPath = path.join(__dirname, '..', '.env.local');
const envContent = fs.readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match) process.env[match[1].trim()] = match[2].trim();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const BUCKET = 'media';

// Service role client bypasses RLS — needed for bucket creation & storage policies
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

// ── Helpers ──────────────────────────────────────────────

async function ensureBucket() {
  const { data: buckets } = await supabase.storage.listBuckets();
  const exists = buckets?.some((b) => b.name === BUCKET);
  if (!exists) {
    const { error } = await supabase.storage.createBucket(BUCKET, {
      public: true,
      fileSizeLimit: 50 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'],
    });
    if (error) console.log('Bucket exists or error:', error.message);
    else console.log('✓ Bucket "media" created');
  } else {
    console.log('✓ Bucket "media" already exists');
  }
}

async function uploadFile(localPath: string, storagePath: string): Promise<string | null> {
  const file = fs.readFileSync(localPath);
  const contentType = 'image/jpeg';

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(storagePath, file, { contentType, upsert: true });

  if (error) {
    console.error(`  ✗ Upload failed: ${storagePath}`, error.message);
    return null;
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(storagePath);
  console.log(`  ✓ Uploaded: ${storagePath}`);
  return data.publicUrl;
}

async function uploadFolder(folder: string): Promise<Record<string, string>> {
  const assetsDir = path.join(__dirname, '..', 'assets', folder);
  const urls: Record<string, string> = {};

  if (!fs.existsSync(assetsDir)) {
    console.log(`  ⚠ Folder not found: ${folder}`);
    return urls;
  }

  const files = fs.readdirSync(assetsDir).filter((f) => f.endsWith('.jpeg') || f.endsWith('.jpg') || f.endsWith('.png'));

  for (const file of files) {
    const localPath = path.join(assetsDir, file);
    const storagePath = `${folder}/${file}`;
    const url = await uploadFile(localPath, storagePath);
    if (url) {
      const key = file.replace(/\.(jpeg|jpg|png)$/, '');
      urls[key] = url;
    }
  }

  return urls;
}

// ── Main ─────────────────────────────────────────────────

async function main() {
  console.log('\n🌍 Explore Sénégal — Seed Media\n');
  console.log(`Supabase: ${SUPABASE_URL}\n`);

  // 1. Ensure bucket exists
  await ensureBucket();

  // 2. Upload all images
  console.log('\n📸 Uploading images...\n');

  const lacRoseUrls = await uploadFolder('lac-rose');
  const mbodienneUrls = await uploadFolder('mbodienne');
  const goreeUrls = await uploadFolder('goree');
  const guideUrls = await uploadFolder('guide');
  const groupesUrls = await uploadFolder('groupes');
  const dakarUrls = await uploadFolder('dakar');

  // 3. Update destination cover images
  console.log('\n🗺️  Updating destination covers...\n');

  const destCovers: Record<string, string | undefined> = {
    'lac-rose': lacRoseUrls['lac-rose-aerien-bateaux'],
    'ile-de-goree': goreeUrls['maison-esclaves-facade'],
    'mbodienne': mbodienneUrls['baobab-touristes'],
    'baobab-de-nianing': mbodienneUrls['baobab-touristes'],
    'eglise-de-nianing': mbodienneUrls['quad-convoi-route'],
  };

  for (const [slug, coverUrl] of Object.entries(destCovers)) {
    if (!coverUrl) continue;
    const { error } = await supabase
      .from('destinations')
      .update({ cover_image: coverUrl })
      .eq('slug', slug);
    if (error) console.error(`  ✗ Destination ${slug}:`, error.message);
    else console.log(`  ✓ ${slug} → cover updated`);
  }

  // 4. Update tour cover images
  console.log('\n🧭 Updating tour covers...\n');

  const tourCovers: Record<string, string | undefined> = {
    'aventure-lac-rose': lacRoseUrls['lac-rose-eau-barque'],
    'decouverte-villages-mbodienne': mbodienneUrls['quad-groupe-moussa'],
    'ile-de-goree-histoire-culture': goreeUrls['maison-esclaves-escalier'],
  };

  for (const [slug, coverUrl] of Object.entries(tourCovers)) {
    if (!coverUrl) continue;
    const { error } = await supabase
      .from('tours')
      .update({ cover_image: coverUrl })
      .eq('slug', slug);
    if (error) console.error(`  ✗ Tour ${slug}:`, error.message);
    else console.log(`  ✓ ${slug} → cover updated`);
  }

  // 5. Insert media records
  console.log('\n📁 Inserting media records...\n');

  // Get tour and destination IDs
  const { data: tours } = await supabase.from('tours').select('id, slug');
  const { data: destinations } = await supabase.from('destinations').select('id, slug');

  const tourMap = Object.fromEntries((tours || []).map((t: any) => [t.slug, t.id]));
  const destMap = Object.fromEntries((destinations || []).map((d: any) => [d.slug, d.id]));

  // Clear existing media to avoid duplicates
  await supabase.from('media').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  console.log('  ✓ Cleared existing media records');

  const mediaRecords: Array<{
    url: string;
    type: 'image';
    alt_text: string;
    tour_id: string | null;
    destination_id: string | null;
    sort_order: number;
  }> = [];

  let order = 0;

  // Lac Rose photos → tour + destination
  for (const [key, url] of Object.entries(lacRoseUrls)) {
    mediaRecords.push({
      url,
      type: 'image',
      alt_text: key.replace(/-/g, ' '),
      tour_id: tourMap['aventure-lac-rose'] || null,
      destination_id: destMap['lac-rose'] || null,
      sort_order: order++,
    });
  }

  // Mbodienne photos → tour + destination
  for (const [key, url] of Object.entries(mbodienneUrls)) {
    mediaRecords.push({
      url,
      type: 'image',
      alt_text: key.replace(/-/g, ' '),
      tour_id: tourMap['decouverte-villages-mbodienne'] || null,
      destination_id: destMap['mbodienne'] || null,
      sort_order: order++,
    });
  }

  // Gorée photos → tour + destination
  for (const [key, url] of Object.entries(goreeUrls)) {
    mediaRecords.push({
      url,
      type: 'image',
      alt_text: key.replace(/-/g, ' '),
      tour_id: tourMap['ile-de-goree-histoire-culture'] || null,
      destination_id: destMap['ile-de-goree'] || null,
      sort_order: order++,
    });
  }

  // Guide photos (no specific tour/destination)
  for (const [key, url] of Object.entries(guideUrls)) {
    mediaRecords.push({
      url,
      type: 'image',
      alt_text: key.replace(/-/g, ' '),
      tour_id: null,
      destination_id: null,
      sort_order: order++,
    });
  }

  // Groupes photos
  for (const [key, url] of Object.entries(groupesUrls)) {
    mediaRecords.push({
      url,
      type: 'image',
      alt_text: key.replace(/-/g, ' '),
      tour_id: null,
      destination_id: null,
      sort_order: order++,
    });
  }

  // Dakar photos
  for (const [key, url] of Object.entries(dakarUrls)) {
    mediaRecords.push({
      url,
      type: 'image',
      alt_text: key.replace(/-/g, ' '),
      tour_id: null,
      destination_id: null,
      sort_order: order++,
    });
  }

  // Insert all media in batch
  const { error: mediaError } = await supabase.from('media').insert(mediaRecords);
  if (mediaError) {
    console.error('  ✗ Media insert error:', mediaError.message);
  } else {
    console.log(`  ✓ Inserted ${mediaRecords.length} media records`);
  }

  console.log('\n✅ Seed complete!\n');
}

main().catch(console.error);
