'use client';

import { useState } from 'react';
import axios from 'axios';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';
import { MessageCircle, Send, ChevronDown, ChevronUp } from 'lucide-react';

type Comment = {
  id: string;
  comment: string;
  createdAt: string;
  employee: { firstName: string; lastName: string } | null;
};

type Props = {
  teamId: string;
  taskId: string;
  initialComments: Comment[];
};

const TeamTaskComments = ({ teamId, taskId, initialComments }: Props) => {
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);

  const sendComment = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      const { data } = await axios.post(
        `/api/projects/teams/${teamId}/tasks/${taskId}/comments`,
        { comment: text }
      );
      setComments((prev) => [...prev, data]);
      setText('');
    } catch (err: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: err?.response?.data ?? 'Impossible d\'ajouter le commentaire.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2">
      <button
        type="button"
        className="flex h-7 items-center gap-1 rounded-md px-2 text-xs text-gray-400 transition-colors hover:bg-[#FF7E00]/[0.06]"
        onClick={() => setOpen((v) => !v)}
      >
        <MessageCircle className="h-3.5 w-3.5" />
        {comments.length > 0 ? `${comments.length} commentaire${comments.length > 1 ? 's' : ''}` : 'Commenter'}
        {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
      </button>

      {open && (
        <div className="mt-2 space-y-2 rounded-md border bg-gray-50/50 p-3">
          {comments.length === 0 ? (
            <p className="text-xs text-gray-400">Aucun commentaire.</p>
          ) : (
            <div className="space-y-2">
              {comments.map((c) => (
                <div key={c.id} className="text-sm">
                  <span className="font-medium">
                    {c.employee ? `${c.employee.firstName} ${c.employee.lastName}` : 'Utilisateur'}
                  </span>
                  <span className="ml-2 text-xs text-gray-400">
                    {new Date(c.createdAt).toLocaleString('fr-FR', {
                      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
                    })}
                  </span>
                  <p className="mt-0.5 text-gray-400">{c.comment}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2 pt-1">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}
              placeholder="Votre commentaire..."
              rows={2}
              className="flex-1 resize-none text-sm"
            />
            <button
              type="button"
              onClick={sendComment}
              disabled={!text.trim() || loading}
              className="flex h-9 w-9 items-center justify-center self-end rounded-lg text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              {loading ? <Icons.spinner className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamTaskComments;
