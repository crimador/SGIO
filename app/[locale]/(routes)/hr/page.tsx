import { Suspense } from 'react';

import SuspenseLoading from '@/components/loadings/suspense';
import Container from '../components/ui/Container';
import HRDashboard from './components/HRDashboard';

import { getEmployee } from '@/actions/get-employee';
import { getTimekeeping } from '@/actions/get-timekeeping';
import { getPayslips } from '@/actions/get-payslips';
import { getRequests } from '@/actions/get-requests';
import { getDictionary } from '@/dictionaries';

const HRPage = async ({ params }: { params: { locale: string } }) => {
  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');

  const [employeeData, timekeepingData, payslipData, requestsData] = await Promise.all([
    getEmployee(),
    getTimekeeping(),
    getPayslips(),
    getRequests(),
  ]);

  return (
    <Container
      title={dict.HRPage.title}
      description={dict.HRPage.description}
    >
      <Suspense fallback={<SuspenseLoading />}>
        <HRDashboard
          employeeData={employeeData}
          timekeepingData={timekeepingData as any}
          payslipData={payslipData as any}
          requestsData={requestsData as any}
        />
      </Suspense>
    </Container>
  );
};

export default HRPage;
