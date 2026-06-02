'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Plus } from 'lucide-react';

import { columns } from '../accounts/table-components/columns';
import { NewAccountForm } from '../accounts/components/NewAccountForm';
import { AccountDataTable } from '../accounts/table-components/data-table';

const AccountsView = ({ data, crmData, canWrite = true }: any) => {
  const router = useRouter();
  const [open, setOpen]           = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const { users, industries } = crmData;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <button
              className="text-base font-bold hover:underline"
              style={{ color: '#1E1D3D' }}
              onClick={() => router.push('/crm/accounts')}
            >
              Clients
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              {data?.length ?? 0} compte{(data?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
          {canWrite && (
            <Sheet open={open} onOpenChange={setOpen}>
              <button
                onClick={() => setOpen(true)}
                className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
              >
                <Plus className="h-4 w-4" /> Nouveau
              </button>
              <SheetContent className="min-w-[1000px] space-y-2">
                <SheetHeader><SheetTitle>Nouveau client</SheetTitle></SheetHeader>
                <div className="h-full overflow-y-auto">
                  <NewAccountForm industries={industries} users={users} onFinish={() => setOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {!data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucun client trouvé.</p>
        ) : (
          <AccountDataTable data={data} columns={columns} industries={industries} users={users} />
        )}
      </CardContent>
    </Card>
  );
};

export default AccountsView;
