import Link from 'next/link';
import { getClientsWithBilling } from '@/actions/billing/get-clients-with-billing';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText } from 'lucide-react';

function fmt(n: number) {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
}

export default async function ReleveIndexPage() {
  const clients = await getClientsWithBilling();

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: '#1E1D3D' }}>Relevé de compte client</h1>
        <div className="mt-1 h-[3px] w-10 rounded-full" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <p className="mt-2 text-sm text-gray-400">
          Sélectionnez un client pour visualiser son historique de facturation et son solde.
        </p>
      </div>

      <Card className="overflow-hidden">
        <div className="h-[3px]" style={{ background: 'linear-gradient(to right, #FF7E00, #FAC731)' }} />
        <CardHeader className="pb-3 pt-5">
          <p className="text-sm font-semibold" style={{ color: '#1E1D3D' }}>Clients facturés</p>
          <p className="mt-0.5 text-xs text-gray-400">
            {clients.length} client{clients.length !== 1 ? 's' : ''} avec des documents de facturation
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {clients.length === 0 ? (
            <div className="flex h-32 items-center justify-center text-sm text-gray-400">
              Aucun client facturé pour l&apos;instant.
            </div>
          ) : (
            <div className="overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-gray-50/80 hover:bg-gray-50/80">
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Client</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>NIF</TableHead>
                    <TableHead className="text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Ville</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Factures</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Total facturé</TableHead>
                    <TableHead className="text-right text-xs font-semibold uppercase tracking-wide" style={{ color: '#1E1D3D' }}>Impayé</TableHead>
                    <TableHead />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                    <TableRow key={client.id} className="transition-colors hover:bg-[#FF7E00]/[0.04]">
                      <TableCell className="font-medium" style={{ color: '#1E1D3D' }}>{client.name}</TableCell>
                      <TableCell className="font-mono text-sm text-gray-400">
                        {client.nif ?? '—'}
                      </TableCell>
                      <TableCell className="text-sm text-gray-400">
                        {client.billing_city ?? '—'}
                      </TableCell>
                      <TableCell className="text-right text-sm">{client.invoiceCount}</TableCell>
                      <TableCell className="text-right font-medium">
                        {fmt(client.totalFacture)} FCFA
                      </TableCell>
                      <TableCell className="text-right">
                        {client.totalImpaye > 0 ? (
                          <span className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold" style={{ background: 'rgba(255,126,0,0.12)', color: '#FF7E00' }}>
                            {fmt(client.totalImpaye)} FCFA
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full border border-green-300 px-2 py-0.5 text-xs font-medium text-green-700">
                            Soldé
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Link
                          href={`/finance/releve/${client.id}`}
                          className="flex h-8 items-center gap-1.5 rounded-lg px-3 text-xs font-semibold text-white transition-all active:scale-[0.98]"
                          style={{ background: 'linear-gradient(135deg, #FF7E00, #e8950a)' }}
                        >
                          <FileText className="h-3.5 w-3.5" />
                          Voir le relevé
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
