import React from 'react';
import { getServerSession } from 'next-auth';

import { columns } from './components/Columns';
import { DataTable } from './components/data-table';
import Container from '../../components/ui/Container';

import { authOptions } from '@/lib/auth';
import { getModules } from '@/actions/get-modules';

const AdminModulesPage = async () => {
  const session = await getServerSession(authOptions);

  if (session?.user?.userRole !== 'DG') {
    return (
      <Container
        title="Administration"
        description="Accès réservé au Dirigeant"
      >
        <div className="flex h-full w-full items-center justify-center">
          Accès non autorisé
        </div>
      </Container>
    );
  }

  const modules = await getModules();
  return (
    <Container
      title="Gestion des modules"
      description="Activez ou désactivez les modules de l'application."
    >
      <DataTable columns={columns} data={modules} search="name" />
    </Container>
  );
};

export default AdminModulesPage;
