'use client';

import { useState } from 'react';
import { Download } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

type Props = { docId: string; docNumber: string };

export function PdfDownloadButton({ docId, docNumber }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/billing/documents/${docId}/pdf`);
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        toast({
          variant: 'destructive',
          title: 'PDF non généré',
          description: (json as { error?: string }).error ?? 'Une erreur est survenue.',
        });
        return;
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${docNumber}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de générer le PDF.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex h-8 items-center gap-1.5 rounded-md border px-2 text-sm font-medium transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50 lg:px-3"
      style={{ color: '#1E1D3D' }}
    >
      <Download className="mr-2 h-4 w-4" />
      {loading ? 'Génération...' : 'PDF'}
    </button>
  );
}
