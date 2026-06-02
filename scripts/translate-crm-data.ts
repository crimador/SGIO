const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const typeUpdates: Record<string, string> = {
    'New deal':               'Nouveau contrat',
    'Business from partners': 'Affaire via partenaires',
    'Upsale':                 'Vente additionnelle',
    'Cross sale':             'Vente croisée',
  };

  for (const [oldName, newName] of Object.entries(typeUpdates)) {
    await prisma.crm_Opportunities_Type.updateMany({
      where: { name: oldName },
      data:  { name: newName },
    });
  }
  console.log('Types de vente traduits');

  const stageUpdates: Record<string, string> = {
    'New':                        'Nouveau',
    'Need analysis':              'Analyse des besoins',
    'Offer sent':                 'Offre envoyée',
    'Offer accepted':             'Offre acceptée',
    'Contract draft':             'Brouillon de contrat',
    'Contract negotiation':       'Négociation du contrat',
    'Send for signing':           'Envoyé pour signature',
    'Signing':                    'Signature',
    'Realization of the project': 'Réalisation du projet',
  };

  for (const [oldName, newName] of Object.entries(stageUpdates)) {
    await prisma.crm_Opportunities_Sales_Stages.updateMany({
      where: { name: oldName },
      data:  { name: newName },
    });
  }
  console.log('Etapes commerciales traduites');

  await prisma.crm_campaigns.updateMany({
    where: { name: 'Social networks' },
    data:  { name: 'Réseaux sociaux', description: 'Instagram, Facebook, Twitter' },
  });
  await prisma.crm_campaigns.updateMany({
    where: { name: 'Cold calls' },
    data:  { name: 'Démarchage téléphonique', description: "Notre centre d'appels" },
  });
  console.log('Campagnes traduites');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
