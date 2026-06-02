'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import axios from 'axios';

import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';

const formSchema = z.object({
  email:    z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type LoginFormValues = z.infer<typeof formSchema>;

export function LoginComponent() {
  const [isLoading, setIsLoading] = useState(false);
  const [show, setShow]     = useState(false);
  const [open, setOpen]     = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const { toast } = useToast();
  const router = useRouter();

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    try {
      const status = await signIn('credentials', {
        redirect: false,
        email: data.email,
        password: data.password,
      });
      if (status?.error) {
        toast({ variant: 'destructive', title: 'Identifiants incorrects', description: 'Vérifiez votre email et mot de passe.' });
      } else {
        router.push('/');
        router.refresh();
      }
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Une erreur est survenue.' });
    } finally {
      setIsLoading(false);
    }
  }

  async function onPasswordReset(email: string) {
    setIsLoading(true);
    try {
      await axios.post('/api/user/passwordReset', { email });
      toast({ title: 'Email envoyé', description: 'Vérifiez votre boîte mail.' });
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible d\'envoyer l\'email de réinitialisation.' });
    } finally {
      setIsLoading(false);
      setOpen(false);
    }
  }

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>
                  Adresse email
                </FormLabel>
                <FormControl>
                  <Input
                    disabled={isLoading}
                    placeholder="vous@kekeligroup.com"
                    type="email"
                    className="h-11 border-gray-200 bg-white text-sm transition-all duration-200
                               focus:border-[#FF7E00] focus-visible:ring-1 focus-visible:ring-[#FF7E00]
                               focus-visible:ring-offset-0 placeholder:text-gray-400"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Mot de passe */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>
                    Mot de passe
                  </FormLabel>
                  <Dialog open={open} onOpenChange={setOpen}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-xs font-medium text-gray-400 transition-colors hover:text-[#FF7E00]"
                      >
                        Mot de passe oublié ?
                      </button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Réinitialisation du mot de passe</DialogTitle>
                        <DialogDescription>
                          Entrez votre email et nous vous enverrons un lien de réinitialisation.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="flex gap-3 pt-2">
                        <Input
                          type="email"
                          placeholder="vous@kekeligroup.com"
                          onChange={e => setResetEmail(e.target.value)}
                        />
                        <button
                          type="button"
                          disabled={!resetEmail || isLoading}
                          onClick={() => onPasswordReset(resetEmail)}
                          className="shrink-0 flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60 hover:opacity-90"
                          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                        >
                          Envoyer
                        </button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
                <FormControl>
                  <div className="relative">
                    <Input
                      disabled={isLoading}
                      placeholder="••••••••"
                      type={show ? 'text' : 'password'}
                      className="h-11 border-gray-200 bg-white pr-10 text-sm transition-all duration-200
                                 focus:border-[#FF7E00] focus-visible:ring-1 focus-visible:ring-[#FF7E00]
                                 focus-visible:ring-offset-0 placeholder:text-gray-400"
                      {...field}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors hover:text-[#FF7E00]"
                      onClick={() => setShow(s => !s)}
                      aria-label={show ? 'Masquer' : 'Afficher'}
                    >
                      {show
                        ? <EyeOff className="h-4 w-4" />
                        : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-xs" />
              </FormItem>
            )}
          />

          {/* Bouton submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white
                       transition-all duration-200 active:scale-[0.98] disabled:opacity-60"
            style={{ background: isLoading ? '#cc6500' : 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            {isLoading
              ? <><Loader2 className="h-4 w-4 animate-spin" /> Connexion en cours…</>
              : 'Se connecter'}
          </button>

        </form>
      </Form>
    </div>
  );
}
