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
const EmployeesView = ({ data, crmData }: any) => {
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex justify-end">
          <RightViewModal label={'+'} title={t('createEmployee')} description="">
            <NewEmployeeForm
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
                taxId: t('taxId'),
                insurance: t('insurance'),
                address: t('address'),
                createEmployee: t('createEmployee'),
              }}
            />
          </RightViewModal>
        </div>
        <div className="h-px bg-gray-100" />
      </CardHeader>

      <CardContent>
        {!data || data.length === 0 ? (
          t('noEmployeesFound')
        ) : (
          <EmployeeDataTable data={data} columns={columns} />
        )}
      </CardContent>
    </Card>
  );
};

export default EmployeesView;
