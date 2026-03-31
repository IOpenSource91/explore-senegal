'use client';

import { useState, useTransition } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';

const STATUS_OPTIONS = [
  { key: 'new', label: 'Nouveau' },
  { key: 'replied', label: 'Repondu' },
  { key: 'archived', label: 'Archive' },
] as const;

export default function StatusActions({
  contactId,
  currentStatus,
}: {
  contactId: string;
  currentStatus: string;
}) {
  const supabase = createClient();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);

  async function changeStatus(newStatus: string) {
    await supabase
      .from('contacts')
      .update({ status: newStatus })
      .eq('id', contactId);

    setOpen(false);
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={isPending}
        className="rounded-xl bg-surface-container-high px-4 py-2 text-label-md font-semibold uppercase tracking-wider text-on-surface disabled:opacity-50"
      >
        {isPending ? '...' : 'Statut'}
      </button>

      {open && (
        <div className="absolute right-0 top-full z-10 mt-2 w-40 rounded-xl bg-surface-container-lowest p-2 shadow-ambient">
          {STATUS_OPTIONS.filter((opt) => opt.key !== currentStatus).map(
            (opt) => (
              <button
                key={opt.key}
                onClick={() => changeStatus(opt.key)}
                className="w-full rounded-xl px-3 py-2 text-left text-body-md text-on-surface hover:bg-surface-container-low"
              >
                {opt.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
