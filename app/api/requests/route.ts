import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prismadb } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const requests = await (prismadb as any).request.findMany({
      include: {
        employee: { select: { firstName: true, lastName: true, position: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json(requests);
  } catch (error) {
    console.log('[REQUESTS_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new NextResponse('Unauthenticated', { status: 401 });

  try {
    const body = await req.json();
    const { employeeID, type, message, startDate, endDate, numberOfDays, requestedAmount, documentType, legalDays, leaveSubType } = body;

    if (!employeeID) return new NextResponse('employeeID requis', { status: 400 });
    if (!type)       return new NextResponse('type requis', { status: 400 });
    if (!startDate)  return new NextResponse('startDate requis', { status: 400 });
    if (!message)    return new NextResponse('message requis', { status: 400 });

    const request = await (prismadb as any).request.create({
      data: {
        employeeID,
        type,
        message,
        startDate:       new Date(startDate),
        endDate:         endDate ? new Date(endDate) : null,
        numberOfDays:    numberOfDays    ? Number(numberOfDays)    : null,
        requestedAmount: requestedAmount ? Number(requestedAmount) : null,
        documentType:    documentType    ?? null,
        legalDays:       type === 'Leave' && legalDays !== undefined ? Number(legalDays) : null,
        leaveSubType:    type === 'Leave' ? leaveSubType ?? null : null,
        status: 'EN_ATTENTE',
      },
      include: {
        employee: { select: { firstName: true, lastName: true } },
      },
    });

    return NextResponse.json(request, { status: 201 });
  } catch (error) {
    console.log('[REQUESTS_POST]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
