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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { Textarea } from '@/components/ui/textarea';

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';

import useDebounce from '@/hooks/useDebounce';

//TODO: fix all the types
type NewTaskFormProps = {
  users: any[];
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
    assignedUser: string;
    taxId: string;
    insurance: string;
    address: string;
    createEmployee: string;
  };
};

export function NewEmployeeForm({ users, translations }: NewTaskFormProps) {
  const router = useRouter();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');

  const debounceSearchTerm = useDebounce(searchTerm, 1000);

  const filteredData = users.filter((item) =>
    item.name.toLowerCase().includes(debounceSearchTerm.toLowerCase())
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);

  const formSchema = z.object({
    firstName: z.string().min(3).max(50),
    lastName: z.string().min(3).max(50),
    email: z.string().email(),
    phone: z.string().optional(),
    position: z.string().optional(),
    salary: z.coerce.number().positive(),
    IBAN: z.string().min(3).max(50),
    photo: z.string().min(3).optional(),
    taxid: z.string().min(2).max(30).optional(),
    address: z.string().min(3).max(250).optional(),
    insurance: z.string().min(3).max(50).optional(),
    onBoarding: z.date().default(new Date()).optional(),
    assigned_to: z.string(),
  });

  type NewAccountFormValues = z.infer<typeof formSchema>;

  const form = useForm<NewAccountFormValues>({
    resolver: zodResolver(formSchema),
  });

  const onSubmit = async (data: NewAccountFormValues) => {
    setIsLoading(true);
    try {
      await axios.post('/api/employee', data);
      toast({
        title: 'Succès',
        description: 'Employé créé avec succès.',
      });
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: error?.response?.data,
      });
    } finally {
      setIsLoading(false);
      form.reset({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        position: '',
        salary: 0,
        IBAN: '',
        photo: '',
        taxid: '',
        address: '',
        insurance: '',
        onBoarding: undefined,
        assigned_to: '',
      });
      router.refresh();
    }
  };

  //console.log(filteredData, "filteredData");

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="h-full px-10">
        {/*        <div>
          <pre>
            <code>{JSON.stringify(form.formState, null, 2)}</code>
            <code>{JSON.stringify(form.watch(), null, 2)}</code>
            <code>{JSON.stringify(form.formState.errors, null, 2)}</code>
          </pre>
        </div> */}
        <div className="w-[800px] text-sm">
          <div className="space-y-2 pb-5">
            <div className="flex gap-5 pb-5">
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.firstName}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Matt"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.lastName}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Parker"
                          {...field}
                        />
                      </FormControl>
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
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.officePhone}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="+420 ...."
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.email}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="account@domain.com"
                          {...field}
                        />
                      </FormControl>
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
                  name="position"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.position}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="Développeur"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="w-1/2 space-y-2">
                <FormField
                  control={form.control}
                  name="salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{translations.salary}</FormLabel>
                      <FormControl>
                        <Input
                          disabled={isLoading}
                          placeholder="3500"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
            <FormField
              control={form.control}
              name="onBoarding"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>{translations.onBoarding}</FormLabel>
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
                            format(field?.value, 'PPP')
                          ) : (
                            <span>{translations.pickExpectedCloseDate}</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        //@ts-ignore
                        //TODO: fix this
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date('1900-01-01')}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-5 pb-5">
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="IBAN"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.iban}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Saisir IBAN"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="assigned_to"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.assignedUser}</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Choisir un utilisateur" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="h-96 overflow-y-auto">
                        <Input
                          type="text"
                          placeholder="Rechercher un utilisateur..."
                          onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        {filteredData?.map((item, index) => (
                          <SelectItem key={index} value={item.id}>
                            {item.name}
                          </SelectItem>
                        ))}
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
                name="taxid"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.taxId}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Numéro fiscal"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="w-1/2 space-y-2">
              <FormField
                control={form.control}
                name="insurance"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.insurance}</FormLabel>
                    <FormControl>
                      <Input
                        disabled={isLoading}
                        placeholder="Détails assurance"
                        {...field}
                      />
                    </FormControl>
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
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{translations.address}</FormLabel>
                    <FormControl>
                      <Textarea
                        disabled={isLoading}
                        placeholder="Adresse..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              translations.createEmployee
            )}
          </button>
        </div>
      </form>
    </Form>
  );
}
