'use client';

import { toast } from 'sonner';
import { Loader2, Mail } from 'lucide-react';
import type { ElementRef } from 'react';
import React, { useRef, useState } from 'react';

import { sendMailToAll } from '@/actions/admin/send-mail-to-all';

import { FormInput } from '@/components/form/form-input';
import { FormSubmit } from '@/components/form/form-submit';
import { FormTextarea } from '@/components/form/form-textarea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';

import { useAction } from '@/hooks/use-action';

const SendMailToAll = () => {
  const [open, setOpen] = useState(false);

  const { execute, fieldErrors, isLoading } = useAction(sendMailToAll, {
    onSuccess: () => {
      toast.success('Emails envoyés à tous les utilisateurs actifs.');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error);
    },
  });

  const onSendMail = async (formData: FormData) => {
    const title = formData.get('title') as string;
    const message = formData.get('message') as string;
    await execute({ title, message });
  };

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          className="flex h-9 items-center gap-2 rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-[#FF7E00]/[0.06]"
          style={{ color: '#1E1D3D' }}
        >
          <Mail className="h-4 w-4" style={{ color: '#FF7E00' }} />
          Envoyer un message à tous les utilisateurs
        </button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Message groupé</SheetTitle>
        </SheetHeader>
        <div className="mt-4 flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">
            Ce message sera envoyé par email à tous les utilisateurs actifs.
          </p>
          <form action={onSendMail} className="space-y-4">
            <FormInput
              id="title"
              label="Objet du message"
              type="text"
              errors={fieldErrors}
            />
            <FormTextarea
              id="message"
              label="Contenu"
              placeholder="Votre message..."
              required
              errors={fieldErrors}
            />
            <FormSubmit className="w-full">
              {isLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                'Envoyer'
              )}
            </FormSubmit>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default SendMailToAll;
