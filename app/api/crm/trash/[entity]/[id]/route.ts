import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

const ENTITY_MAP = {
  account: 'crm_Accounts',
  contact: 'crm_Contacts',
  lead: 'crm_Leads',
  opportunity: 'crm_Opportunities',
  campaign: 'crm_campaigns',
} as const;

type Entity = keyof typeof ENTITY_MAP;

// PATCH → restore (set deletedAt to null)
export async function PATCH(
  req: Request,
  { params }: { params: { entity: string; id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const entity = params.entity as Entity;
  if (!ENTITY_MAP[entity]) return new NextResponse('Entité invalide', { status: 400 });

  try {
    // @ts-expect-error dynamic model access
    await prismadb[ENTITY_MAP[entity]].update({
      where: { id: params.id },
      data: { deletedAt: null },
    });
    return NextResponse.json({ message: 'Élément restauré' }, { status: 200 });
  } catch (error) {
    console.log('[TRASH_RESTORE]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}

// DELETE → permanent delete
export async function DELETE(
  req: Request,
  { params }: { params: { entity: string; id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  const entity = params.entity as Entity;
  if (!ENTITY_MAP[entity]) return new NextResponse('Entité invalide', { status: 400 });

  try {
    // @ts-expect-error dynamic model access
    await prismadb[ENTITY_MAP[entity]].delete({ where: { id: params.id } });
    return NextResponse.json({ message: 'Suppression définitive effectuée' }, { status: 200 });
  } catch (error) {
    console.log('[TRASH_DELETE]', error);
    return new NextResponse('Erreur serveur', { status: 500 });
  }
}
