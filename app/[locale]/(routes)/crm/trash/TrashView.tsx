'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { RotateCcw, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from '@/components/ui/use-toast';

type TrashItem = {
  id: string;
  name: string;
  entity: 'account' | 'contact' | 'lead' | 'opportunity' | 'campaign';
  deletedAt: Date | string | null;
};

type Props = {
  items: TrashItem[];
};

const ENTITY_LABELS: Record<TrashItem['entity'], string> = {
  account: 'Compte',
  contact: 'Contact',
  lead: 'Prospect',
  opportunity: 'Opportunité',
  campaign: 'Campagne',
};

const ENTITY_CLASSES: Record<TrashItem['entity'], string> = {
  account: 'bg-blue-100 text-blue-700',
  contact: 'bg-gray-100 text-gray-700',
  lead: 'border text-gray-600',
  opportunity: 'bg-red-100 text-red-700',
  campaign: 'bg-gray-100 text-gray-700',
};

export function TrashView({ items }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<TrashItem | null>(null);

  const handleRestore = async (item: TrashItem) => {
    setLoading(item.id);
    try {
      await axios.patch(`/api/crm/trash/${item.entity}/${item.id}`);
      toast({ title: 'Élément restauré avec succès' });
      router.refresh();
    } catch {
      toast({ title: 'Erreur lors de la restauration', variant: 'destructive' });
    } finally {
      setLoading(null);
    }
  };

  const handlePermanentDelete = async (item: TrashItem) => {
    setLoading(item.id);
    try {
      await axios.delete(`/api/crm/trash/${item.entity}/${item.id}`);
      toast({ title: 'Suppression définitive effectuée' });
      router.refresh();
    } catch {
      toast({ title: 'Erreur lors de la suppression', variant: 'destructive' });
    } finally {
      setLoading(null);
      setConfirmDelete(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <Trash2 className="mb-4 h-12 w-12 opacity-30" />
        <p className="text-lg font-medium">La corbeille est vide</p>
        <p className="text-sm">Les éléments supprimés apparaîtront ici.</p>
      </div>
    );
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nom</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Supprimé le</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.entity}-${item.id}`}>
              <TableCell className="font-medium">{item.name}</TableCell>
              <TableCell>
                <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${ENTITY_CLASSES[item.entity]}`}>
                  {ENTITY_LABELS[item.entity]}
                </span>
              </TableCell>
              <TableCell>
                {item.deletedAt
                  ? format(new Date(item.deletedAt), 'dd MMM yyyy à HH:mm', { locale: fr })
                  : '—'}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <button
                    className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06] disabled:opacity-50"
                    style={{ color: '#1E1D3D' }}
                    disabled={loading === item.id}
                    onClick={() => handleRestore(item)}
                  >
                    <RotateCcw className="h-3 w-3" />
                    Restaurer
                  </button>
                  <button
                    className="flex h-8 items-center gap-1.5 rounded-md border border-red-200 bg-red-50 px-3 text-sm font-medium text-red-600 transition-colors hover:bg-red-100 disabled:opacity-50"
                    disabled={loading === item.id}
                    onClick={() => setConfirmDelete(item)}
                  >
                    <Trash2 className="h-3 w-3" />
                    Supprimer
                  </button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <Dialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suppression définitive</DialogTitle>
            <DialogDescription>
              Cette action est irréversible. <strong>{confirmDelete?.name}</strong> sera
              définitivement supprimé de la base de données.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <button
              className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
              onClick={() => setConfirmDelete(null)}
            >
              Annuler
            </button>
            <button
              className="flex h-9 items-center rounded-lg border border-red-200 bg-red-50 px-4 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
              onClick={() => confirmDelete && handlePermanentDelete(confirmDelete)}
            >
              Supprimer définitivement
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
