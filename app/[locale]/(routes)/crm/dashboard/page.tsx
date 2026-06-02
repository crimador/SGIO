import React from 'react';
import Container from '../../components/ui/Container';
import { getSaleStages } from '@/actions/crm/get-sales-stage';
import CRMKanban from './_components/CRMKanban';
import { getOpportunities } from '@/actions/crm/get-opportunities';
import { getAllCrmData } from '@/actions/crm/get-crm-data';

const CrmDashboardPage = async () => {
  const [salesStages, opportunities, crmData] = await Promise.all([
    getSaleStages(),
    getOpportunities(),
    getAllCrmData(),
  ]);

  return (
    <Container
      title="Tableau de bord CRM"
      description="Vue Kanban de vos opportunités par étape commerciale."
    >
      <div className="h-full w-full overflow-hidden">
        <CRMKanban
          salesStages={salesStages}
          opportunities={opportunities}
          crmData={crmData}
        />
      </div>

      {/*     <CRMKanbanServer
        salesStages={salesStages}
        opportunities={opportunities}
      /> */}
    </Container>
  );
};

export default CrmDashboardPage;
