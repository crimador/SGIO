'use client';

import { useState } from 'react';
import { z } from 'zod';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { countWorkingDays } from '@/lib/working-days';
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
import { LEGAL_DAYS_BY_SUBTYPE } from '@/lib/leave-balance';

type Employee = { id: string; firstName: string; lastName: string };

type Props = { employees: Employee[] };

const REQUEST_TYPES = [
  { value: 'Vacation',  label: 'Congé annuel' },
  { value: 'Leave',     label: 'Congé exceptionnel' },
  { value: 'Sick',      label: 'Arrêt maladie' },
  { value: 'Maternity', label: 'Congé de maternité' },
  { value: 'Training',  label: 'Formation' },
  { value: 'Raise',     label: 'Demande d\'augmentation' },
  { value: 'Documents', label: 'Demande de documents' },
  { value: 'Other',     label: 'Autre' },
];

const formSchema = z.object({
  employeeID:      z.string().min(1, 'Veuillez sélectionner un employé'),
  type:            z.string().min(1, 'Type requis'),
  startDate:       z.string().min(1, 'Date de début requise'),
  endDate:         z.string().optional(),
  message:         z.string().min(3, 'Motif requis (minimum 3 caractères)'),
  requestedAmount: z.coerce.number().optional(),
  documentType:    z.string().optional(),
  leaveSubType:    z.string().optional(),
  legalDays:       z.coerce.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function NewRequestForm({ employees }: Props) {
  const router     = useRouter();
  const { toast }  = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const today = format(new Date(), 'yyyy-MM-dd');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeID: '', type: '', startDate: today, endDate: '', message: '',
      requestedAmount: undefined, documentType: '', leaveSubType: '', legalDays: undefined,
    },
  });

  const watchStart      = form.watch('startDate');
  const watchEnd        = form.watch('endDate');
  const watchType       = form.watch('type');
  const watchSubType    = form.watch('leaveSubType');
  const watchLegalDays  = form.watch('legalDays');

  const needsDates = ['Vacation', 'Leave', 'Sick', 'Maternity', 'Training'].includes(watchType);

  const numberOfDays =
    needsDates && watchStart && watchEnd
      ? Math.max(1, countWorkingDays(new Date(watchStart), new Date(watchEnd)))
      : null;

  // Calcul de l'imputation réelle sur le solde pour les congés exceptionnels
  const excessDays = watchType === 'Leave' && numberOfDays !== null && watchLegalDays !== undefined
    ? Math.max(0, numberOfDays - (watchLegalDays ?? 0))
    : null;

  // Quand le sous-type change, on pré-remplit les jours légaux
  const handleSubTypeChange = (value: string) => {
    form.setValue('leaveSubType', value);
    const legal = LEGAL_DAYS_BY_SUBTYPE[value]?.days;
    if (legal !== undefined) form.setValue('legalDays', legal);
  };

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/requests', {
        ...data,
        startDate:    needsDates ? data.startDate : today,
        endDate:      needsDates ? data.endDate   : undefined,
        numberOfDays: needsDates ? numberOfDays   : undefined,
        requestedAmount: data.type === 'Raise'     ? data.requestedAmount : undefined,
        documentType:    data.type === 'Documents' ? data.documentType    : undefined,
        leaveSubType:    data.type === 'Leave'     ? data.leaveSubType    : undefined,
        legalDays:       data.type === 'Leave'     ? data.legalDays       : undefined,
      });
      toast({ title: 'Demande enregistrée' });
      form.reset({
        employeeID: '', type: '', startDate: today, endDate: '', message: '',
        requestedAmount: undefined, documentType: '', leaveSubType: '', legalDays: undefined,
      });
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
            <FormLabel>Employé *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Sélectionner un employé" /></SelectTrigger>
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

        {/* Type */}
        <FormField control={form.control} name="type" render={({ field }) => (
          <FormItem>
            <FormLabel>Type de demande *</FormLabel>
            <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
              <FormControl>
                <SelectTrigger><SelectValue placeholder="Sélectionner le type" /></SelectTrigger>
              </FormControl>
              <SelectContent>
                {REQUEST_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )} />

        {/* Sous-type + jours légaux (uniquement pour Congé exceptionnel) */}
        {watchType === 'Leave' && (
          <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50/50 p-3">
            <p className="text-xs font-medium text-blue-700">Congé exceptionnel — Code du travail togolais</p>

            <FormField control={form.control} name="leaveSubType" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Motif exceptionnel</FormLabel>
                <Select
                  onValueChange={handleSubTypeChange}
                  value={field.value}
                  disabled={isLoading}
                >
                  <FormControl>
                    <SelectTrigger className="h-8 text-sm">
                      <SelectValue placeholder="Sélectionner le motif" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(LEGAL_DAYS_BY_SUBTYPE).map(([key, { label, days }]) => (
                      <SelectItem key={key} value={key}>
                        {label} {days > 0 ? `(${days} j. légaux)` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="legalDays" render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs">Jours accordés par la loi</FormLabel>
                <FormControl>
                  <Input
                    type="number" min={0} max={30}
                    disabled={isLoading}
                    placeholder="0"
                    className="h-8 text-sm"
                    {...field}
                    value={field.value ?? ''}
                    onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                  />
                </FormControl>
                <p className="text-xs text-muted-foreground">
                  Ces jours ne sont pas déduits du solde de congés annuels.
                </p>
                <FormMessage />
              </FormItem>
            )} />
          </div>
        )}

        {/* Dates — uniquement pour congés / absences */}
        {needsDates && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de début *</FormLabel>
                  <FormControl><Input type="date" disabled={isLoading} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Date de fin</FormLabel>
                  <FormControl><Input type="date" disabled={isLoading} min={watchStart} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {numberOfDays !== null && (
              <div className="rounded-md border bg-muted/30 px-4 py-3 space-y-1">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-muted-foreground">Durée totale</p>
                  <p className="text-lg font-semibold">{numberOfDays} jour{numberOfDays > 1 ? 's' : ''}</p>
                </div>
                {watchType === 'Leave' && watchLegalDays !== undefined && (
                  <>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-blue-600">dont jours légaux (non déduits)</span>
                      <span className="font-medium text-blue-600">{Math.min(watchLegalDays, numberOfDays)} j.</span>
                    </div>
                    {excessDays !== null && excessDays > 0 && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-orange-600">imputés sur congés annuels</span>
                        <span className="font-medium text-orange-600">{excessDays} j.</span>
                      </div>
                    )}
                    {excessDays === 0 && (
                      <p className="text-xs text-green-600">✓ Aucun jour prélevé sur le solde annuel</p>
                    )}
                  </>
                )}
              </div>
            )}
          </>
        )}

        {/* Type de document */}
        {watchType === 'Documents' && (
          <FormField control={form.control} name="documentType" render={({ field }) => (
            <FormItem>
              <FormLabel>Type de document *</FormLabel>
              <Select onValueChange={field.onChange} value={field.value} disabled={isLoading}>
                <FormControl>
                  <SelectTrigger><SelectValue placeholder="Sélectionner le document" /></SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="attestation_travail">Attestation de travail</SelectItem>
                  <SelectItem value="attestation_salaire">Attestation de salaire</SelectItem>
                  <SelectItem value="certificat_travail">Certificat de travail</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* Montant augmentation */}
        {watchType === 'Raise' && (
          <FormField control={form.control} name="requestedAmount" render={({ field }) => (
            <FormItem>
              <FormLabel>Montant de l'augmentation demandée (FCFA) *</FormLabel>
              <FormControl>
                <Input
                  type="number" min={0} step={500} disabled={isLoading}
                  placeholder="Ex : 350 000"
                  {...field}
                  value={field.value ?? ''}
                  onChange={(e) => field.onChange(e.target.valueAsNumber || undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )} />
        )}

        {/* Motif */}
        <FormField control={form.control} name="message" render={({ field }) => (
          <FormItem>
            <FormLabel>Motif / Description *</FormLabel>
            <FormControl>
              <Textarea
                disabled={isLoading}
                placeholder="Décrivez la raison de la demande..."
                rows={3}
                {...field}
              />
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
          {isLoading ? <span className="animate-pulse">Enregistrement...</span> : 'Soumettre la demande'}
        </button>
      </form>
    </Form>
  );
}
