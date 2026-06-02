'use client';

import React from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import { Input } from '@/components/ui/input';
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
import { Textarea } from '@/components/ui/textarea';
import fetcher from '@/lib/fetcher';
import useSWR from 'swr';
import SuspenseLoading from '@/components/loadings/suspense';

interface UpdateAccountFormProps {
  initialData: any;
  open: (value: boolean) => void;
}

const formSchema = z.object({
  id: z.string(),
  name: z.string().min(2).max(80),
  office_phone: z.string().nullable().optional(),
  email: z.string().email().nullable().optional().or(z.literal('')),
  nif: z.string().max(20).nullable().optional(),
  rccm: z.string().max(50).nullable().optional(),
  regimeFiscal: z.string().nullable().optional(),
  centreImpots: z.string().max(100).nullable().optional(),
  dateCloture: z.string().nullable().optional(),
  billing_street: z.string().nullable().optional(),
  billing_city: z.string().min(2).max(50),
  billing_country: z.string().nullable().optional(),
  description: z.string().max(1000).nullable().optional(),
  assigned_to: z.string().nullable().optional(),
  status: z.string().nullable().optional(),
  annual_revenue: z.string().nullable().optional(),
  industry: z.string().nullable().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function UpdateAccountForm({ initialData, open }: UpdateAccountFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const { data: industries, isLoading: isLoadingIndustries } = useSWR('/api/crm/industries', fetcher);
  const { data: users, isLoading: isLoadingUsers } = useSWR('/api/user', fetcher);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          dateCloture: initialData.dateCloture
            ? new Date(initialData.dateCloture).toISOString().split('T')[0]
            : '',
          billing_country: initialData.billing_country ?? 'Togo',
        }
      : {
          id: '',
          name: '',
          office_phone: '',
          email: '',
          nif: '',
          rccm: '',
          regimeFiscal: '',
          centreImpots: '',
          dateCloture: '',
          billing_street: '',
          billing_city: '',
          billing_country: 'Togo',
          description: '',
          assigned_to: '',
          status: '',
          annual_revenue: '',
          industry: '',
        },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.put('/api/crm/account', data);
      toast({ title: 'Succès', description: 'Client mis à jour avec succès.' });
      router.refresh();
      open(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.response?.data ?? 'Une erreur est survenue.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoadingIndustries || isLoadingUsers) return <SuspenseLoading />;
  if (!industries || !users || !initialData)
    return <div>Impossible de charger les données du formulaire.</div>;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full w-full px-10">
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
                      <Input
                        disabled={isLoading}
                        placeholder="+228 90 00 00 00"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
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
                      <Input
                        disabled={isLoading}
                        placeholder="contact@entreprise.tg"
                        value={field.value ?? ''}
                        onChange={field.onChange}
                      />
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
                      <Input disabled={isLoading} placeholder="P0012345678" value={field.value ?? ''} onChange={field.onChange} />
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
                      <Input disabled={isLoading} placeholder="TG-LFW-01-2024-B12-00123" value={field.value ?? ''} onChange={field.onChange} />
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
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
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
                      <Input disabled={isLoading} placeholder="Lomé 1, Kara..." value={field.value ?? ''} onChange={field.onChange} />
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
                      <Input type="date" disabled={isLoading} value={field.value ?? ''} onChange={field.onChange} />
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
                      <Input disabled={isLoading} placeholder="Bd du 13 Janvier, Adidogomé..." value={field.value ?? ''} onChange={field.onChange} />
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
                      <Input disabled={isLoading} placeholder="Togo" value={field.value ?? 'Togo'} onChange={field.onChange} />
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
                      <Input disabled={isLoading} placeholder="50 000 000" value={field.value ?? ''} onChange={field.onChange} />
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
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un secteur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-56 overflow-y-auto">
                        {industries.map((industry: any) => (
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
                    <Select onValueChange={field.onChange} value={field.value ?? ''}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Assigner à un collaborateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-56 overflow-y-auto">
                        {users.map((user: any) => (
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
                      <Textarea disabled={isLoading} placeholder="Informations complémentaires..." value={field.value ?? ''} onChange={field.onChange} />
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
              Mettre à jour
            </button>
          </div>
        </div>
      </form>
    </Form>
  );
}
