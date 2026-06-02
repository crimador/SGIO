import { prismadb } from '../lib/prisma';

async function main() {
  const existing = await prismadb.system_Modules_Enabled.findFirst({
    where: { name: 'finance' },
  });

  if (existing) {
    console.log('Module finance déjà présent :', existing);
  } else {
    const result = await prismadb.system_Modules_Enabled.create({
      data: { name: 'finance', enabled: true, position: 12 },
    });
    console.log('Module finance créé :', result);
  }
}

main()
  .catch(console.error)
  .finally(() => prismadb.$disconnect());
