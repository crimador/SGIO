import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const employee = await prisma.employee.findFirst();
const team = await prisma.teams.findFirst();

if (employee && team) {
  await prisma.teams.update({
    where: { id: team.id },
    data: { members: { connect: { id: employee.id } } },
  });
  console.log(`Membre reconnecté : ${employee.firstName} -> ${team.name}`);
} else {
  console.log('Rien à reconnecter');
}

await prisma.$disconnect();
