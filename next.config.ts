import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');
const DEFAULT_SUPABASE_HOSTNAME = 'igdhmnywzxxgdyrflrcl.supabase.co';

function getSupabaseHostname() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;

  if (!supabaseUrl) {
    return DEFAULT_SUPABASE_HOSTNAME;
  }

  try {
    return new URL(supabaseUrl).hostname;
  } catch {
    return DEFAULT_SUPABASE_HOSTNAME;
  }
}

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: getSupabaseHostname(),
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
};

export default withNextIntl(nextConfig);
