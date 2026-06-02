import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function DELETE(
  req: Request,
  { params }: { params: { campaignId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  if (!params.campaignId)
    return new NextResponse('ID campagne manquant', { status: 400 });

  try {
    await prismadb.crm_campaigns.update({
      where: { id: params.campaignId },
      data: { deletedAt: new Date() },
    });
    return NextResponse.json({ message: 'Campagne supprimée' }, { status: 200 });
  } catch (error) {
    console.log('[CAMPAIGN_DELETE]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
