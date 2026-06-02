import React, { Suspense } from 'react';
import Container from '../components/ui/Container';

import type { Session } from 'next-auth';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { getDictionary } from '@/dictionaries';

import ProjectsView from './_components/ProjectsView';
import SuspenseLoading from '@/components/loadings/suspense';

export const maxDuration = 300;

const ProjectsPage = async ({ params }: { params: { locale: string } }) => {
  const session: Session | null = await getServerSession(authOptions);

  if (!session) return redirect('/sign-in');

  const dict = await getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr');

  return (
    <Container
      title={dict.ModuleMenu.projects}
      description="Gérez vos projets et vos équipes."
    >
      <Suspense fallback={<SuspenseLoading />}>
        <ProjectsView />
      </Suspense>
    </Container>
  );
};

export default ProjectsPage;
