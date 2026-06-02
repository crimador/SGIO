import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const role = session.user.userRole ?? 'COMMERCIAL';

  const showInvoices     = ['DG', 'COMPTABLE'].includes(role);
  const showHR           = ['DG', 'RH'].includes(role);
  const showOpportunities = ['DG', 'COMPTABLE', 'COMMERCIAL'].includes(role);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [invoicesOverdue, hrRequests, overdueOpportunities] = await Promise.all([
    showInvoices
      ? prismadb.billingDocument.findMany({
          where: {
            type: 'FACTURE',
            dueDate: { lt: today },
            status: { notIn: ['PAYEE', 'ANNULEE'] },
          },
          select: {
            id: true,
            number: true,
            totalTTC: true,
            dueDate: true,
            crmAccount: { select: { name: true } },
            occasionalClient: { select: { name: true } },
          },
          orderBy: { dueDate: 'asc' },
          take: 10,
        })
      : Promise.resolve([]),

    showHR
      ? prismadb.request.findMany({
          where: { status: 'EN_ATTENTE' },
          select: {
            id: true,
            type: true,
            employee: { select: { firstName: true, lastName: true } },
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 10,
        })
      : Promise.resolve([]),

    showOpportunities
      ? prismadb.crm_Opportunities.findMany({
          where: {
            deletedAt: null,
            status: 'ACTIVE',
            close_date: { lt: today },
          },
          select: {
            id: true,
            name: true,
            close_date: true,
            assigned_to_user: { select: { name: true } },
          },
          orderBy: { close_date: 'asc' },
          take: 10,
        })
      : Promise.resolve([]),
  ]);

  const total = invoicesOverdue.length + hrRequests.length + overdueOpportunities.length;

  return NextResponse.json({
    total,
    invoicesOverdue,
    hrRequests,
    overdueOpportunities,
  });
}
