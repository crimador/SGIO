import { prismadb } from '@/lib/prisma';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { CabinetSettingsForm } from './CabinetSettingsForm';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function CabinetSettingsPage() {
  const session = await getServerSession(authOptions);
  if (!session || !['DG', 'COMPTABLE'].includes(session.user.userRole ?? '')) {
    redirect('/unauthorized');
  }

  const account = await prismadb.myAccount.findFirst();

  return (
    <Container
      title="Paramètres du cabinet"
      description="Informations affichées sur vos factures, devis et avoirs PDF"
    >
      <CabinetSettingsForm initialData={account} />
    </Container>
  );
}
