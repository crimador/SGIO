'use client';

import { useEffect, useRef, useState } from 'react';
import axios from 'axios';

import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { Icons } from '@/components/ui/icons';
import { MessageSquare, Send } from 'lucide-react';

type Message = {
  id: string;
  message: string;
  createdAt: string;
  from: { id: string; firstName: string; lastName: string; photo: string | null } | null;
};

type Props = { team: any; session: any };

const TeamMessagesTab = ({ team, session }: Props) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>(team.TeamMessage ?? []);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const { data } = await axios.get(`/api/projects/teams/${team.id}/messages`);
        setMessages(data);
      } catch {
        // silencieux
      }
    }, 10000);
    return () => clearInterval(interval);
  }, [team.id]);

  const sendMessage = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`/api/projects/teams/${team.id}/messages`, { message: text });
      setMessages((prev) => [...prev, data]);
      setText('');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err?.response?.data ?? 'Impossible d\'envoyer le message.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <div className="flex flex-col gap-4">
      {messages.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <MessageSquare className="mb-3 h-8 w-8 text-gray-400" />
          <p className="text-gray-400">Aucun message pour cette équipe.</p>
          <p className="mt-1 text-sm text-gray-400">Soyez le premier à écrire un message.</p>
        </div>
      ) : (
        <div className="space-y-3 rounded-lg border p-4 max-h-[480px] overflow-y-auto">
          {messages.map((msg) => {
            const isMe = msg.from?.id === session?.user?.employeeId || false;
            return (
              <div key={msg.id} className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                <div
                  className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: '#1E1D3D' }}
                >
                  {msg.from?.firstName?.[0]}{msg.from?.lastName?.[0]}
                </div>
                <div className={`max-w-[70%] flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                  <p className="mb-1 text-xs text-gray-400">
                    {msg.from?.firstName} {msg.from?.lastName} ·{' '}
                    {new Date(msg.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                  <div
                    className={`rounded-lg px-3 py-2 text-sm ${isMe ? 'text-white' : 'bg-gray-100 text-gray-700'}`}
                    style={isMe ? { background: '#1E1D3D' } : undefined}
                  >
                    {msg.message}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
      )}

      <div className="flex gap-2">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Écrire un message... (Entrée pour envoyer)"
          rows={2}
          className="flex-1 resize-none"
        />
        <button
          type="button"
          onClick={sendMessage}
          disabled={!text.trim() || loading}
          className="flex h-9 w-9 items-center justify-center self-end rounded-lg text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {loading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </button>
      </div>
      <p className="text-xs text-gray-400">
        Actualisation automatique toutes les 10 secondes · Profil employé requis pour envoyer.
      </p>
    </div>
  );
};

export default TeamMessagesTab;
