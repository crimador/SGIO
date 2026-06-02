import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export async function PUT(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (!['DG', 'RH'].includes(session.user.userRole ?? ''))
    return new NextResponse('Forbidden', { status: 403 });

  try {
    const body = await req.json();
    const { status } = body;

    const existing = await (prismadb as any).request.findUnique({
      where: { id: params.requestId },
    });

    if (!existing) return new NextResponse('Not found', { status: 404 });

    const request = await (prismadb as any).request.update({
      where: { id: params.requestId },
      data:  { status },
      include: {
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    // Additionne le montant au salaire existant lors de l'approbation d'une augmentation
    if (status === 'APPROUVE' && existing.type === 'Raise' && existing.requestedAmount) {
      await prismadb.employee.update({
        where: { id: existing.employeeID },
        data:  { salary: { increment: existing.requestedAmount } },
      });
    }

    return NextResponse.json(request);
  } catch (error) {
    console.log('[REQUEST_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { requestId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json().catch(() => ({}));
    const { returnedAt, numberOfDays } = body;

    const existing = await (prismadb as any).request.findUnique({
      where: { id: params.requestId },
    });
    if (!existing) return new NextResponse('Not found', { status: 404 });
    if (existing.returnedAt) return new NextResponse('Retour déjà confirmé', { status: 409 });

    const updated = await (prismadb as any).request.update({
      where: { id: params.requestId },
      data:  {
        returnedAt:   returnedAt ? new Date(returnedAt) : new Date(),
        ...(numberOfDays !== undefined ? { numberOfDays: Number(numberOfDays) } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.log('[REQUEST_PATCH_RETURN]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { requestId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });
  if (!['DG', 'RH'].includes(session.user.userRole ?? ''))
    return new NextResponse('Forbidden', { status: 403 });

  try {
    await (prismadb as any).request.delete({ where: { id: params.requestId } });
    return NextResponse.json({ message: 'Demande supprimée' });
  } catch (error) {
    console.log('[REQUEST_DELETE]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
