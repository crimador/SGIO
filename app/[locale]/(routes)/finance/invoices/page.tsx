import { getBillingDocuments } from '@/actions/billing/get-documents';
import { BillingTable } from './components/BillingTable';

export default async function InvoicesPage() {
  const documents = await getBillingDocuments();

  const serialized = documents.map((doc) => ({
    id:               doc.id,
    type:             doc.type,
    number:           doc.number,
    status:           doc.status,
    issueDate:        doc.issueDate.toISOString(),
    dueDate:          doc.dueDate?.toISOString() ?? null,
    totalTTC:         doc.totalTTC,
    crmAccount:       doc.crmAccount ? { name: doc.crmAccount.name } : null,
    occasionalClient: doc.occasionalClient ? { name: doc.occasionalClient.name } : null,
  }));

  return (
    <div className="space-y-5 p-6 lg:p-8">
      {/* En-tête */}
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>Facturation</h1>
        <p className="mt-1 text-sm text-gray-500">Devis, factures et avoirs clients</p>
        <div
          className="mt-3 h-[3px] w-8 rounded-full"
          style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }}
        />
      </div>

      <BillingTable documents={serialized} />
    </div>
  );
}
