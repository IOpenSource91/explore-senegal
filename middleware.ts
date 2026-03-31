import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // First handle Supabase session refresh
  const supabaseResponse = await updateSession(request);

  // If Supabase middleware redirected (e.g., to login), return that
  if (supabaseResponse.headers.get('location')) {
    return supabaseResponse;
  }

  // Then handle i18n routing
  const intlResponse = intlMiddleware(request);

  // Copy Supabase cookies to the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: [
    // Match all pathnames except for
    // - API routes
    // - _next (Next.js internals)
    // - static files
    '/((?!api|_next|.*\\..*).*)',
  ],
};
