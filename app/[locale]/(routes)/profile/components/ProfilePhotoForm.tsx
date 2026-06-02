'use client';

import Image from 'next/image';
import type { Users } from '@prisma/client';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/use-toast';
import useAvatarStore from '@/store/useAvatarStore';

interface ProfileFormProps {
  data: Users;
}

export function ProfilePhotoForm({ data }: ProfileFormProps) {
  const [avatar, setAvatar] = useState(data.avatar);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { toast } = useToast();
  const router = useRouter();
  const setAvatarStore = useAvatarStore((state) => state.setAvatar);

  useEffect(() => {
    setAvatar(data.avatar);
  }, [data.avatar]);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
      const form = new FormData();
      form.append('file', file);

      const uploadRes = await fetch('/api/profile/upload-avatar', {
        method: 'POST',
        body: form,
      });

      if (!uploadRes.ok) {
        const msg = await uploadRes.text();
        throw new Error(msg);
      }

      const { url } = await uploadRes.json();

      await fetch('/api/profile/updatePhotoProfile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: url }),
      });

      setAvatar(url);
      setAvatarStore(url);

      toast({
        title: 'Photo de profil mise à jour.',
        description: 'Votre photo de profil a été mise à jour.',
        duration: 5000,
      });

      router.refresh();
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur lors de la mise à jour.',
        description: e?.message ?? 'Une erreur est survenue.',
        duration: 5000,
      });
    } finally {
      setIsLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="flex items-center space-x-5 p-5">
      <Image
        src={avatar || '/images/nouser.png'}
        alt="avatar"
        width={100}
        height={100}
        className="rounded-full object-cover"
      />
      <div className="flex flex-col gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          className="hidden"
          onChange={handleFileChange}
          disabled={isLoading}
        />
        <button
          type="button"
          disabled={isLoading}
          onClick={() => inputRef.current?.click()}
          className="flex h-8 items-center gap-1.5 rounded-md border px-3 text-sm font-medium transition-colors hover:bg-gray-50 disabled:pointer-events-none disabled:opacity-50"
          style={{ color: '#1E1D3D' }}
        >
          {isLoading ? 'Envoi en cours...' : 'Changer la photo'}
        </button>
        <p className="text-xs text-gray-400">JPG, PNG, WebP ou GIF — max 4 Mo</p>
      </div>
    </div>
  );
}
