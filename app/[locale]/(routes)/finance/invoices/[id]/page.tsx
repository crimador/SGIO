import { notFound } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getBillingDocument } from '@/actions/billing/get-document';
import { prismadb } from '@/lib/prisma';
import { DocumentStatusBadge, DocumentTypeBadge } from '../components/DocumentStatusBadge';
import { DocumentActions } from './components/DocumentActions';
import { PdfDownloadButton } from './components/PdfDownloadButton';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { ArrowLeft, ExternalLink, AlertTriangle } from 'lucide-react';
import { PaymentsSection } from './components/PaymentsSection';

const TVA_LABELS: Record<string, string> = {
  NORMAL:  'TVA 18%',
  EXONERE: 'Exonéré de TVA',
  TPU:     'TPU',
};

export default async function DocumentDetailPage({ params }: { params: { id: string } }) {
  const [doc, cabinet] = await Promise.all([
    getBillingDocument(params.id),
    prismadb.myAccount.findFirst(),
  ]);
  if (!doc) notFound();

  const cabinetOk  = !!cabinet?.company_name;
  const clientName = doc.crmAccount?.name ?? doc.occasionalClient?.name ?? '—';

  const clientDetails = doc.occasionalClient
    ? [
        doc.occasionalClient.nif     ? `NIF : ${doc.occasionalClient.nif}`     : null,
        doc.occasionalClient.phone   ? `Tél : ${doc.occasionalClient.phone}`   : null,
        doc.occasionalClient.email   ? `Email : ${doc.occasionalClient.email}` : null,
        doc.occasionalClient.address ? doc.occasionalClient.address             : null,
        doc.occasionalClient.city    ? doc.occasionalClient.city                : null,
      ].filter(Boolean)
    : [
        doc.crmAccount?.nif            ? `NIF : ${doc.crmAccount.nif}`          : null,
        doc.crmAccount?.billing_street ? doc.crmAccount.billing_street          : null,
        doc.crmAccount?.billing_city   ? doc.crmAccount.billing_city            : null,
      ].filter(Boolean);

  return (
    <Container
      title={doc.number}
      description={`Émis le ${format(new Date(doc.issueDate), 'dd MMMM yyyy', { locale: fr })}${doc.dueDate ? ` · Échéance le ${format(new Date(doc.dueDate), 'dd MMMM yyyy', { locale: fr })}` : ''}`}
    >

      {/* Bandeau avertissement cabinet non configuré */}
      {!cabinetOk && (
        <div className="flex items-start gap-3 rounded-xl border border-[#FF7E00]/40 bg-[#FF7E00]/[0.06] px-4 py-3 text-sm">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-[#FF7E00]" />
          <span className="text-gray-700">
            Les paramètres de votre entreprise (nom, NIF, RCCM) ne sont pas configurés.{' '}
            <Link href="/finance/settings" className="font-semibold underline hover:no-underline" style={{ color: '#FF7E00' }}>
              Configurer dans Paramètres → Mon entreprise
            </Link>{' '}
            avant de générer un PDF.
          </span>
        </div>
      )}

      {/* Barre haut : retour + badges + actions */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link href="/finance/invoices">
            <button className="flex h-9 items-center gap-2 rounded-lg border px-3 text-sm font-medium text-gray-600 transition-colors hover:border-[#FF7E00]/40 hover:text-[#1E1D3D]">
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          </Link>
          <DocumentTypeBadge type={doc.type} />
          <DocumentStatusBadge status={doc.status} dueDate={doc.dueDate as string | null} />
        </div>
        <div className="flex items-center gap-2">
          <PdfDownloadButton docId={doc.id} docNumber={doc.number} />
          <DocumentActions documentId={doc.id} type={doc.type} status={doc.status} />
        </div>
      </div>

      {/* Documents liés */}
      {(doc.sourceQuote || doc.creditedInvoice || doc.creditNotes.length > 0) && (
        <div className="rounded-xl border bg-gray-50/60 px-4 py-3 text-sm space-y-1">
          {doc.sourceQuote && (
            <p className="text-gray-500">
              Issu du devis{' '}
              <Link href={`/finance/invoices/${doc.sourceQuote.id}`} className="font-medium hover:underline" style={{ color: '#FF7E00' }}>
                {doc.sourceQuote.number} <ExternalLink className="inline h-3 w-3" />
              </Link>
            </p>
          )}
          {doc.creditedInvoice && (
            <div className="space-y-0.5">
              <p className="text-gray-500">
                Avoir de la facture{' '}
                <Link href={`/finance/invoices/${doc.creditedInvoice.id}`} className="font-medium hover:underline" style={{ color: '#FF7E00' }}>
                  {doc.creditedInvoice.number} <ExternalLink className="inline h-3 w-3" />
                </Link>
              </p>
              {doc.creditNoteMode && (
                <p className="text-xs text-gray-400">
                  Mode :{' '}
                  <span
                    className="font-semibold"
                    style={{ color: doc.creditNoteMode === 'PARTIEL' ? '#FF7E00' : '#1E1D3D' }}
                  >
                    {doc.creditNoteMode === 'TOTAL' ? 'Remboursement total' : 'Remboursement partiel'}
                  </span>
                  {doc.creditNoteMotif && <> · Motif : <span className="italic">{doc.creditNoteMotif}</span></>}
                </p>
              )}
            </div>
          )}
          {doc.creditNotes.map((cn) => (
            <div key={cn.id} className="space-y-0.5">
              <p className="text-gray-500">
                Avoir associé :{' '}
                <Link href={`/finance/invoices/${cn.id}`} className="font-medium hover:underline" style={{ color: '#FF7E00' }}>
                  {cn.number}
                </Link>
                {' '}— {cn.totalTTC.toLocaleString('fr-FR')} FCFA
              </p>
              {cn.creditNoteMode && (
                <p className="text-xs text-gray-400">
                  Mode :{' '}
                  <span
                    className="font-semibold"
                    style={{ color: cn.creditNoteMode === 'PARTIEL' ? '#FF7E00' : '#1E1D3D' }}
                  >
                    {cn.creditNoteMode === 'TOTAL' ? 'Remboursement total' : 'Remboursement partiel'}
                  </span>
                  {cn.creditNoteMotif && <> · Motif : <span className="italic">{cn.creditNoteMotif}</span></>}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Infos client + fiscalité */}
      <div className="grid grid-cols-2 gap-6">
        <section className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4 space-y-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Client</p>
            <p className="font-semibold" style={{ color: '#1E1D3D' }}>{clientName}</p>
            {(clientDetails as string[]).map((d, i) => (
              <p key={i} className="text-sm text-gray-500">{d}</p>
            ))}
            {doc.crmAccount && (
              <Link
                href={`/crm/accounts/${doc.crmAccount.id}`}
                className="mt-1 inline-block text-xs font-medium hover:underline"
                style={{ color: '#FF7E00' }}
              >
                Voir la fiche client
              </Link>
            )}
          </div>
        </section>

        <section className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4 space-y-1">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Fiscalité</p>
            <p className="text-sm font-medium" style={{ color: '#1E1D3D' }}>
              {TVA_LABELS[doc.tvaRegime] ?? doc.tvaRegime}
            </p>
          </div>
        </section>
      </div>

      {/* Tableau des lignes */}
      <div className="overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead style={{ background: '#F4F2F2' }}>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Désignation</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Qté</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>PU HT</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Total HT</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>TVA</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Total TTC</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {doc.lines.map((line) => (
              <tr key={line.id} className="transition-colors hover:bg-[#FF7E00]/[0.03]">
                <td className="px-4 py-3">{line.designation}</td>
                <td className="px-4 py-3 text-right text-gray-400">{line.quantity.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-right text-gray-400">{line.unitPrice.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-right">{line.totalHT.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-right text-gray-400">{line.totalTVA.toLocaleString('fr-FR')}</td>
                <td className="px-4 py-3 text-right font-semibold" style={{ color: '#1E1D3D' }}>
                  {line.totalTTC.toLocaleString('fr-FR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totaux */}
      <div className="flex justify-end">
        <div className="w-72 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-400">Total HT</span>
            <span>{doc.totalHT.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-400">TVA ({doc.tvaRate}%)</span>
            <span>{doc.totalTVA.toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="border-t pt-2 flex justify-between text-base font-bold" style={{ color: '#1E1D3D' }}>
            <span>Total TTC</span>
            <span style={{ color: '#FF7E00' }}>{doc.totalTTC.toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      </div>

      {/* Acomptes & Paiements */}
      {doc.type === 'FACTURE' && (
        <section className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4">
            <PaymentsSection
              documentId={doc.id}
              totalTTC={doc.totalTTC}
              status={doc.status}
            />
          </div>
        </section>
      )}

      {/* Notes */}
      {doc.notes && (
        <section className="overflow-hidden rounded-xl border">
          <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
          <div className="p-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">Notes / Conditions</p>
            <p className="whitespace-pre-wrap text-sm">{doc.notes}</p>
          </div>
        </section>
      )}

    </Container>
  );
}
