import { createBrowserClient } from '@supabase/ssr';

/**
 * Untyped Supabase client for admin mutations.
 * RLS policies restrict the typed client's inferred types (e.g., tours SELECT only
 * allows published rows, so insert/update/delete infer `never`).
 * Admin pages use auth, so RLS grants full access at runtime.
 */
export function createAdminClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
