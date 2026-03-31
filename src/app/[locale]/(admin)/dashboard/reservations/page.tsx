'use client';

import { useState, useEffect, useCallback } from 'react';
import { createAdminClient as createClient } from '@/lib/supabase/admin-client';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CalendarCheck,
  Mail,
  Phone,
  MessageSquare,
  MoreHorizontal,
  Eye,
  Trash2,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Contact {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
  tours?: { name: string } | null;
}

const STATUS_CONFIG = {
  new: { label: 'Nouveau', variant: 'destructive' as const, dotColor: 'bg-red-500' },
  replied: { label: 'Repondu', variant: 'default' as const, dotColor: 'bg-[#0c6475]' },
  archived: { label: 'Archive', variant: 'secondary' as const, dotColor: 'bg-gray-400' },
} as const;

const FILTERS = [
  { key: 'all', label: 'Tous' },
  { key: 'new', label: 'Nouveaux' },
  { key: 'replied', label: 'Repondus' },
  { key: 'archived', label: 'Archives' },
];

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { delay: i * 0.04, duration: 0.3 },
  }),
  exit: { opacity: 0, x: 10, transition: { duration: 0.2 } },
};

export default function ReservationsPage() {
  const supabase = createClient();
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchContacts = useCallback(async () => {
    let query = supabase
      .from('contacts')
      .select('*, tours(name)')
      .order('created_at', { ascending: false });

    if (filter !== 'all') {
      query = query.eq('status', filter);
    }

    const { data } = await query;
    setContacts((data as Contact[]) || []);
    setLoading(false);
  }, [supabase, filter]);

  useEffect(() => {
    setLoading(true);
    fetchContacts();
  }, [fetchContacts]);

  async function changeStatus(contactId: string, newStatus: string) {
    const { error } = await supabase
      .from('contacts')
      .update({ status: newStatus })
      .eq('id', contactId);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success(`Statut mis a jour: ${STATUS_CONFIG[newStatus as keyof typeof STATUS_CONFIG]?.label || newStatus}`);
    fetchContacts();
    router.refresh();
  }

  async function handleDelete() {
    if (!deletingId) return;

    const { error } = await supabase.from('contacts').delete().eq('id', deletingId);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success('Contact supprime');
    setDeleteOpen(false);
    setDeletingId(null);
    fetchContacts();
    router.refresh();
  }

  function openDetail(contact: Contact) {
    setSelectedContact(contact);
    setDetailOpen(true);
  }

  function openDeleteDialog(id: string) {
    setDeletingId(id);
    setDeleteOpen(true);
  }

  function getStatusInfo(status: string) {
    return STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.new;
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#9c3d00] border-t-transparent" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div>
        <h1 className="font-heading text-headline-lg font-bold text-on-surface">
          Reservations & Contacts
        </h1>
        <p className="mt-1 text-body-lg text-on-surface-variant">
          Gerez les demandes de contact et reservations.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="mt-6 flex flex-wrap gap-1.5 rounded-xl bg-surface-container-low/60 p-1.5">
        {FILTERS.map((f) => (
          <Button
            key={f.key}
            variant={filter === f.key ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setFilter(f.key)}
            className={cn(
              'rounded-lg transition-all',
              filter === f.key && 'gradient-primary text-white shadow-ambient'
            )}
          >
            {f.label}
          </Button>
        ))}
      </div>

      {/* Table */}
      <div className="mt-6 rounded-xl bg-surface-container-lowest shadow-ambient overflow-hidden">
        {contacts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow className="border-none bg-surface-container-low/40">
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Nom</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Contact</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Statut</TableHead>
                <TableHead className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">Date</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence mode="popLayout">
                {contacts.map((contact, i) => {
                  const statusInfo = getStatusInfo(contact.status || 'new');
                  return (
                    <motion.tr
                      key={contact.id}
                      custom={i}
                      variants={rowVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                      layout
                      className="border-none cursor-pointer transition-colors hover:bg-surface-container-low/30"
                      onClick={() => openDetail(contact)}
                    >
                      <TableCell>
                        <div>
                          <p className="font-semibold text-on-surface">{contact.name}</p>
                          {contact.tours && (
                            <p className="text-xs text-on-surface-variant">
                              {contact.tours.name}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-on-surface-variant">
                          {contact.email && (
                            <span className="inline-flex items-center gap-1">
                              <Mail size={12} />
                              {contact.email}
                            </span>
                          )}
                          {contact.phone && (
                            <span className="inline-flex items-center gap-1">
                              <Phone size={12} />
                              {contact.phone}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant} className="rounded-lg">
                          <span className={cn('mr-1 inline-block h-1.5 w-1.5 rounded-full', statusInfo.dotColor)} />
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-on-surface-variant">
                        {new Date(contact.created_at).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon-sm" className="rounded-lg" />
                            }
                          >
                            <MoreHorizontal size={16} />
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="rounded-xl">
                            <DropdownMenuLabel>Changer le statut</DropdownMenuLabel>
                            {Object.entries(STATUS_CONFIG)
                              .filter(([key]) => key !== (contact.status || 'new'))
                              .map(([key, config]) => (
                                <DropdownMenuItem
                                  key={key}
                                  onClick={() => changeStatus(contact.id, key)}
                                >
                                  <span className={cn('mr-2 inline-block h-2 w-2 rounded-full', config.dotColor)} />
                                  {config.label}
                                </DropdownMenuItem>
                              ))}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => openDetail(contact)}>
                              <Eye size={14} />
                              Voir les details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() => openDeleteDialog(contact.id)}
                            >
                              <Trash2 size={14} />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </motion.tr>
                  );
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        ) : (
          <div className="p-10 text-center">
            <CalendarCheck size={40} className="mx-auto text-on-surface-variant/40" />
            <p className="mt-4 text-body-lg text-on-surface-variant">
              Aucune reservation pour le moment.
            </p>
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
        <DialogContent className="sm:max-w-lg rounded-xl">
          {selectedContact && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <DialogTitle className="font-heading text-lg font-bold text-on-surface">
                    {selectedContact.name}
                  </DialogTitle>
                  <Badge
                    variant={getStatusInfo(selectedContact.status || 'new').variant}
                    className="rounded-lg"
                  >
                    {getStatusInfo(selectedContact.status || 'new').label}
                  </Badge>
                </div>
                <DialogDescription>
                  {new Date(selectedContact.created_at).toLocaleDateString('fr-FR', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="flex flex-wrap gap-4 text-sm text-on-surface-variant">
                  {selectedContact.email && (
                    <a
                      href={`mailto:${selectedContact.email}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low/60 px-3 py-1.5 transition-colors hover:bg-surface-container-low"
                    >
                      <Mail size={14} className="text-[#0c6475]" />
                      {selectedContact.email}
                    </a>
                  )}
                  {selectedContact.phone && (
                    <a
                      href={`tel:${selectedContact.phone}`}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low/60 px-3 py-1.5 transition-colors hover:bg-surface-container-low"
                    >
                      <Phone size={14} className="text-[#0c6475]" />
                      {selectedContact.phone}
                    </a>
                  )}
                  {selectedContact.tours && (
                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-surface-container-low/60 px-3 py-1.5">
                      <CalendarCheck size={14} className="text-[#feb234]" />
                      {selectedContact.tours.name}
                    </span>
                  )}
                </div>

                {selectedContact.message && (
                  <div className="rounded-xl bg-surface-container-low/40 p-4">
                    <div className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                      <MessageSquare size={12} />
                      Message
                    </div>
                    <p className="text-sm leading-relaxed text-on-surface whitespace-pre-wrap">
                      {selectedContact.message}
                    </p>
                  </div>
                )}

                {/* Quick status change */}
                <div className="flex flex-wrap gap-2">
                  {Object.entries(STATUS_CONFIG)
                    .filter(([key]) => key !== (selectedContact.status || 'new'))
                    .map(([key, config]) => (
                      <Button
                        key={key}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          changeStatus(selectedContact.id, key);
                          setSelectedContact({ ...selectedContact, status: key });
                        }}
                        className="rounded-lg"
                      >
                        <span className={cn('mr-1 h-2 w-2 rounded-full', config.dotColor)} />
                        Marquer {config.label.toLowerCase()}
                      </Button>
                    ))}
                </div>
              </div>

              <DialogFooter>
                <DialogClose render={<Button variant="outline" className="rounded-xl" />}>
                  Fermer
                </DialogClose>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm rounded-xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-lg font-bold text-on-surface">
              Supprimer le contact
            </DialogTitle>
            <DialogDescription>
              Voulez-vous vraiment supprimer ce contact ? Cette action est irreversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="outline" className="rounded-xl" />}>
              Annuler
            </DialogClose>
            <Button
              variant="destructive"
              onClick={handleDelete}
              className="rounded-xl"
            >
              <Trash2 size={14} />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
