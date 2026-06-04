'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
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

type NewTimekeepingFormValues = z.infer<typeof formSchema>;

type NewTimekeepingFormProps = {
  users: any[];
  translations: {
    employee: string;
    timeIn: string;
    timeOut: string;
    verified: string;
    createTimekeeping: string;
  };
};

export function NewTimekeepingForm({ users, translations }: NewTimekeepingFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const form = useForm<NewTimekeepingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeID: '',
      date: today,
      timeIn: '08:00',
      timeOut: '',
      verified: false,
    },
  });

  const onSubmit = async (data: NewTimekeepingFormValues) => {
    setIsLoading(true);
    try {
      const timeIn = new Date(`${data.date}T${data.timeIn}:00`);
      const timeOut = data.timeOut ? new Date(`${data.date}T${data.timeOut}:00`) : null;

      await axios.post('/api/timekeeping', {
        employeeID: data.employeeID,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut?.toISOString() ?? null,
        verified: data.verified,
      });
      toast({ title: 'Succès', description: 'Pointage enregistré avec succès.' });
      form.reset({ employeeID: '', date: today, timeIn: '08:00', timeOut: '', verified: false });
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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 px-1 py-2">

        {/* Employé */}
        <FormField control={form.control} name="employeeID" render={({ field }) => (
          <FormItem>
            <FormLabel>{translations.employee} *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
              </FormControl>
              <SelectContent className="max-h-72 overflow-y-auto">
                {users.map((user: any) => (
                  <SelectItem key={user.id} value={user.id}>
                    {user.name}
                  </SelectItem>
                ))}
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
              <FormLabel>{translations.timeIn} *</FormLabel>
              <FormControl>
                <Input type="time" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="timeOut" render={({ field }) => (
            <FormItem>
              <FormLabel>{translations.timeOut}</FormLabel>
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
              <FormLabel>{translations.verified}</FormLabel>
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
            ? <span className="animate-pulse">Enregistrement...</span>
            : translations.createTimekeeping}
        </button>

      </form>
    </Form>
  );
}
