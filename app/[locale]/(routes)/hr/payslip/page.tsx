import { Suspense } from 'react';

import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../../components/ui/Container';
import PayslipView from './components/PayslipView';

import { getPayslips } from '@/actions/get-payslips';
import { getEmployee } from '@/actions/get-employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

const PayslipPage = async () => {
  const session = await getServerSession(authOptions);
  const role = session?.user.userRole;

  let employeeId: string | undefined;
  if (role === 'COMMERCIAL') {
    const emp = await prismadb.employee.findUnique({ where: { email: session!.user.email! }, select: { id: true } });
    employeeId = emp?.id;
  }

  const [payslipData, employeeData] = await Promise.all([
    getPayslips(employeeId),
    getEmployee(),
  ]);

  return (
    <Container
      title="Bulletins de paie"
      description="Gestion des bulletins de salaire des employés"
    >
      <Suspense fallback={<SuspenseLoading />}>
        <PayslipView data={payslipData} employees={employeeData} />
      </Suspense>
    </Container>
  );
};

export default PayslipPage;
