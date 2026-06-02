import React, { Suspense } from 'react';
import { cookies } from 'next/headers';
import { MailComponent } from './components/mail';
import { accounts, mails } from '@/app/[locale]/(routes)/emails/data';
import Container from '../components/ui/Container';
import SuspenseLoading from '@/components/loadings/suspense';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDictionary } from '@/dictionaries';

const EmailRoute = async ({ params }: { params: { locale: string } }) => {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      redirect: {
        destination: '/',
        permanent: false,
      },
    };
  }

  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');

  const layout = cookies().get('react-resizable-panels:layout');
  const collapsed = cookies().get('react-resizable-panels:collapsed');
  //console.log(layout, collapsed, "layout, collapsed");

  const defaultLayout = layout ? JSON.parse(layout.value) : undefined;
  const defaultCollapsed = collapsed ? JSON.parse(collapsed.value) : undefined;

  return (
    <Container
      title={dict.ModuleMenu.emails}
      description={
        'This module is in development. This is only a frontend demo.'
      }
    >
      <Suspense fallback={<SuspenseLoading />}>
        <MailComponent
          accounts={accounts}
          mails={mails}
          defaultLayout={defaultLayout}
          defaultCollapsed={defaultCollapsed}
          navCollapsedSize={4}
        />
      </Suspense>
    </Container>
  );
};

export default EmailRoute;
