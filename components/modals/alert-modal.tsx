'use client';

import { useEffect, useState } from 'react';

import Modal from '@/components/ui/modal';

import { Icons } from '../ui/icons';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  loading: boolean;
}

const AlertModal = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
}: AlertModalProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <Modal
      title="Are you sure?"
      description="This action cannot be undone."
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="flex w-full items-center justify-end space-x-2 pt-6">
        <button
          disabled={loading}
          onClick={onClose}
          className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-gray-50 disabled:opacity-60"
          style={{ color: '#1E1D3D' }}
        >
          Cancel
        </button>
        <button
          disabled={loading}
          onClick={onConfirm}
          className="flex h-9 items-center rounded-lg border border-red-200 px-4 text-sm font-medium transition-colors hover:bg-red-50 disabled:opacity-60"
          style={{ color: '#dc2626' }}
        >
          {loading ? <Icons.spinner className="animate-spin" /> : 'Continue'}
        </button>
      </div>
    </Modal>
  );
};

export default AlertModal;
