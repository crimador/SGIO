import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { canWrite } from '@/lib/permissions';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (!canWrite(session.user.userRole, 'crm')) return new NextResponse('Forbidden', { status: 403 });

  try {
    const body = await req.json();
    const {
      name,
      office_phone,
      email,
      nif,
      rccm,
      regimeFiscal,
      centreImpots,
      dateCloture,
      billing_street,
      billing_city,
      billing_country,
      description,
      assigned_to,
      annual_revenue,
      industry,
    } = body;

    const newAccount = await prismadb.crm_Accounts.create({
      data: {
        createdBy: session.user.id,
        updatedBy: session.user.id,
        name,
        office_phone: office_phone || null,
        email: email || null,
        nif: nif || null,
        rccm: rccm || null,
        regimeFiscal: regimeFiscal || null,
        centreImpots: centreImpots || null,
        dateCloture: dateCloture ? new Date(dateCloture) : null,
        billing_street: billing_street || null,
        billing_city,
        billing_country: billing_country || 'Togo',
        description: description || null,
        assigned_to: assigned_to || null,
        status: 'Active',
        annual_revenue: annual_revenue || null,
        industry: industry || null,
      },
    });

    return NextResponse.json({ newAccount }, { status: 200 });
  } catch (error) {
    console.log('[NEW_ACCOUNT_POST]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (!canWrite(session.user.userRole, 'crm')) return new NextResponse('Forbidden', { status: 403 });

  try {
    const body = await req.json();
    const {
      id,
      name,
      office_phone,
      email,
      nif,
      rccm,
      regimeFiscal,
      centreImpots,
      dateCloture,
      billing_street,
      billing_city,
      billing_country,
      description,
      assigned_to,
      status,
      annual_revenue,
      industry,
    } = body;

    const updatedAccount = await prismadb.crm_Accounts.update({
      where: { id },
      data: {
        updatedBy: session.user.id,
        name,
        office_phone: office_phone || null,
        email: email || null,
        nif: nif || null,
        rccm: rccm || null,
        regimeFiscal: regimeFiscal || null,
        centreImpots: centreImpots || null,
        dateCloture: dateCloture ? new Date(dateCloture) : null,
        billing_street: billing_street || null,
        billing_city,
        billing_country: billing_country || 'Togo',
        description: description || null,
        assigned_to: assigned_to || null,
        status: status || 'Active',
        annual_revenue: annual_revenue || null,
        industry: industry || null,
      },
    });

    return NextResponse.json({ updatedAccount }, { status: 200 });
  } catch (error) {
    console.log('[UPDATE_ACCOUNT_PUT]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const accounts = await prismadb.crm_Accounts.findMany({});
    return NextResponse.json(accounts, { status: 200 });
  } catch (error) {
    console.log('[ACCOUNTS_GET]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
