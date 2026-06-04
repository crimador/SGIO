'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import axios from 'axios';
import { format } from 'date-fns';

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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const formSchema = z.object({
  employeeID: z.string().min(1, 'Veuillez sélectionner un employé'),
  date: z.string().min(1, 'Date requise'),
  timeIn: z.string().min(1, "Heure d'arrivée requise"),
  timeOut: z.string().optional(),
  verified: z.boolean().default(false),
});

type UpdateTimekeepingFormValues = z.infer<typeof formSchema>;

type UpdateTimekeepingFormProps = {
  initialData: any;
  setOpen: (open: boolean) => void;
};

export function UpdateTimekeepingForm({ initialData, setOpen }: UpdateTimekeepingFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const initIn = initialData.timeIn ? new Date(initialData.timeIn) : new Date();
  const initOut = initialData.timeOut ? new Date(initialData.timeOut) : null;

  const form = useForm<UpdateTimekeepingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeID: initialData.employeeID || '',
      date: format(initIn, 'yyyy-MM-dd'),
      timeIn: format(initIn, 'HH:mm'),
      timeOut: initOut ? format(initOut, 'HH:mm') : '',
      verified: initialData.verified || false,
    },
  });

  const onSubmit = async (data: UpdateTimekeepingFormValues) => {
    setIsLoading(true);
    try {
      const timeIn = new Date(`${data.date}T${data.timeIn}:00`);
      const timeOut = data.timeOut ? new Date(`${data.date}T${data.timeOut}:00`) : null;

      await axios.put('/api/timekeeping', {
        id: initialData.id,
        employeeID: data.employeeID,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut?.toISOString() ?? null,
        verified: data.verified,
      });
      toast({ title: 'Succès', description: 'Pointage mis à jour avec succès.' });
      setOpen(false);
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-2">

        {/* Employé */}
        <FormField control={form.control} name="employeeID" render={({ field }) => (
          <FormItem>
            <FormLabel>Employé *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value={field.value || initialData.employeeID}>
                  {initialData?.employee?.firstName} {initialData?.employee?.lastName}
                </SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Date */}
        <FormField control={form.control} name="date" render={({ field }) => (
          <FormItem>
            <FormLabel>Date *</FormLabel>
            <FormControl>
              <Input type="date" disabled={isLoading} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Heures arrivée / départ */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="timeIn" render={({ field }) => (
            <FormItem>
              <FormLabel>Heure d&apos;arrivée *</FormLabel>
              <FormControl>
                <Input type="time" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="timeOut" render={({ field }) => (
            <FormItem>
              <FormLabel>Heure de départ</FormLabel>
              <FormControl>
                <Input type="time" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Vérifié */}
        <FormField control={form.control} name="verified" render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox checked={field.value} onCheckedChange={field.onChange} />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Vérifié</FormLabel>
            </div>
          </FormItem>
        )} />

        <button
          disabled={isLoading}
          type="submit"
          className="flex w-full h-9 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading
            ? <span className="animate-pulse">Mise à jour...</span>
            : 'Mettre à jour le pointage'}
        </button>

      </form>
    </Form>
  );
}
