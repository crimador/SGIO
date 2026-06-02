'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import axios from 'axios';

import { useToast } from '@/components/ui/use-toast';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

type Employee = {
  id: string; firstName: string; lastName: string;
  salary: number; position?: string | null;
};

type Props = { employees: Employee[] };

const formSchema = z.object({
  employeeID: z.string().min(1, 'Veuillez sélectionner un employé'),
  period:     z.string().min(7, 'Période requise'),
  baseSalary: z.coerce.number().min(0),
  bonuses:    z.coerce.number().min(0).default(0),
  deductions: z.coerce.number().min(0).default(0),
  notes:      z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

const MONTHS = [
  { value: '01', label: 'Janvier' },  { value: '02', label: 'Février' },
  { value: '03', label: 'Mars' },     { value: '04', label: 'Avril' },
  { value: '05', label: 'Mai' },      { value: '06', label: 'Juin' },
  { value: '07', label: 'Juillet' },  { value: '08', label: 'Août' },
  { value: '09', label: 'Septembre' },{ value: '10', label: 'Octobre' },
  { value: '11', label: 'Novembre' }, { value: '12', label: 'Décembre' },
];

export function NewPayslipForm({ employees }: Props) {
  const router    = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const now          = new Date();
  const currentMonth = format(now, 'MM');
  const currentYear  = format(now, 'yyyy');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeID: '', period: `${currentYear}-${currentMonth}`,
      baseSalary: 0, bonuses: 0, deductions: 0, notes: '',
    },
  });

  const watchEmployeeID = form.watch('employeeID');
  const watchBase       = form.watch('baseSalary');
  const watchBonuses    = form.watch('bonuses');
  const watchDeductions = form.watch('deductions');

  useEffect(() => {
    if (watchEmployeeID) {
      const emp = employees.find((e) => e.id === watchEmployeeID);
      if (emp?.salary) form.setValue('baseSalary', emp.salary);
    }
  }, [watchEmployeeID, employees, form]);

  const base       = Number(watchBase       || 0);
  const bonuses    = Number(watchBonuses    || 0);
  const deductions = Number(watchDeductions || 0);
  const netSalary  = base + bonuses - deductions;

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/payslip', data);
      toast({ title: 'Bulletin créé avec succès' });
      form.reset({
        employeeID: '', period: `${currentYear}-${currentMonth}`,
        baseSalary: 0, bonuses: 0, deductions: 0, notes: '',
      });
      router.refresh();
    } catch (error: any) {
      toast({
        variant: 'destructive', title: 'Erreur',
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
            <FormLabel>Employé *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un employé" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {employees.map((emp) => (
                  <SelectItem key={emp.id} value={emp.id}>
                    {emp.firstName} {emp.lastName}{emp.position ? ` — ${emp.position}` : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Période */}
        <FormField control={form.control} name="period" render={({ field }) => (
          <FormItem>
            <FormLabel>Période *</FormLabel>
            <div className="grid grid-cols-2 gap-3">
              <Select
                disabled={isLoading}
                value={field.value?.split('-')[1] ?? currentMonth}
                onValueChange={(m) => {
                  const y = field.value?.split('-')[0] ?? currentYear;
                  field.onChange(`${y}-${m}`);
                }}
              >
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Mois" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  {MONTHS.map((m) => (
                    <SelectItem key={m.value} value={m.value}>{m.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number" disabled={isLoading} placeholder="Année"
                min="2020" max="2099"
                value={field.value?.split('-')[0] ?? currentYear}
                onChange={(e) => {
                  const m = field.value?.split('-')[1] ?? currentMonth;
                  field.onChange(`${e.target.value}-${m}`);
                }}
              />
            </div>
            <FormMessage />
          </FormItem>
        )} />

        {/* Salaire de base */}
        <FormField control={form.control} name="baseSalary" render={({ field }) => (
          <FormItem>
            <FormLabel>Salaire de base (FCFA) *</FormLabel>
            <FormControl>
              <Input type="number" min="0" step="500" disabled={isLoading} {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        {/* Primes / Déductions */}
        <div className="grid grid-cols-2 gap-4">
          <FormField control={form.control} name="bonuses" render={({ field }) => (
            <FormItem>
              <FormLabel>Primes / Indemnités (FCFA)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="500" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
          <FormField control={form.control} name="deductions" render={({ field }) => (
            <FormItem>
              <FormLabel>Retenues / Avances (FCFA)</FormLabel>
              <FormControl>
                <Input type="number" min="0" step="500" disabled={isLoading} {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        </div>

        {/* Récapitulatif Net */}
        <div className="rounded-md border bg-muted/30 p-4 space-y-2">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Salaire de base</span>
            <span>{base.toLocaleString('fr-FR')} FCFA</span>
          </div>
          {bonuses > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>+ Primes / Indemnités</span>
              <span>+ {bonuses.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
          {deductions > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>- Retenues / Avances</span>
              <span>- {deductions.toLocaleString('fr-FR')} FCFA</span>
            </div>
          )}
          <div className="border-t pt-2 flex justify-between">
            <p className="text-sm font-semibold">Net à payer</p>
            <p className="text-xl font-bold">{netSalary.toLocaleString('fr-FR')} FCFA</p>
          </div>
        </div>

        {/* Notes */}
        <FormField control={form.control} name="notes" render={({ field }) => (
          <FormItem>
            <FormLabel>Notes (optionnel)</FormLabel>
            <FormControl>
              <Textarea disabled={isLoading} placeholder="Remarques sur ce bulletin..." {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )} />

        <button
          disabled={isLoading}
          type="submit"
          className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
        >
          {isLoading ? <span className="animate-pulse">Création en cours...</span> : 'Créer le bulletin'}
        </button>

      </form>
    </Form>
  );
}
