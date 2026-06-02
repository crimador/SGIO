'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { Building2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Account {
  id: string;
  name: string;
}

interface AssociateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  documentName: string;
  linkedAccounts: Account[];
}

export function AssociateAccountModal({
  isOpen,
  onClose,
  documentId,
  documentName,
  linkedAccounts: initialLinked,
}: AssociateAccountModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [allAccounts, setAllAccounts] = useState<Account[]>([]);
  const [linked, setLinked] = useState<Account[]>(initialLinked);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setLinked(initialLinked);
    setFetching(true);
    axios
      .get('/api/crm/account')
      .then((res) => setAllAccounts(res.data))
      .catch(() =>
        toast({ variant: 'destructive', title: 'Impossible de charger les comptes' })
      )
      .finally(() => setFetching(false));
  }, [isOpen]);

  const isLinked = (id: string) => linked.some((a) => a.id === id);

  const toggle = async (account: Account) => {
    const action = isLinked(account.id) ? 'disconnect' : 'connect';
    setLoadingId(account.id);
    try {
      const res = await axios.patch(`/api/documents/${documentId}`, {
        accountId: account.id,
        action,
      });
      setLinked(res.data.accounts);
      router.refresh();
      toast({
        title: action === 'connect' ? 'Compte associé' : 'Compte dissocié',
        description:
          action === 'connect'
            ? `"${account.name}" a été lié au document.`
            : `"${account.name}" a été dissocié du document.`,
      });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue.' });
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = allAccounts.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Associer à un compte CRM
          </DialogTitle>
          <p className="truncate text-sm text-gray-400">{documentName}</p>
        </DialogHeader>

        {linked.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Comptes liés ({linked.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {linked.map((a) => (
                <span key={a.id} className="inline-flex items-center gap-1 rounded-sm bg-gray-100 pl-2 pr-1 text-xs font-normal">
                  {a.name}
                  <button
                    onClick={() => toggle(a)}
                    disabled={loadingId === a.id}
                    className="ml-1 rounded-full p-0.5 hover:bg-gray-300"
                  >
                    <Cross2Icon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un compte..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {fetching ? (
          <p className="py-6 text-center text-sm text-gray-400">Chargement...</p>
        ) : filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun compte trouvé.</p>
        ) : (
          <ScrollArea className="h-60">
            <div className="space-y-1 pr-2">
              {filtered.map((account) => {
                const linked_ = isLinked(account.id);
                return (
                  <button
                    key={account.id}
                    onClick={() => toggle(account)}
                    disabled={loadingId === account.id}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm hover:bg-accent disabled:opacity-50"
                  >
                    <span className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-gray-400" />
                      {account.name}
                    </span>
                    {linked_ && <CheckIcon className="h-4 w-4 text-[#FF7E00]" />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="flex h-8 items-center gap-1.5 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: '#1E1D3D' }}
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
