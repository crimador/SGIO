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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
};

type Props = {
  employees: Employee[];
  translations: {
    employee: string;
    timeIn: string;
    timeOut: string;
    createTimekeeping: string;
  };
};

const formSchema = z.object({
  employeeID: z.string().min(1, 'Veuillez sélectionner un employé'),
  date: z.string().min(1, 'Date requise'),
  timeIn: z.string().min(1, "Heure d'arrivée requise"),
  timeOut: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewTimekeepingForm({ employees, translations }: Props) {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeID: '',
      date: today,
      timeIn: '08:00',
      timeOut: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      const timeIn = new Date(`${data.date}T${data.timeIn}:00`);
      const timeOut = data.timeOut ? new Date(`${data.date}T${data.timeOut}:00`) : null;

      await axios.post('/api/timekeeping', {
        employeeID: data.employeeID,
        timeIn: timeIn.toISOString(),
        timeOut: timeOut?.toISOString() ?? null,
      });

      toast({ title: 'Pointage enregistré' });
      form.reset({ employeeID: '', date: today, timeIn: '08:00', timeOut: '' });
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
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}
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
