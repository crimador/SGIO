'use client';

import { useChat } from 'ai/react';
import { useEffect, useRef } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Send, Square, RotateCcw, Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function AiHelpCenter() {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { messages, input, setInput, stop, isLoading, handleInputChange, handleSubmit, setMessages } =
    useChat({
      api: '/api/openai/completion',
      onFinish: () => {},
      onError: () => {
        toast.error('Erreur : impossible de contacter l\'assistant');
      },
    });

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (!isLoading && input.trim()) handleSubmit(e as any);
    }
  };

  return (
    <div className="flex h-[calc(100vh-180px)] flex-col">

      {/* Zone messages */}
      <div className="flex-1 overflow-y-auto rounded-lg border bg-gray-50 p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center gap-3 text-gray-400">
            <Bot className="h-12 w-12 opacity-30" />
            <p className="text-sm">Posez votre première question à l&apos;assistant</p>
            <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
              {[
                'Quelles sont mes tâches en retard ?',
                'Quelles factures OHADA sont impayées ?',
                'Y a-t-il des demandes RH en attente ?',
                'Quel est le solde de ma trésorerie ?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => {
                    setInput(suggestion);
                  }}
                  className="rounded-lg border bg-background px-3 py-2 text-left text-xs hover:bg-gray-50"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={cn('flex gap-3', m.role === 'user' ? 'flex-row-reverse' : 'flex-row')}
              >
                {/* Avatar */}
                <div
                  className={cn(
                    'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                    m.role === 'user' ? 'text-white' : 'bg-gray-100'
                  )}
                  style={m.role === 'user' ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' } : undefined}
                >
                  {m.role === 'user' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>

                {/* Bulle */}
                <div
                  className={cn(
                    'max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap',
                    m.role === 'user'
                      ? 'rounded-tr-sm text-white'
                      : 'rounded-tl-sm bg-background border shadow-sm'
                  )}
                  style={m.role === 'user' ? { background: 'linear-gradient(135deg, #FF7E00, #e8950a)' } : undefined}
                >
                  {m.content}
                </div>
              </div>
            ))}

            {/* Indicateur de frappe */}
            {isLoading && (
              <div className="flex gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                  <Bot className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-1 rounded-2xl rounded-tl-sm border bg-background px-4 py-3 shadow-sm">
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:0ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:150ms]" />
                  <span className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:300ms]" />
                </div>
              </div>
            )}

            <div ref={bottomRef} />
          </div>
        )}
      </div>

      {/* Zone saisie */}
      <div className="mt-3 flex flex-col gap-2">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            className="min-h-[52px] max-h-[140px] flex-1 resize-none"
            value={input}
            placeholder="Écrivez votre message… (Entrée pour envoyer, Maj+Entrée pour nouvelle ligne)"
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={isLoading}
            rows={1}
          />
          <div className="flex flex-col gap-2">
            {isLoading ? (
              <button
                type="button"
                onClick={stop}
                className="flex h-full aspect-square items-center justify-center rounded-lg border border-red-200 bg-red-50 transition-colors hover:bg-red-100"
                style={{ color: '#dc2626' }}
              >
                <Square className="h-4 w-4 fill-current" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={!input.trim()}
                className="flex h-full aspect-square items-center justify-center rounded-lg text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <Send className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={() => setMessages([])}
            className="self-center flex items-center gap-1 rounded-md px-3 py-1 text-xs font-medium transition-colors hover:bg-gray-100"
            style={{ color: '#1E1D3D' }}
          >
            <RotateCcw className="mr-1 h-3 w-3" />
            Nouvelle conversation
          </button>
        )}
      </div>
    </div>
  );
}
