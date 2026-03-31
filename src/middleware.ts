import createMiddleware from 'next-intl/middleware';
import { NextRequest } from 'next/server';
import { routing } from '@/i18n/routing';
import { updateSession } from '@/lib/supabase/middleware';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
  // i18n routing (handles / → /fr, locale prefixing, etc.)
  const intlResponse = intlMiddleware(request);

  // If i18n redirected, return immediately
  if (intlResponse.status >= 300 && intlResponse.status < 400) {
    return intlResponse;
  }

  // Refresh Supabase session
  try {
    const supabaseResponse = await updateSession(request);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      intlResponse.cookies.set(cookie.name, cookie.value);
    });
  } catch {
    // Continue without session refresh
  }

  return intlResponse;
}

export const config = {
  matcher: [
    '/',
    '/(fr|en|es)/:path*',
    '/((?!api|_next|.*\\..*).*)',
  ],
};
