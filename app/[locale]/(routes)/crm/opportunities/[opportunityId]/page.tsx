import Container from '@/app/[locale]/(routes)/components/ui/Container';
import React from 'react';

import { BasicView } from './components/BasicView';

import DocumentsView from '../../components/DocumentsView';
import ContactsView from '../../components/ContactsView';
import AccountsView from '../../components/AccountsView';

import { getAllCrmData } from '@/actions/crm/get-crm-data';
import { getOpportunity } from '@/actions/crm/get-opportunity';
import { getContactsByOpportunityId } from '@/actions/crm/get-contacts-by-opportunityId';
import { getDocumentsByOpportunityId } from '@/actions/documents/get-documents-by-opportunityId';
import { getAccountsByOpportunityId } from '@/actions/crm/get-accounts-by-opportunityId';

const OpportunityView = async ({
  params: { opportunityId },
}: {
  params: { opportunityId: string };
}) => {
  const [opportunity, crmData, accounts, contacts, documents] = await Promise.all([
    getOpportunity(opportunityId) as Promise<any>,
    getAllCrmData(),
    getAccountsByOpportunityId(opportunityId),
    getContactsByOpportunityId(opportunityId),
    getDocumentsByOpportunityId(opportunityId),
  ]);

  if (!opportunity) return <div>Opportunity not found</div>;

  return (
    <Container
      title={opportunity.name}
      description={opportunity.description ?? "Détails de l'opportunité commerciale"}
    >
      <div className="space-y-5">
        <BasicView data={opportunity} />
        <AccountsView crmData={crmData} data={accounts} />
        <ContactsView crmData={crmData} data={contacts} />
        <DocumentsView data={documents} />
      </div>
    </Container>
  );
};

export default OpportunityView;
