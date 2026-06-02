import { Suspense } from 'react';
import { redirect } from 'next/navigation';

import SuspenseLoading from '@/components/loadings/suspense';

import Container from '../../components/ui/Container';
import EmployeesView from './components/EmployeesView';

import { getAllCrmData } from '@/actions/crm/get-crm-data';
import { getEmployee } from '@/actions/get-employee';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDictionary } from '@/dictionaries';

const EmployeePage = async ({ params }: { params: { locale: string } }) => {
  const session = await getServerSession(authOptions);
  if (!session || !['DG', 'COMPTABLE', 'RH'].includes(session.user.userRole)) redirect('/unauthorized');
  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');
  
  const [crmData, employee] = await Promise.all([
    getAllCrmData(),
    getEmployee(),
  ]);

  return (
    <Container
      title={dict.ModuleMenu.employees}
      description={'Tout ce quil faut savoir sur vos employés'}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <EmployeesView crmData={crmData} data={employee} />
      </Suspense>
    </Container>
  );
};

export default EmployeePage;
