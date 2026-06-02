'use client';

import { z } from 'zod';
import axios, { AxiosError } from 'axios';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

type Props = {
  industries: any[];
  users: any[];
  onFinish: () => void;
};

const formSchema = z.object({
  name: z.string().min(2).max(80),
  office_phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),
  nif: z.string().max(20).optional(),
  rccm: z.string().max(50).optional(),
  regimeFiscal: z.string().optional(),
  centreImpots: z.string().max(100).optional(),
  dateCloture: z.string().optional(),
  billing_street: z.string().optional(),
  billing_city: z.string().min(2).max(50),
  billing_country: z.string().optional(),
  description: z.string().max(1000).optional(),
  annual_revenue: z.string().optional(),
  industry: z.string().optional(),
  assigned_to: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewAccountForm({ industries, users }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      billing_country: 'Togo',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/crm/account', data);
      toast({ title: 'Succès', description: 'Client créé avec succès.' });
      form.reset();
      router.refresh();
    } catch (error) {
      if (error instanceof AxiosError) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Une erreur est survenue. Veuillez réessayer.',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-10">
        <div className="w-[800px] space-y-6 text-sm">

          {/* Informations générales */}
          <div>
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Informations générales
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Nom du client <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Cabinet ABC SARL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="office_phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Téléphone</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="+228 90 00 00 00" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="contact@entreprise.tg" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Informations légales */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Informations légales (Togo)
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="nif"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIF</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="P0012345678" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="rccm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>RCCM</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="TG-LFW-01-2024-B12-00123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="regimeFiscal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Régime fiscal</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un régime" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="reel_tva">Réel avec TVA</SelectItem>
                        <SelectItem value="reel_sans_tva">Réel sans TVA</SelectItem>
                        <SelectItem value="tpu">TPU</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="centreImpots"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Centre des impôts</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Lomé 1, Kara..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="dateCloture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date de clôture d&apos;exercice</FormLabel>
                    <FormControl>
                      <Input type="date" disabled={isLoading} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Adresse */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Adresse
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="billing_street"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Rue / Quartier</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Bd du 13 Janvier, Adidogomé..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billing_city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ville <span className="text-destructive">*</span></FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Lomé" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="billing_country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pays</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Togo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Autres informations */}
          <div className="border-t pt-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
              Autres informations
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="annual_revenue"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chiffre d&apos;affaires annuel (FCFA)</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="50 000 000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Secteur d&apos;activité</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-56 overflow-y-auto">
                        {industries.map((industry) => (
                          <SelectItem key={industry.id} value={industry.id}>
                            {industry.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable du dossier</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assigner à un collaborateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-56 overflow-y-auto">
                        {users.map((user) => (
                          <SelectItem key={user.id} value={user.id}>
                            {user.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="col-span-2">
                    <FormLabel>Notes internes</FormLabel>
                    <FormControl>
                      <Textarea disabled={isLoading} placeholder="Informations complémentaires..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          <div className="pb-5">
            <button
              disabled={isLoading}
              type="submit"
              className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              Créer le client
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
