import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  const body = await req.json();
  const userId = session?.user.id;

  const {
    employeeID,
    timeIn,
    timeOut,
  } = body;

  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  if (!employeeID) {
    return new NextResponse('Employee ID is required', { status: 400 });
  }

  if (!timeIn) {
    return new NextResponse('Time in is required', { status: 400 });
  }

  try {
    const newTimekeeping = await prismadb.timekeeping.create({
      data: {
        employeeID,
        timeIn: new Date(timeIn),
        timeOut: timeOut ? new Date(timeOut) : null,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ newTimekeeping }, { status: 200 });
  } catch (error) {
    const detail =
      error instanceof Error ? `${error.name}: ${error.message}` : JSON.stringify(error);
    console.log('[NEW_TIMEKEEPING_POST]', detail);
    return NextResponse.json({ error: 'Erreur serveur', detail }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }

  try {
    const timekeeping = await prismadb.timekeeping.findMany({
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(timekeeping, { status: 200 });
  } catch (error) {
    console.log('[TIMEKEEPING_GET]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}

//Update route
export async function PUT(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return new NextResponse('Unauthenticated', { status: 401 });
  }
  try {
    const body = await req.json();
    const userId = session.user.id;

    if (!body) {
      return new NextResponse('No form data', { status: 400 });
    }

    const {
      id,
      employeeID,
      timeIn,
      timeOut,
      verified,
    } = body;

    if (!id) {
      return new NextResponse('Timekeeping ID is required', { status: 400 });
    }

    const updatedTimekeeping = await prismadb.timekeeping.update({
      where: {
        id,
      },
      data: {
        employeeID,
        timeIn: new Date(timeIn),
        timeOut: timeOut ? new Date(timeOut) : null,
        verified,
      },
      include: {
        employee: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    return NextResponse.json({ updatedTimekeeping }, { status: 200 });
  } catch (error) {
    console.log('[TIMEKEEPING_PUT]', error);
    return new NextResponse('Internal error', { status: 500 });
  }
}
