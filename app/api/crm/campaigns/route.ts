import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const { name, description, status } = await req.json();

    if (!name) return new NextResponse('Le nom est obligatoire', { status: 400 });

    const campaign = await prismadb.crm_campaigns.create({
      data: { name, description, status: status ?? 'PLANNED' },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    console.log('[CAMPAIGNS_POST]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const { id, name, description, status } = await req.json();

    if (!id) return new NextResponse('ID manquant', { status: 400 });
    if (!name) return new NextResponse('Le nom est obligatoire', { status: 400 });

    const campaign = await prismadb.crm_campaigns.update({
      where: { id },
      data: { name, description, status },
    });

    return NextResponse.json(campaign, { status: 200 });
  } catch (error) {
    console.log('[CAMPAIGNS_PUT]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
