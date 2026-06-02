'use client';

import { useState } from 'react';
import { z } from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

const formSchema = z.object({
  employeeID: z.string().min(1, 'Employee is required'),
  timeIn: z.date(),
  timeOut: z.date().optional(),
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

  const form = useForm<UpdateTimekeepingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      employeeID: initialData.employeeID || '',
      timeIn: initialData.timeIn ? new Date(initialData.timeIn) : new Date(),
      timeOut: initialData.timeOut ? new Date(initialData.timeOut) : undefined,
      verified: initialData.verified || false,
    },
  });

  const onSubmit = async (data: UpdateTimekeepingFormValues) => {
    setIsLoading(true);
    try {
      await axios.put('/api/timekeeping', {
        id: initialData.id,
        employeeID: data.employeeID,
        timeIn: data.timeIn,
        timeOut: data.timeOut ? data.timeOut : null,
        verified: data.verified,
      });
      toast({
        title: 'Succès',
        description: 'Pointage mis à jour avec succès.',
      });
      setOpen(false);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.response?.data,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="w-[800px] text-sm">
          <div className="space-y-2 pb-5">
            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="employeeID"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employé</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un employé" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="h-96 overflow-y-auto">
                          {/* TODO: Add users list */}
                          <SelectItem value={field.value}>
                            {initialData?.employee?.firstName} {initialData?.employee?.lastName}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="timeIn"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Heure d&apos;arrivée</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                'flex w-[240px] items-center rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-[#FF7E00]/[0.06]',
                                !field.value && 'text-gray-400'
                              )}
                            >
                              {field.value ? (
                                format(field?.value, 'PPP HH:mm')
                              ) : (
                                <span>Choisir date et heure</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="timeOut"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Heure de départ</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <button
                              type="button"
                              className={cn(
                                'flex w-[240px] items-center rounded-md border px-3 py-2 text-left text-sm transition-colors hover:bg-[#FF7E00]/[0.06]',
                                !field.value && 'text-gray-400'
                              )}
                            >
                              {field.value ? (
                                format(field?.value, 'PPP HH:mm')
                              ) : (
                                <span>Choisir date et heure (optionnel)</span>
                              )}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value || undefined}
                            onSelect={field.onChange}
                            disabled={(date) =>
                              date > new Date() || date < new Date('1900-01-01')
                            }
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="verified"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Vérifié</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="grid gap-2 py-5">
          <button
            disabled={isLoading}
            type="submit"
            className="flex h-10 w-full items-center justify-center rounded-lg text-sm font-semibold text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            {isLoading ? (
              <span className="animate-pulse">Enregistrement...</span>
            ) : (
              'Mettre à jour'
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
