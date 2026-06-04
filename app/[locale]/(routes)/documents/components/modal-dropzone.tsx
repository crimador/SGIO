'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { upload } from '@vercel/blob/client';

import UploadFileModal from '@/components/modals/upload-file-modal';
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
import { LocalFileDropzone } from '@/components/ui/local-file-dropzone';
import { CheckCircle2 } from 'lucide-react';

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

const ACCEPT_MAP: Record<string, string> = {
  pdfUploader: 'application/pdf',
  imageUploader: 'image/*',
  docUploader: '*/*',
  profilePhotoUploader: 'image/*',
};

const MAX_SIZE_MAP: Record<string, number> = {
  pdfUploader: 64,
  imageUploader: 4,
  docUploader: 64,
  profilePhotoUploader: 4,
};

type Step = 'form' | 'upload' | 'success';

type Props = {
  buttonLabel: string;
  fileType: 'pdfUploader' | 'imageUploader' | 'docUploader' | 'profilePhotoUploader';
};

const ModalDropzone = ({ buttonLabel, fileType }: Props) => {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>('form');
  const [documentType, setDocumentType] = useState('');
  const [documentName, setDocumentName] = useState('');
  const [description, setDescription] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleOpen = () => {
    setStep('form');
    setDocumentType('');
    setDocumentName('');
    setDescription('');
    setError(null);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    if (step === 'success') router.refresh();
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    setProgress(0);
    try {
      // 1) Upload DIRECT navigateur → Vercel Blob (avec progression)
      const blob = await upload(`documents/${file.name}`, file, {
        access: 'public',
        handleUploadUrl: '/api/documents/blob-upload',
        onUploadProgress: (p) => setProgress(Math.round(p.percentage)),
      });

      // 2) Enregistrement du document en base
      const res = await fetch('/api/documents/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: blob.url,
          pathname: blob.pathname,
          size: file.size,
          mimeType: file.type,
          documentType: documentType || null,
          documentName: documentName || null,
          description: description || null,
          originalName: file.name,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Erreur lors de l'enregistrement");
      }

      setStep('success');
      router.refresh();
    } catch (err: any) {
      setError(err.message ?? 'Une erreur est survenue');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleOpen}
        className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
      >
        {buttonLabel}
      </button>

      <UploadFileModal isOpen={open} onClose={handleClose}>
        {step === 'form' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Informations du document</h3>
              <p className="text-sm text-gray-400">
                Facultatif — vous pouvez laisser vide et renseigner après l&apos;upload.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-type">Type de document</Label>
              <Select value={documentType} onValueChange={setDocumentType}>
                <SelectTrigger id="doc-type">
                  <SelectValue placeholder="Sélectionner un type..." />
                </SelectTrigger>
                <SelectContent>
                  {DOCUMENT_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-name">Nom du document</Label>
              <Input
                id="doc-name"
                placeholder="Laisser vide pour utiliser le nom du fichier"
                value={documentName}
                onChange={(e) => setDocumentName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="doc-desc">Description</Label>
              <Textarea
                id="doc-desc"
                placeholder="Description facultative..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
              />
            </div>

            <button
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              onClick={() => setStep('upload')}
            >
              Continuer vers l&apos;upload
            </button>
          </div>
        )}

        {step === 'upload' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">Téléverser le fichier</h3>
              {documentType && (
                <p className="text-sm text-gray-400">
                  Type :{' '}
                  <strong>
                    {DOCUMENT_TYPES.find((t) => t.value === documentType)?.label}
                  </strong>
                </p>
              )}
            </div>

            <LocalFileDropzone
              accept={ACCEPT_MAP[fileType]}
              maxSizeMB={MAX_SIZE_MAP[fileType]}
              onUpload={handleUpload}
              uploading={uploading}
            />

            {uploading && (
              <div className="space-y-1.5">
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full transition-all duration-200"
                    style={{
                      width: `${progress}%`,
                      background: 'linear-gradient(135deg, #FF7E00, #FAC731)',
                    }}
                  />
                </div>
                <p className="text-center text-xs font-medium text-gray-500">
                  {progress < 100
                    ? `Téléversement… ${progress}%`
                    : 'Finalisation…'}
                </p>
              </div>
            )}

            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}

            <button
              className="flex h-8 w-full items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-gray-100 disabled:opacity-60"
              style={{ color: '#1E1D3D' }}
              onClick={() => setStep('form')}
              disabled={uploading}
            >
              ← Retour
            </button>
          </div>
        )}

        {step === 'success' && (
          <div className="flex flex-col items-center gap-4 py-6">
            <CheckCircle2 className="h-12 w-12 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-semibold">Document téléversé avec succès !</p>
              {documentType && (
                <p className="text-sm text-gray-400">
                  Type : {DOCUMENT_TYPES.find((t) => t.value === documentType)?.label}
                </p>
              )}
            </div>
            <button
              onClick={handleClose}
              className="flex h-8 items-center gap-1.5 rounded-md border px-4 text-sm font-medium transition-colors hover:bg-gray-50"
              style={{ color: '#1E1D3D' }}
            >
              Fermer
            </button>
          </div>
        )}
      </UploadFileModal>
    </div>
  );
};

export default ModalDropzone;
