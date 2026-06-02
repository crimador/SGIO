'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

type NewEmployeeFormProps = {
  translations: {
    firstName: string;
    lastName: string;
    officePhone: string;
    email: string;
    position: string;
    salary: string;
    onBoarding: string;
    pickExpectedCloseDate: string;
    iban: string;
    taxId: string;
    insurance: string;
    address: string;
    createEmployee: string;
  };
};

const formSchema = z.object({
  firstName:   z.string().min(2).max(50),
  lastName:    z.string().min(2).max(50),
  email:       z.string().email(),
  phone:       z.string().optional(),
  position:    z.string().optional(),
  salary:      z.coerce.number().min(0),
  IBAN:        z.string().optional(),
  taxid:       z.string().optional(),
  insurance:   z.string().optional(),
  address:     z.string().optional(),
  onBoarding:  z.date().optional(),
  dateOfBirth: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewEmployeeForm({ translations }: NewEmployeeFormProps) {
  const router    = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { salary: 0 },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/employee', data);
      toast({ title: 'Succès', description: 'Employé créé avec succès.' });
      form.reset();
      router.refresh();
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-6 py-2">

        {/* Prénom / Nom */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.firstName} *</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="Koffi" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.lastName} *</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="Mensah" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Email / Téléphone */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.email} *</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="koffi@example.com" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="phone" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.officePhone}</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="+228 90 00 00 00" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Poste / Salaire */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="position" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.position}</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="Comptable" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="salary" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.salary} (FCFA)</FormLabel>
              <FormControl><Input type="number" min="0" step="1000" disabled={isLoading} placeholder="150000" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Date de naissance / Date d'entrée */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="dateOfBirth" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Date de naissance</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <button
                      type="button"
                      disabled={isLoading}
                      className={cn(
                        'flex h-9 w-full items-center rounded-lg border px-3 text-sm font-normal transition-colors hover:bg-gray-50',
                        !field.value && 'text-gray-400'
                      )}
                    >
                      {field.value ? format(field.value, 'dd/MM/yyyy') : 'JJ/MM/AAAA'}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                    captionLayout="dropdown" fromYear={1950} toYear={new Date().getFullYear() - 18}
                    disabled={(date) => date > new Date() || date < new Date('1950-01-01')} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="onBoarding" render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>{translations.onBoarding}</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <button
                      type="button"
                      disabled={isLoading}
                      className={cn(
                        'flex h-9 w-full items-center rounded-lg border px-3 text-sm font-normal transition-colors hover:bg-gray-50',
                        !field.value && 'text-gray-400'
                      )}
                    >
                      {field.value ? format(field.value, 'dd/MM/yyyy') : translations.pickExpectedCloseDate}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar mode="single" selected={field.value} onSelect={field.onChange}
                    disabled={(date) => date < new Date('1900-01-01')} initialFocus />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* IBAN / NIF */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="IBAN" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.iban}</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="TG53 TG008 0101 0012 3456 7890 45" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="taxid" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.taxId}</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="NIF personnel" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* N° CNSS / Adresse */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="insurance" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.insurance}</FormLabel>
              <FormControl><Input disabled={isLoading} placeholder="N° immatriculation CNSS" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="address" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.address}</FormLabel>
              <FormControl><Textarea disabled={isLoading} placeholder="Adresse de résidence" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        <button
          disabled={isLoading}
          type="submit"
          className="flex h-9 w-full items-center justify-center gap-1.5 rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading ? <span className="animate-pulse">Enregistrement...</span> : translations.createEmployee}
        </button>

      </form>
    </Form>
  );
}
