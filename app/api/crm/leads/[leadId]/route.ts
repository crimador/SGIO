import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prismadb } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function DELETE(
  req: Request,
  { params }: { params: { leadId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!params.leadId) {
    return new NextResponse('Lead ID is required', { status: 400 });
  }

  try {
    await prismadb.crm_Leads.update({
      where: { id: params.leadId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Lead deleted' }, { status: 200 });
  } catch (error) {
    console.log('[LEAD_DELETE]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
