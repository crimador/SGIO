'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Users } from 'lucide-react';

const formSchema = z.object({
  name: z.string().min(2, 'Minimum 2 caractères').max(100),
});
type FormValues = z.infer<typeof formSchema>;

const NewTeamDialog = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<FormValues>({ resolver: zodResolver(formSchema) });

  const onSubmit = async (data: FormValues) => {
    setLoading(true);
    try {
      await axios.post('/api/projects/teams', data);
      toast({ title: `Équipe "${data.name}" créée.` });
      setOpen(false);
      router.refresh();
    } catch {
      toast({ variant: 'destructive', title: 'Erreur', description: 'Impossible de créer l\'équipe.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          <Users className="h-4 w-4" />
          Nouvelle équipe
        </button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nouvelle équipe</DialogTitle>
          <DialogDescription>Donnez un nom à votre équipe.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nom de l&apos;équipe</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex : Équipe développement" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <button
                type="button"
                className="flex h-9 items-center rounded-lg border px-4 text-sm font-medium transition-colors hover:bg-red-50"
                style={{ color: '#dc2626' }}
                onClick={() => setOpen(false)}
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex h-9 items-center rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                {loading ? 'Création...' : 'Créer'}
              </button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default NewTeamDialog;
