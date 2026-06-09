import Link from 'next/link';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getDictionary } from '@/dictionaries';

import { getInvoices } from '@/actions/invoice/get-invoices';
import { getAccountSettings } from '@/actions/invoice/get-account-settings';

import { columns } from './data-table/columns';
import { InvoiceDataTable } from './data-table/data-table';

import Container from '../components/ui/Container';

import ModalDropzone from './components/modal-dropzone';
import { MyAccountSettingsForm } from './components/MyAccountSettingsForm';

import RightViewModal from '@/components/modals/right-view-modal';
import type { MyAccount } from '@prisma/client';
import { getActiveUsers } from '@/actions/get-users';
import { getBoards } from '@/actions/projects/get-boards';
import NewTaskDialog from './dialogs/NewTask';

const InvoicePage = async ({ params }: { params: { locale: string } }) => {
  const [session, dict] = await Promise.all([
    getServerSession(authOptions),
    getDictionary(params.locale as 'en' | 'cz' | 'de' | 'uk' | 'ko' | 'fr'),
  ]);

  const [invoices, myAccountSettings, users, boards] = await Promise.all([
    getInvoices() as Promise<any>,
    getAccountSettings() as Promise<MyAccount | null>,
    getActiveUsers(),
    getBoards(session?.user.id!, session?.user.userRole),
  ]);

  return (
    <Container
      title={dict.ModuleMenu.invoices}
      description={'Tout ce quil faut savoir sur les factures et la TVA'}
    >
      <NewTaskDialog users={users} boards={boards} />
      <div className="flex w-full justify-between py-5">
        <div className="flex space-x-2">
          <ModalDropzone buttonLabel="Télécharger PDF" />
          <Link
            href={`/invoice/${session?.user.id}`}
            className="flex h-9 items-center gap-1.5 rounded-lg px-4 text-sm font-semibold text-white transition-all active:scale-[0.98]"
            style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
          >
            Mes factures
          </Link>
        </div>
        <div>
          <RightViewModal
            label="Paramètres"
            title="Paramètres de votre entreprise"
            description="Ces données seront utilisées comme valeurs par défaut pour vos factures. Vous pouvez les modifier à tout moment. Il est très important de définir l'email du compte qui recevra les fichiers pour l'importation dans les ERP"
            width={'w-[900px]'}
          >
            <MyAccountSettingsForm initialData={myAccountSettings} />
          </RightViewModal>
        </div>
      </div>
      <div>
        <InvoiceDataTable data={invoices} columns={columns} />
      </div>
    </Container>
  );
};

export default InvoicePage;
