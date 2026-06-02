'use client';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { DotsHorizontalIcon } from '@radix-ui/react-icons';
import axios from 'axios';
import { PlusIcon, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ContactView = ({ data, opportunityId }: any) => {
  const router = useRouter();
  const { toast } = useToast();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const onAddNew = () => {
    alert('Actions - not yet implemented');
  };

  const onView = (id: string) => {
    router.push(`/crm/contacts/${id}`);
  };

  const onUnlink = async (id: string) => {
    try {
      await axios.put(`/api/crm/contacts/unlink-opportunity/${id}`, { opportunityId });
      toast({ variant: 'default', description: 'Contact dissocié.' });
      router.refresh();
    } catch (error) {
      console.log(error);
      toast({ variant: 'destructive', description: 'Erreur lors de la dissociation du contact.' });
    }
  };

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-bold" style={{ color: '#1E1D3D' }}>Contacts</p>
            <p className="mt-0.5 text-xs text-gray-400">
              {data?.length ?? 0} contact{(data?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onAddNew}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            <PlusIcon className="h-4 w-4" /> Associer
          </button>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun contact associé.</p>
        ) : (
          <div>
            {data.map((contact: any) => (
              <div key={contact.id} className="-mx-2 flex items-center space-x-4 rounded-md p-2 transition-all hover:bg-[#FF7E00]/[0.05]">
                <User className="mt-px h-5 w-5 shrink-0" style={{ color: '#FF7E00' }} />
                <div className="flex w-full justify-between">
                  <div className="flex items-center justify-start space-x-5">
                    <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>
                      {contact.first_name} {contact.last_name}
                    </p>
                    <p className="text-sm text-gray-400">{contact.email}</p>
                    <p className="text-sm text-gray-400">{contact.office_phone}</p>
                    <p className="text-sm text-gray-400">{contact.mobile_phone}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="flex h-8 w-8 items-center justify-center rounded-md p-0 hover:bg-[#FF7E00]/[0.08]">
                        <DotsHorizontalIcon className="h-4 w-4" />
                        <span className="sr-only">Ouvrir le menu</span>
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[160px]">
                      <DropdownMenuItem onClick={() => onView(contact.id)}>Voir</DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onUnlink(contact.id)}>Dissocier</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ContactView;
