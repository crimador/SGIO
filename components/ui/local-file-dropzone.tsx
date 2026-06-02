'use client';

import React, { useCallback, useRef, useState } from 'react';
import { UploadCloud, X, FileText, Image, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LocalFileDropzoneProps {
  accept?: string;
  maxSizeMB?: number;
  onUpload: (file: File) => Promise<void>;
  uploading: boolean;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType === 'application/pdf') return FileText;
  return File;
}

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

export function LocalFileDropzone({
  accept,
  maxSizeMB = 64,
  onUpload,
  uploading,
}: LocalFileDropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const validate = (file: File) => {
    if (file.size > maxSizeMB * 1024 * 1024) {
      setError(`Le fichier dépasse la limite de ${maxSizeMB} Mo.`);
      return false;
    }
    setError(null);
    return true;
  };

  const handleFile = (file: File) => {
    if (validate(file)) setSelectedFile(file);
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const Icon = selectedFile ? getFileIcon(selectedFile.type) : UploadCloud;

  return (
    <div className="space-y-3">
      <div
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-6 py-10 transition-colors cursor-pointer',
          dragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50',
          uploading && 'pointer-events-none opacity-60'
        )}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => inputRef.current?.click()}
      >
        <Icon className="mb-3 h-10 w-10 text-muted-foreground" />
        {selectedFile ? (
          <div className="text-center">
            <p className="font-medium text-sm">{selectedFile.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(selectedFile.size)}</p>
          </div>
        ) : (
          <div className="text-center">
            <p className="text-sm font-medium">Glissez-déposez un fichier ici</p>
            <p className="text-xs text-muted-foreground mt-1">ou cliquez pour parcourir</p>
            {maxSizeMB && (
              <p className="text-xs text-muted-foreground mt-1">Max {maxSizeMB} Mo</p>
            )}
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
          }}
        />
      </div>

      {error && <p className="text-sm text-destructive">{error}</p>}

      {selectedFile && !uploading && (
        <div className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
          <span className="truncate max-w-[200px]">{selectedFile.name}</span>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); setSelectedFile(null); }}
            className="ml-2 text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {selectedFile && (
        <button
          type="button"
          disabled={uploading}
          onClick={() => onUpload(selectedFile)}
          className={cn(
            'w-full rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-opacity',
            uploading ? 'opacity-60 cursor-not-allowed' : 'hover:opacity-90'
          )}
        >
          {uploading ? 'Téléversement en cours...' : 'Téléverser'}
        </button>
      )}
    </div>
  );
}
