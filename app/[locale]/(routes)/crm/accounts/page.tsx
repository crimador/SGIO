import React, { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canWrite } from '@/lib/permissions';
import AccountsView from '../components/AccountsView';
import Container from '../../components/ui/Container';
import SuspenseLoading from '@/components/loadings/suspense';
import { getAllCrmData } from '@/actions/crm/get-crm-data';
import { getAccounts } from '@/actions/crm/get-accounts';

const AccountsPage = async () => {
  const session = await getServerSession(authOptions);
  const [crmData, accounts] = await Promise.all([
    getAllCrmData(),
    getAccounts(),
  ]);
  const writeable = canWrite(session?.user?.userRole ?? 'COMMERCIAL', 'crm');

  return (
    <Container title="Clients" description="Liste de tous les comptes clients et entreprises">
      <Suspense fallback={<SuspenseLoading />}>
        <AccountsView crmData={crmData} data={accounts} canWrite={writeable} />
      </Suspense>
    </Container>
  );
};

export default AccountsPage;
