import { getCampaign } from '@/actions/crm/get-campaigns';
import Container from '@/app/[locale]/(routes)/components/ui/Container';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Target, TrendingUp } from 'lucide-react';

const STATUS_CLASSES: Record<string, string> = {
  PLANNED:   'bg-gray-100 text-gray-700',
  ACTIVE:    'bg-green-100 text-green-700',
  COMPLETED: 'border text-gray-600',
  CANCELLED: 'bg-red-100 text-red-700',
};

const STATUS_LABELS: Record<string, string> = {
  PLANNED:   'Planifiée',
  ACTIVE:    'Active',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
};

interface CampaignDetailPageProps {
  params: { campaignId: string };
}

const CampaignDetailPage = async ({ params }: CampaignDetailPageProps) => {
  const campaign = await getCampaign(params.campaignId);

  if (!campaign) return <div>Campagne introuvable.</div>;

  const statusClass = STATUS_CLASSES[campaign.status ?? ''] ?? 'bg-gray-100 text-gray-700';
  const statusLabel = STATUS_LABELS[campaign.status ?? ''] ?? (campaign.status ?? '—');
  const totalRevenue = campaign.opportunities.reduce((sum, o) => sum + (o.expected_revenue ?? 0), 0);

  return (
    <Container
      title={campaign.name}
      description="Détail de la campagne et opportunités associées"
    >
      <div className="space-y-6">
        {/* Infos campagne */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 text-base font-bold" style={{ color: '#1E1D3D' }}>
                <Target className="h-5 w-5" />
                Informations
              </p>
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Description</p>
              <p className="mt-1 text-sm">{campaign.description ?? '—'}</p>
            </div>
            <div className="h-px bg-gray-100" />
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Opportunités liées</p>
                <p className="mt-1 text-2xl font-bold">{campaign.opportunities.length}</p>
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">Revenu potentiel total</p>
                <p className="mt-1 text-2xl font-bold">{totalRevenue.toLocaleString('fr-FR')} FCFA</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Opportunités associées */}
        <Card>
          <CardHeader>
            <p className="flex items-center gap-2 text-base font-bold" style={{ color: '#1E1D3D' }}>
              <TrendingUp className="h-5 w-5" />
              Opportunités ({campaign.opportunities.length})
            </p>
          </CardHeader>
          <CardContent>
            {campaign.opportunities.length === 0 ? (
              <p className="text-sm text-gray-400">Aucune opportunité liée à cette campagne.</p>
            ) : (
              <div className="divide-y">
                {campaign.opportunities.map((opp) => (
                  <div key={opp.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium">{opp.name ?? '(sans nom)'}</p>
                      <p className="text-xs text-gray-400">
                        {opp.assigned_account?.name ?? '—'} · {opp.sales_stage ?? '—'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{opp.expected_revenue.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-xs text-gray-400">
                        Clôture : {opp.close_date ? format(new Date(opp.close_date), 'dd MMM yyyy', { locale: fr }) : '—'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
};

export default CampaignDetailPage;
