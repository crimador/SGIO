'use client';

import type { FC } from 'react';
import { useState } from 'react';

import { getUserAiTasks } from '@/actions/cron/get-user-ai-tasks';

import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import type { Session } from 'next-auth';

const AiAssistant: FC<{ session: Session }> = ({ session }) => {
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  const handleAiAssistant = async () => {
    setLoading(true);
    try {
      await getUserAiTasks(session);
      toast({
        title: 'Rapport envoyé',
        description: 'Le rapport IA a été envoyé dans votre boîte mail.',
      });
    } catch (error) {
      console.log(error, 'error from AI Assistant');
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Une erreur est survenue, veuillez réessayer.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleAiAssistant}
      disabled={loading}
      className="flex h-9 items-center gap-1.5 rounded-lg border px-3 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06] disabled:opacity-60"
      style={{ color: '#1E1D3D' }}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          Génération... <Icons.spinner className="animate-spin" />
        </span>
      ) : (
        'Rapport IA'
      )}
    </button>
  );
};

export default AiAssistant;
