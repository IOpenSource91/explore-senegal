import { randomUUID } from 'crypto';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { slugify } from '@/lib/utils';

export const runtime = 'nodejs';

function getFileExtension(fileName: string) {
  const extension = fileName.split('.').pop()?.toLowerCase();
  return extension || 'bin';
}

function buildStoragePath(
  file: File,
  mediaType: 'image' | 'video',
  customName?: string
) {
  const extension = getFileExtension(file.name);
  const rawBaseName = customName?.trim() || file.name.replace(/\.[^.]+$/, '');
  const baseName =
    slugify(rawBaseName) || `${mediaType}-${Date.now()}`;
  const dateKey = new Date().toISOString().slice(0, 10);

  return `${mediaType}s/${dateKey}/${randomUUID()}-${baseName}.${extension}`;
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const authClient = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {
          // No cookie writes needed in this route.
        },
      },
    }
  );

  const {
    data: { user },
  } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Non autorise' }, { status: 401 });
  }

  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return NextResponse.json(
      { error: 'SUPABASE_SERVICE_ROLE_KEY manquante' },
      { status: 500 }
    );
  }

  const formData = await request.formData();
  const files = formData
    .getAll('files')
    .filter((value): value is File => value instanceof File);
  const customNames = formData
    .getAll('customNames')
    .map((value) => (typeof value === 'string' ? value : ''));

  if (files.length === 0) {
    return NextResponse.json(
      { error: 'Aucun fichier recu' },
      { status: 400 }
    );
  }

  const serviceClient = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );

  const uploaded: Array<{ id: string; url: string }> = [];
  const failed: Array<{ name: string; error: string }> = [];

  for (const [index, file] of files.entries()) {
    const isImage = file.type.startsWith('image/');
    const isVideo = file.type.startsWith('video/');
    const customName = customNames[index]?.trim() || '';

    if (!isImage && !isVideo) {
      failed.push({
        name: file.name,
        error: 'Format non supporte. Utilisez une image ou une video.',
      });
      continue;
    }

    const mediaType = isVideo ? 'video' : 'image';
    const path = buildStoragePath(file, mediaType, customName);
    const buffer = Buffer.from(await file.arrayBuffer());

    const { error: uploadError } = await serviceClient.storage
      .from('media')
      .upload(path, buffer, {
        contentType: file.type || undefined,
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      failed.push({
        name: file.name,
        error: uploadError.message,
      });
      continue;
    }

    const { data: publicUrlData } = serviceClient.storage
      .from('media')
      .getPublicUrl(path);

    const defaultAltText = (customName || file.name.replace(/\.[^.]+$/, ''))
      .replace(/[-_]+/g, ' ')
      .trim();

    const { data: mediaRow, error: insertError } = await serviceClient
      .from('media')
      .insert({
        url: publicUrlData.publicUrl,
        type: mediaType,
        alt_text: defaultAltText || null,
        sort_order: 0,
      })
      .select('id, url')
      .single();

    if (insertError || !mediaRow) {
      await serviceClient.storage.from('media').remove([path]);
      failed.push({
        name: file.name,
        error: insertError?.message || 'Insertion impossible dans la mediatheque',
      });
      continue;
    }

    uploaded.push(mediaRow);
  }

  if (uploaded.length === 0) {
    return NextResponse.json(
      {
        error: failed[0]?.error || 'Aucun fichier n a pu etre televerse',
        failed,
      },
      { status: 400 }
    );
  }

  return NextResponse.json({
    uploadedCount: uploaded.length,
    failed,
  });
}
