'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { CheckIcon, Cross2Icon, MagnifyingGlassIcon } from '@radix-ui/react-icons';
import { FileText } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

const SYSTEM_TYPE_LABELS: Record<string, string> = {
  INVOICE: 'Facture',
  RECEIPT: 'Reçu',
  CONTRACT: 'Contrat',
  OFFER: 'Offre',
  ID: "Carte d'identité",
  PASSPORT: 'Passeport',
  VISA: 'Visa',
  INSURANCE: 'Assurance',
  HEALTH: 'Santé',
  CERTIFICATE: 'Certificat',
  OTHER: 'Autre',
};

interface Doc {
  id: string;
  document_name: string;
  document_system_type?: string | null;
}

interface LinkDocumentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  taskId: string;
  allDocuments: Doc[];
  linkedDocuments: Doc[];
}

export function LinkDocumentDialog({
  isOpen,
  onClose,
  taskId,
  allDocuments,
  linkedDocuments: initialLinked,
}: LinkDocumentDialogProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [linked, setLinked] = useState<Doc[]>(initialLinked);
  const [search, setSearch] = useState('');
  const [loadingId, setLoadingId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setLinked(initialLinked);
      setSearch('');
    }
  }, [isOpen]);

  const isLinked = (id: string) => linked.some((d) => d.id === id);

  const toggle = async (doc: Doc) => {
    const action = isLinked(doc.id) ? 'disconnect' : 'assign';
    setLoadingId(doc.id);
    try {
      await axios.post(`/api/projects/tasks/${doc.id}/${action}`, { taskId });

      if (action === 'assign') {
        setLinked((prev) => [...prev, doc]);
        toast({ title: 'Document lié à la tâche.' });
      } else {
        setLinked((prev) => prev.filter((d) => d.id !== doc.id));
        toast({ title: 'Document détaché de la tâche.' });
      }
      router.refresh();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de modifier la liaison.',
      });
    } finally {
      setLoadingId(null);
    }
  };

  const filtered = allDocuments.filter((d) =>
    d.document_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Lier un document à la tâche
          </DialogTitle>
        </DialogHeader>

        {linked.length > 0 && (
          <div className="space-y-1">
            <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Documents liés ({linked.length})
            </p>
            <div className="flex flex-wrap gap-2">
              {linked.map((d) => (
                <span
                  key={d.id}
                  className="inline-flex items-center gap-1 rounded-full bg-gray-100 pl-2 pr-1 py-0.5 text-xs font-medium"
                  style={{ color: '#1E1D3D' }}
                >
                  <FileText className="h-3 w-3" />
                  <span className="max-w-[160px] truncate">{d.document_name}</span>
                  <button
                    onClick={() => toggle(d)}
                    disabled={loadingId === d.id}
                    className="ml-1 rounded-full p-0.5 transition-colors hover:bg-gray-300 disabled:opacity-50"
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
            placeholder="Rechercher un document..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>

        {filtered.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">
            Aucun document trouvé.
          </p>
        ) : (
          <ScrollArea className="h-60">
            <div className="space-y-1 pr-2">
              {filtered.map((doc) => {
                const linked_ = isLinked(doc.id);
                return (
                  <button
                    key={doc.id}
                    onClick={() => toggle(doc)}
                    disabled={loadingId === doc.id}
                    className="flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors hover:bg-[#FF7E00]/[0.06] disabled:opacity-50"
                  >
                    <span className="flex min-w-0 items-center gap-2">
                      <FileText className="h-4 w-4 shrink-0 text-gray-400" />
                      <span className="max-w-[220px] truncate">{doc.document_name}</span>
                      {doc.document_system_type && (
                        <span className="inline-flex shrink-0 items-center rounded-full border px-1.5 py-0.5 text-xs" style={{ color: '#1E1D3D' }}>
                          {SYSTEM_TYPE_LABELS[doc.document_system_type] ?? doc.document_system_type}
                        </span>
                      )}
                    </span>
                    {linked_ && <CheckIcon className="h-4 w-4 shrink-0" style={{ color: '#FF7E00' }} />}
                  </button>
                );
              })}
            </div>
          </ScrollArea>
        )}

        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
            style={{ color: '#1E1D3D' }}
          >
            Fermer
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
