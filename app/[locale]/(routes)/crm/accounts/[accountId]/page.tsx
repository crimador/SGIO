import Container from '@/app/[locale]/(routes)/components/ui/Container';
import React from 'react';
import { BasicView } from './components/BasicView';

import { getAccount } from '@/actions/crm/get-account';
import { getAllCrmData } from '@/actions/crm/get-crm-data';
import { getOpportunitiesFullByAccountId } from '@/actions/crm/get-opportunities-with-includes-by-accountId';
import { getContactsByAccountId } from '@/actions/crm/get-contacts-by-accountId';
import { getLeadsByAccountId } from '@/actions/crm/get-leads-by-accountId';
import { getDocumentsByAccountId } from '@/actions/documents/get-documents-by-accountId';
import { getBillingByAccount } from '@/actions/billing/get-billing-by-account';
import { BillingView } from './components/BillingView';

import OpportunitiesView from '../../components/OpportunitiesView';
import LeadsView from '../../components/LeadsView';
import ContactsView from '../../components/ContactsView';
import DocumentsView from '../../components/DocumentsView';

import type {
  Documents,
  crm_Accounts,
  crm_Accounts_Tasks,
  crm_Contacts,
  crm_Leads,
  crm_Opportunities,
} from '@prisma/client';
import AccountsTasksView from './components/TasksView';
import { getAccountsTasks } from '@/actions/crm/account/get-tasks';

interface AccountDetailPageProps {
  params: {
    accountId: string;
  };
}

const AccountDetailPage = async ({ params }: AccountDetailPageProps) => {
  const { accountId } = params;
  const account: crm_Accounts | null = await getAccount(accountId);
  const [opportunities, contacts, leads, documents, tasks, crmData, billingData] =
    await Promise.all([
      getOpportunitiesFullByAccountId(accountId),
      getContactsByAccountId(accountId),
      getLeadsByAccountId(accountId),
      getDocumentsByAccountId(accountId),
      getAccountsTasks(accountId),
      getAllCrmData(),
      getBillingByAccount(accountId),
    ]);

  if (!account) return <div>Account not found</div>;

  return (
    <Container
      title={account?.name ?? 'Compte client'}
      description="Informations, opportunités, contacts et documents liés à ce compte"
    >
      <div className="space-y-5">
        <BasicView data={account} />
        <BillingView data={billingData} accountId={accountId} />
        <AccountsTasksView data={tasks} account={account} />
        <OpportunitiesView
          data={opportunities}
          crmData={crmData}
          accountId={accountId}
        />
        <ContactsView data={contacts} crmData={crmData} accountId={accountId} />
        <LeadsView data={leads} crmData={crmData} />
        <DocumentsView data={documents} />
      </div>
    </Container>
  );
};

export default AccountDetailPage;
