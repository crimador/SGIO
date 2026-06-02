'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import axios, { AxiosError } from 'axios';
import { TrashIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

type Props = { boardId: string; boardName: string };

const DeleteProjectDialog = ({ boardId, boardName }: Props) => {
  const [open, setOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onDelete = async () => {
    setIsLoading(true);
    try {
      await axios.delete(`/api/projects/${boardId}`);
      toast({ title: 'Projet supprimé', description: `Le projet "${boardName}" a été supprimé.` });
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une erreur est survenue lors de la suppression. Veuillez réessayer.',
        });
      }
    } finally {
      setOpen(false);
      setIsLoading(false);
      router.refresh();
      router.push('/projects');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-red-50"
        style={{ color: '#dc2626' }}
      >
        Supprimer le projet
        <TrashIcon size={15} />
      </button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="p-2">Supprimer le projet</DialogTitle>
          <DialogDescription className="p-2">
            Êtes-vous sûr de vouloir supprimer ce projet ? Cette action est irréversible. Toutes les tâches associées seront également supprimées.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-2 p-2">
          <button
            type="button"
            className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
            style={{ color: '#1E1D3D' }}
            onClick={() => setOpen(false)}
          >
            Annuler
          </button>
          <button
            type="button"
            className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50 disabled:opacity-60"
            style={{ color: '#dc2626' }}
            onClick={onDelete}
            disabled={isLoading}
          >
            {isLoading ? <span className="animate-pulse">Suppression...</span> : <span>Supprimer</span>}
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeleteProjectDialog;
