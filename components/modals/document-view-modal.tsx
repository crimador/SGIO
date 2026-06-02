'use client';

import { useEffect, useState } from 'react';
import ModalDocumentView from '../ui/modal-document-view';
import Link from 'next/link';
import { Download, FileX } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  loading: boolean;
  document: any;
}

const IMAGE_TYPES = [
  'image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp',
  'application/png', 'application/jpg', 'application/jpeg', 'application/gif',
  'images/png', 'images/jpg', 'images/jpeg', 'images/gif',
];

const DocumentViewModal = ({ isOpen, onClose, loading, document }: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const mime = document.document_file_mimeType as string;
  const url = document.document_file_url as string;

  const CloseBtn = () => (
    <div className="flex w-full items-center justify-end space-x-2 pt-4">
      <Link
        href={url}
        download
        target="_blank"
        rel="noopener noreferrer"
        className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50"
        style={{ color: '#1E1D3D' }}
      >
        <Download className="h-4 w-4" />
        Télécharger
      </Link>
      <button
        disabled={loading}
        onClick={onClose}
        className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
        style={{ color: '#1E1D3D' }}
      >
        Fermer
      </button>
    </div>
  );

  if (IMAGE_TYPES.includes(mime)) {
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex h-full flex-col gap-4">
          <div className="relative flex-1 min-h-[400px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={document.document_name ?? 'Aperçu'}
              className="h-full w-full object-contain rounded-md"
            />
          </div>
          <CloseBtn />
        </div>
      </ModalDocumentView>
    );
  }

  if (mime === 'application/pdf') {
    return (
      <ModalDocumentView isOpen={isOpen} onClose={onClose}>
        <div className="flex h-full flex-col gap-2">
          <embed
            style={{ width: '100%', height: '100%', minHeight: '500px' }}
            type="application/pdf"
            src={url}
          />
          <CloseBtn />
        </div>
      </ModalDocumentView>
    );
  }

  return (
    <ModalDocumentView isOpen={isOpen} onClose={onClose}>
      <div className="flex h-full flex-col items-center justify-center gap-4 py-10">
        <FileX className="h-12 w-12 text-gray-400" />
        <p className="text-center text-sm text-gray-400">
          Ce format ne peut pas être prévisualisé.
        </p>
        <p className="text-xs text-gray-400">{mime}</p>
        <CloseBtn />
      </div>
    </ModalDocumentView>
  );
};

export default DocumentViewModal;
