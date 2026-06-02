import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function PATCH(req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });
  if (session.user.userRole !== 'DG') return new NextResponse('Forbidden', { status: 403 });

  const body = await req.json();
  const data: any = {};

  if (body.name !== undefined) data.name = body.name;

  if (body.responsibleId !== undefined) {
    if (body.responsibleId) {
      // #3 — Validation : le responsable doit être membre de l'équipe
      const team = await prismadb.teams.findUnique({
        where: { id: params.teamId },
        include: { members: { select: { id: true } } },
      });
      const isMember = team?.members.some((m) => m.id === body.responsibleId);
      if (!isMember) {
        return NextResponse.json(
          'Le responsable doit être membre de l\'équipe.',
          { status: 400 }
        );
      }
      data.responsible = { connect: { id: body.responsibleId } };
    } else {
      data.responsible = { disconnect: true };
    }
  }

  const updated = await prismadb.teams.update({
    where: { id: params.teamId },
    data,
    include: { responsible: { select: { firstName: true, lastName: true, email: true } } },
  });

  // #2 — Email au nouveau responsable
  if (body.responsibleId && updated.responsible?.email) {
    const gmailUser = process.env.GMAIL_USER;
    const gmailPass = process.env.GMAIL_APP_PASSWORD;
    const appName = process.env.NEXT_PUBLIC_APP_NAME ?? 'KEKELI GROUP';
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';

    if (gmailUser && gmailPass) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: { user: gmailUser, pass: gmailPass },
        });
        await transporter.sendMail({
          from: `${appName} <${gmailUser}>`,
          to: updated.responsible.email,
          subject: `Vous êtes maintenant responsable de l'équipe "${updated.name}"`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:auto">
              <h2 style="color:#1a1a1a">Responsable d'équipe — <strong>${updated.name}</strong></h2>
              <p>Bonjour ${updated.responsible.firstName},</p>
              <p>${session.user.name ?? 'Un administrateur'} vous a désigné(e) comme <strong>responsable de l'équipe ${updated.name}</strong>.</p>
              <p>En tant que responsable, vous pouvez créer des tâches et les assigner aux membres de votre équipe.</p>
              <p style="margin-top:24px">
                <a href="${appUrl}/fr/projects/teams/${params.teamId}"
                   style="background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
                  Accéder à l'équipe
                </a>
              </p>
              <p style="color:#888;font-size:12px;margin-top:32px">${appName}</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Erreur email responsable:', err);
      }
    }
  }

  return NextResponse.json(updated);
}

export async function DELETE(_req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });
  if (session.user.userRole !== 'DG') return new NextResponse('Forbidden', { status: 403 });

  await prismadb.teams.delete({ where: { id: params.teamId } });
  return NextResponse.json({ success: true });
}
