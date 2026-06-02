import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prismadb } from '@/lib/prisma';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

//Timekeeping delete route
export async function DELETE(
  req: Request,
  { params }: { params: { timekeepingId: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!params.timekeepingId) {
    return new NextResponse('Timekeeping ID is required', { status: 400 });
  }

  try {
    await prismadb.timekeeping.delete({
      where: {
        id: params.timekeepingId,
      },
    });

    return NextResponse.json({ message: 'Timekeeping Deleted' }, { status: 200 });
  } catch (error) {
    console.log('[TIMEKEEPING_DELETE]', error);
    return new NextResponse('Initial error', { status: 500 });
  }
}
