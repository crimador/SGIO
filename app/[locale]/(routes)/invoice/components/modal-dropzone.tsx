'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

import UploadFileModal from '@/components/modals/upload-file-modal';

import { FileInput } from './FileInput';

type Props = {
  buttonLabel: string;
};

const ModalDropzone = ({ buttonLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  return (
    <div>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
      >
        {buttonLabel}
      </button>
      <UploadFileModal
        isOpen={open}
        onClose={() => {
          router.refresh();
          setOpen(false);
        }}
      >
        <FileInput onClose={() => setOpen(false)} />
      </UploadFileModal>
    </div>
  );
};

export default ModalDropzone;
