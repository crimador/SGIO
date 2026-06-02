'use client';

import { Icons } from '@/components/ui/icons';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

import { useState } from 'react';

type Props = {
  onClose: () => void;
};

export function FileInput({ onClose }: Props) {
  const [file, setFile] = useState<File>();
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  const { toast } = useToast();

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (!file) return;

    try {
      const data = new FormData();
      data.set('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: data,
      });
      // handle the error
      if (!res.ok) throw new Error(await res.text());
    } catch (e: any) {
      // Handle errors here
      console.error(e);
    }
    router.refresh();
    toast({
      title: 'Success',
      description: 'Invoice uploaded successfully',
    });
    setIsLoading(false);
    onClose();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col space-y-5">
      <Input
        type="file"
        name="file"
        //allow only pdf files and images files
        accept=".pdf,.png,.jpg,.jpeg"
        onChange={(e) => setFile(e.target.files?.[0])}
      />
      {file ? <span>{file.name}</span> : null}
      <button
        type="submit"
        className="flex h-9 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
        style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
      >
        {isLoading ? (
          <div className="flex space-x-5">
            <Icons.spinner className="animate-spin" />
            <span className="">Uploading...</span>
          </div>
        ) : (
          <span>Upload</span>
        )}
      </button>
    </form>
  );
}
