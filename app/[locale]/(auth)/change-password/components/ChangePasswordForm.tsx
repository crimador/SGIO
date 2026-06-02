'use client';

import { useState } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirm:  z.string().min(8, 'Minimum 8 caractères'),
}).refine(d => d.password === d.confirm, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirm'],
});

type FormValues = z.infer<typeof schema>;

export default function ChangePasswordForm({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { password: '', confirm: '' },
  });

  async function onSubmit(values: FormValues) {
    if (!userId) return;
    setLoading(true);
    try {
      await axios.patch(`/api/user/${userId}/change-password`, {
        password: values.password,
      });
      toast({
        title: 'Mot de passe mis à jour',
        description: 'Reconnectez-vous avec votre nouveau mot de passe.',
      });
      await signOut({ redirect: false });
      router.push('/sign-in');
    } catch (e: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: e?.response?.data || 'Une erreur est survenue.',
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#FF7E00]/10">
            <KeyRound className="h-6 w-6 text-[#FF7E00]" />
          </div>
          <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>
            Changement de mot de passe requis
          </p>
          <p className="text-sm text-gray-400">
            Pour des raisons de sécurité, vous devez définir un nouveau mot de passe avant de continuer.
          </p>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nouveau mot de passe</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={show ? 'text' : 'password'}
                          placeholder="Minimum 8 caractères"
                          disabled={loading}
                          {...field}
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-2.5 text-gray-400"
                          onClick={() => setShow(s => !s)}
                        >
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmer le mot de passe</FormLabel>
                    <FormControl>
                      <Input
                        type={show ? 'text' : 'password'}
                        placeholder="Répétez le mot de passe"
                        disabled={loading}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <button
                type="submit"
                disabled={loading}
                className="flex w-full h-9 items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                {loading ? 'Enregistrement…' : 'Définir mon mot de passe'}
              </button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
