import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function POST(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const { leadId } = params;
  const userId = session.user.id;

  const body = await req.json();
  const {
    createAccount,
    accountName,
    createContact,
    createOpportunity,
    opportunityName,
    budget,
    closeDate,
    salesStage,
    assignedTo,
  } = body;

  try {
    const lead = await prismadb.crm_Leads.findUnique({ where: { id: leadId } });
    if (!lead) return new NextResponse('Prospect introuvable', { status: 404 });

    let accountId: string | undefined;
    let contactId: string | undefined;
    let opportunityId: string | undefined;

    if (createAccount && accountName) {
      const account = await prismadb.crm_Accounts.create({
        data: {
          name: accountName,
          email: lead.email || null,
          office_phone: lead.phone || null,
          status: 'Active',
          billing_country: 'Togo',
          createdBy: userId,
          updatedBy: userId,
          ...(assignedTo ? { assigned_to: assignedTo } : {}),
        },
      });
      accountId = account.id;
    }

    if (createContact) {
      const contact = await prismadb.crm_Contacts.create({
        data: {
          first_name: lead.firstName || '',
          last_name: lead.lastName,
          email: lead.email || null,
          mobile_phone: lead.phone || null,
          description: lead.description || null,
          createdBy: userId,
          updatedBy: userId,
          ...(accountId ? { assigned_accounts: { connect: { id: accountId } } } : {}),
          ...(assignedTo ? { assigned_to_user: { connect: { id: assignedTo } } } : {}),
        },
      });
      contactId = contact.id;
    }

    if (createOpportunity && opportunityName) {
      const opp = await prismadb.crm_Opportunities.create({
        data: {
          name: opportunityName,
          budget: Number(budget) || 0,
          close_date: closeDate ? new Date(closeDate) : null,
          currency: 'XOF',
          status: 'ACTIVE',
          createdBy: userId,
          updatedBy: userId,
          ...(accountId ? { assigned_account: { connect: { id: accountId } } } : {}),
          ...(salesStage ? { assigned_sales_stage: { connect: { id: salesStage } } } : {}),
          ...(assignedTo ? { assigned_to_user: { connect: { id: assignedTo } } } : {}),
        },
      });
      opportunityId = opp.id;
    }

    await prismadb.crm_Leads.update({
      where: { id: leadId },
      data: {
        status: 'CONVERTED',
        ...(accountId ? { accountsIDs: accountId } : {}),
      },
    });

    return NextResponse.json({ accountId, contactId, opportunityId }, { status: 200 });
  } catch (error) {
    console.log('[LEAD_CONVERT]', error);
    return new NextResponse('Erreur lors de la conversion', { status: 500 });
  }
}
