import { getUnpaidInvoices } from '@/actions/billing/get-unpaid';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { UnpaidTable } from './UnpaidTable';

export default async function UnpaidInvoicesPage() {
  const invoices = await getUnpaidInvoices();

  return (
    <Container
      title="Suivi des impayés"
      description="Factures émises en attente de règlement"
    >
      <UnpaidTable invoices={invoices} />
    </Container>
  );
}
