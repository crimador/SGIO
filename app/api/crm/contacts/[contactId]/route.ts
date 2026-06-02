import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';

import { prismadb } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

//Contact delete route
export async function DELETE(
  req: Request,
  { params }: { params: { contactId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!params.contactId) {
    return new NextResponse('contact ID is required', { status: 400 });
  }

  try {
    await prismadb.crm_Contacts.update({
      where: { id: params.contactId },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Contact deleted' }, { status: 200 });
  } catch (error) {
    console.log('[CONTACT_DELETE]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
