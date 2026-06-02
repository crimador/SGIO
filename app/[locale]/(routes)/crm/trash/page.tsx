import { Suspense } from 'react';
import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import { TrashView } from './TrashView';
import { getCrmTrash } from '@/actions/crm/get-trash';

const TrashPage = async () => {
  const trash = await getCrmTrash();

  const allItems = [
    ...trash.accounts,
    ...trash.contacts,
    ...trash.leads,
    ...trash.opportunities,
    ...trash.campaigns,
  ].sort((a, b) => {
    const da = a.deletedAt ? new Date(a.deletedAt).getTime() : 0;
    const db = b.deletedAt ? new Date(b.deletedAt).getTime() : 0;
    return db - da;
  });

  return (
    <Container
      title="Corbeille CRM"
      description="Restaurez ou supprimez définitivement les éléments CRM supprimés"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <TrashView items={allItems} />
      </Suspense>
    </Container>
  );
};

export default TrashPage;
