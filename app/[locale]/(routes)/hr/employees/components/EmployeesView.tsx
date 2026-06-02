'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

import {
  Card,
  CardContent,
  CardHeader,
} from '@/components/ui/card';
import RightViewModal from '@/components/modals/right-view-modal';

import { columns } from '../table-components/columns';
import { NewEmployeeForm } from './NewEmployeeForm';
import { EmployeeDataTable } from '../table-components/data-table';
import { useRouter } from 'next/navigation';

const EmployeesView = ({ data, crmData }: any) => {
  const router = useRouter();
  const t = useTranslations('EmployeePage');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  const { users } = crmData;

  return (
    <Card className="overflow-hidden">
      <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
      <CardHeader className="pb-3 pt-5">
        <div className="flex items-center justify-between">
          <p
            className="cursor-pointer text-base font-bold"
            style={{ color: '#1E1D3D' }}
            onClick={() => router.push('/employees')}
          >
            {t('title')}
          </p>
          <RightViewModal label={'+'} title={t('createEmployee')} description="">
            <NewEmployeeForm
              users={users}
              translations={{
                firstName: t('firstName'),
                lastName: t('lastName'),
                officePhone: t('officePhone'),
                email: t('email'),
                position: t('position'),
                salary: t('salary'),
                onBoarding: t('onBoarding'),
                pickExpectedCloseDate: t('pickExpectedCloseDate'),
                iban: t('iban'),
                assignedUser: t('assignedUser'),
                taxId: t('taxId'),
                insurance: t('insurance'),
                address: t('address'),
                createEmployee: t('createEmployee'),
              }}
            />
          </RightViewModal>
        </div>
      </CardHeader>

      <CardContent>
        {!data || data.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">{t('noEmployeesFound')}</p>
        ) : (
          <EmployeeDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeesView;
