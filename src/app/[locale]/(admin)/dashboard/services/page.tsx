import { setRequestLocale } from 'next-intl/server';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { Layers, Plus } from 'lucide-react';
import ServiceActions from './service-actions';

export default async function ServicesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const supabase = await createServerSupabaseClient();
  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-headline-lg font-bold text-on-surface">
            Services
          </h1>
          <p className="mt-1 text-body-lg text-on-surface-variant">
            Gerez les services proposes.
          </p>
        </div>
      </div>

      {/* Inline create + list */}
      <ServiceActions initialServices={services || []} />
    </div>
  );
}
