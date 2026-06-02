'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Clock, DollarSign, FileText } from 'lucide-react';

import EmployeesView from '../../employees/components/EmployeesView';
import TimekeepingView from '../../timekeeping/components/TimekeepingView';
import PayslipView from './PayslipView';
import RequestsView from './RequestsView';

type HRViewProps = {
  crmData: any;
  employeeData: any[];
  timekeepingData: any[];
  payslipData: any[];
  requestsData: any[];
  translations: any;
};

const VALID_TABS = ['employees', 'timekeeping', 'payslip', 'conges'];

const HRView = ({ crmData, employeeData, timekeepingData, payslipData, requestsData, translations }: HRViewProps) => {
  const t = useTranslations('HRPage');
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const initialTab = VALID_TABS.includes(tabParam ?? '') ? (tabParam as string) : 'employees';
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && VALID_TABS.includes(tab)) setActiveTab(tab);
  }, [searchParams]);

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="employees" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            {t('employees')}
          </TabsTrigger>
          <TabsTrigger value="timekeeping" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            {t('timekeeping')}
          </TabsTrigger>
          <TabsTrigger value="payslip" className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            {t('payslip')}
          </TabsTrigger>
          <TabsTrigger value="conges" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Congés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="employees" className="space-y-4">
          <EmployeesView crmData={crmData} data={employeeData} />
        </TabsContent>

        <TabsContent value="timekeeping" className="space-y-4">
          <TimekeepingView
            data={timekeepingData}
            employees={employeeData}
            translations={translations.TimekeepingPage}
          />
        </TabsContent>

        <TabsContent value="payslip" className="space-y-4">
          <PayslipView data={payslipData} employees={employeeData} />
        </TabsContent>

        <TabsContent value="conges" className="space-y-4">
          <RequestsView data={requestsData} employees={employeeData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HRView;
