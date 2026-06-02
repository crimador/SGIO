'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Plus } from 'lucide-react';

import { columns } from '../opportunities/table-components/columns';
import { NewOpportunityForm } from '../opportunities/components/NewOpportunityForm';
import { OpportunitiesDataTable } from '../opportunities/table-components/data-table';

const OpportunitiesView = ({
  data,
  crmData,
  accountId,
  canWrite = true,
}: {
  data: any;
  crmData: any;
  accountId?: string;
  canWrite?: boolean;
}) => {
  const router = useRouter();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isMounted, setIsMounted]   = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  const { users, accounts, contacts, saleTypes, saleStages, campaigns } = crmData;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-4 pt-5">
        <div className="flex items-center justify-between">
          <div>
            <button
              className="text-base font-bold hover:underline"
              style={{ color: '#1E1D3D' }}
              onClick={() => router.push('/crm/opportunities')}
            >
              Opportunités
            </button>
            <p className="mt-0.5 text-xs text-gray-400">
              {data?.length ?? 0} opportunité{(data?.length ?? 0) > 1 ? 's' : ''}
            </p>
          </div>
          {canWrite && (
            <button
              onClick={() => setDialogOpen(true)}
              className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
            >
              <Plus className="h-4 w-4" /> Nouvelle
            </button>
          )}
        </div>
      </CardHeader>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="flex max-h-[90vh] min-w-[1000px] flex-col">
          <DialogHeader><DialogTitle>Nouvelle opportunité</DialogTitle></DialogHeader>
          <div className="flex-1 overflow-y-auto pr-1">
            <NewOpportunityForm
              users={users}
              accounts={accounts}
              contacts={contacts}
              salesType={saleTypes}
              saleStages={saleStages}
              campaigns={campaigns}
              accountId={accountId}
              onDialogClose={() => setDialogOpen(false)}
            />
          </div>
        </DialogContent>
      </Dialog>

      <CardContent className="pt-0">
        {!data || data.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-400">Aucune opportunité trouvée.</p>
        ) : (
          <OpportunitiesDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default OpportunitiesView;
