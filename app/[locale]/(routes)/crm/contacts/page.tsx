import { Suspense } from 'react';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canWrite } from '@/lib/permissions';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import ContactsView from '../components/ContactsView';
import { getContacts } from '@/actions/crm/get-contacts';
import { getAllCrmData } from '@/actions/crm/get-crm-data';

const ContactsPage = async () => {
  const [session, crmData, contacts] = await Promise.all([
    getServerSession(authOptions),
    getAllCrmData(),
    getContacts(),
  ]);
  const writeable = canWrite(session?.user?.userRole ?? 'COMMERCIAL', 'crm');

  return (
    <Container title="Contacts" description="Liste de tous les contacts associés à vos clients">
      <Suspense fallback={<SuspenseLoading />}>
        <ContactsView crmData={crmData} data={contacts} canWrite={writeable} />
      </Suspense>
    </Container>
  );
};

export default ContactsPage;
