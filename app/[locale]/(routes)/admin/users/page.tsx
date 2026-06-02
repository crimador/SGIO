import { getUsers } from '@/actions/get-users';
import React from 'react';
import Container from '../../components/ui/Container';
import { InviteForm } from './components/InviteForm';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { AdminUserDataTable } from './table-components/data-table';
import { columns } from './table-components/columns';
import SendMailToAll from './components/send-mail-to-all';

const AdminUsersPage = async () => {
  const [users, session] = await Promise.all([
    getUsers(),
    getServerSession(authOptions),
  ]);

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

  return (
    <Container
      title="Gestion des utilisateurs"
      description="Invitez des collaborateurs et gérez leurs accès et rôles."
    >
      <div className="space-y-6">
        <section className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-5">
            <p
              className="mb-4 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
              style={{ borderColor: '#FF7E00' }}
            >
              Inviter un nouvel utilisateur
            </p>
            <InviteForm />
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-5">
            <p
              className="mb-4 border-l-[3px] pl-3 text-xs font-semibold uppercase tracking-wide text-gray-400"
              style={{ borderColor: '#FF7E00' }}
            >
              Communication groupée
            </p>
            <SendMailToAll />
          </div>
        </section>

        <AdminUserDataTable columns={columns} data={users} />
      </div>
    </Container>
  );
};

export default AdminUsersPage;
