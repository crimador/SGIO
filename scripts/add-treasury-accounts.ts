import { prismadb } from '../lib/prisma';

async function main() {
  const existing = await prismadb.treasuryAccount.findMany();
  if (existing.length > 0) {
    console.log('Comptes existants :');
    existing.forEach((a) => console.log(` - ${a.name} (${a.type})`));
    return;
  }

  await prismadb.treasuryAccount.createMany({
    data: [
      { name: 'Banque principale', type: 'BANQUE',       currency: 'XOF', isActive: true },
      { name: 'Caisse',           type: 'CAISSE',        currency: 'XOF', isActive: true },
      { name: 'Flooz (Moov)',     type: 'MOBILE_MONEY',  currency: 'XOF', isActive: true },
      { name: 'T-Money (Togocel)', type: 'MOBILE_MONEY', currency: 'XOF', isActive: true },
    ],
  });

  console.log('Comptes de trésorerie créés avec succès.');
}

main()
  .catch(console.error)
  .finally(() => prismadb.$disconnect());
