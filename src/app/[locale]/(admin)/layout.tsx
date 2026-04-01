import { redirect } from 'next/navigation';
import { createAdminServerClient as createServerSupabaseClient } from '@/lib/supabase/admin-server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminRouteLoader } from '@/components/admin/AdminRouteLoader';
import { Toaster } from '@/components/ui/sonner';

export default async function AdminLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/login`);
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-container-low">
      <AdminSidebar />
      <div className="relative flex min-w-0 flex-1 flex-col overflow-hidden">
        <AdminHeader />
        <main className="min-h-0 flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
        <AdminRouteLoader />
      </div>
      <Toaster position="bottom-right" richColors />
    </div>
  );
}
