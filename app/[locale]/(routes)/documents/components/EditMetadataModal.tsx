'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';

const DOCUMENT_TYPES = [
  { value: 'INVOICE', label: 'Facture' },
  { value: 'RECEIPT', label: 'Reçu' },
  { value: 'CONTRACT', label: 'Contrat' },
  { value: 'OFFER', label: 'Offre' },
  { value: 'ID', label: "Carte d'identité" },
  { value: 'PASSPORT', label: 'Passeport' },
  { value: 'VISA', label: 'Visa' },
  { value: 'INSURANCE', label: 'Assurance' },
  { value: 'HEALTH', label: 'Santé' },
  { value: 'CERTIFICATE', label: 'Certificat' },
  { value: 'OTHER', label: 'Autre' },
];

const NO_TYPE = '__none__';

interface EditMetadataModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: string;
  initialName: string;
  initialType: string | null | undefined;
  initialDescription?: string | null;
}

export function EditMetadataModal({
  isOpen,
  onClose,
  documentId,
  initialName,
  initialType,
  initialDescription,
}: EditMetadataModalProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [documentName, setDocumentName] = useState(initialName);
  const [documentType, setDocumentType] = useState(initialType ?? NO_TYPE);
  const [description, setDescription] = useState(initialDescription ?? '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await axios.patch(`/api/documents/${documentId}`, {
        documentName,
        documentType: documentType === NO_TYPE ? '' : documentType,
        description,
      });
      router.refresh();
      toast({ title: 'Succès', description: 'Document mis à jour.' });
      onClose();
    } catch {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de mettre à jour le document.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier les informations</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label>Nom du document</Label>
            <Input
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Type de document</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_TYPE}>— Aucun type —</SelectItem>
                {DOCUMENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Description facultative..."
            />
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={onClose}
            disabled={loading}
            className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
            style={{ color: '#1E1D3D' }}
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
