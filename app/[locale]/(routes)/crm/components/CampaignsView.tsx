'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import RightViewModal from '@/components/modals/right-view-modal';
import { columns } from '../campaigns/table-components/columns';
import { CampaignDataTable } from '../campaigns/table-components/data-table';
import { NewCampaignForm } from '../campaigns/components/NewCampaignForm';

const CampaignsView = ({ data }: { data: any[] }) => {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => { setIsMounted(true); }, []);
  if (!isMounted) return null;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3">
        <div className="flex justify-between">
          <div>
            <p
              className="cursor-pointer text-base font-bold"
              style={{ color: '#1E1D3D' }}
              onClick={() => router.push('/crm/campaigns')}
            >
              Campagnes
            </p>
            <p className="mt-0.5 text-xs text-gray-400">Marketing et actions commerciales</p>
          </div>
          <RightViewModal label="+" title="Nouvelle campagne" description="">
            <NewCampaignForm />
          </RightViewModal>
        </div>
        <div className="h-px bg-gray-100" />
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-sm text-gray-400">Aucune campagne trouvée.</p>
        ) : (
          <CampaignDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignsView;
