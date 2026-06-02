import { Suspense } from 'react';

import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import CongesView from './components/CongesView';

import { getRequests } from '@/actions/get-requests';
import { getEmployee } from '@/actions/get-employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

const CongesPage = async () => {
  const session = await getServerSession(authOptions);
  const role = session?.user.userRole;

  let employeeId: string | undefined;
  if (role === 'COMMERCIAL') {
    const emp = await prismadb.employee.findUnique({ where: { email: session!.user.email! }, select: { id: true } });
    employeeId = emp?.id;
  }

  const [requestsData, employeeData] = await Promise.all([
    getRequests(employeeId),
    getEmployee(),
  ]);

  return (
    <Container
      title="Congés & Demandes"
      description="Gestion des congés et demandes des employés"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <CongesView
          data={requestsData}
          employees={employeeData}
          canApprove={['DG', 'RH'].includes(role ?? '')}
        />
      </Suspense>
    </Container>
  );
};

export default CongesPage;
