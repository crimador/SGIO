import { NextResponse } from 'next/server';
import { prismadb } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import nodemailer from 'nodemailer';

export async function POST(req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });
  if (!['DG', 'RH'].includes(session.user.userRole)) return new NextResponse('Forbidden', { status: 403 });

  const { employeeId } = await req.json();

  const [team, employee] = await Promise.all([
    prismadb.teams.findUnique({ where: { id: params.teamId } }),
    prismadb.employee.findUnique({ where: { id: employeeId } }),
  ]);

  await prismadb.teams.update({
    where: { id: params.teamId },
    data: { members: { connect: { id: employeeId } } },
  });

  if (employee?.email && team) {
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
          to: employee.email,
          subject: `Vous avez été ajouté à l'équipe "${team.name}"`,
          html: `
            <div style="font-family:sans-serif;max-width:560px;margin:auto">
              <h2 style="color:#1a1a1a">Bienvenue dans l'équipe <strong>${team.name}</strong> !</h2>
              <p>Bonjour ${employee.firstName},</p>
              <p>Vous venez d'être ajouté(e) à l'équipe <strong>${team.name}</strong> par ${session.user.name ?? 'un administrateur'}.</p>
              <p style="margin-top:24px">
                <a href="${appUrl}/fr/projects/teams/${params.teamId}"
                   style="background:#1a1a1a;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;display:inline-block">
                  Voir l'équipe
                </a>
              </p>
              <p style="color:#888;font-size:12px;margin-top:32px">${appName}</p>
            </div>
          `,
        });
      } catch (err) {
        console.error('Erreur envoi mail équipe:', err);
      }
    }
  }

  return NextResponse.json(team);
}

export async function DELETE(req: Request, { params }: { params: { teamId: string } }) {
  const session = await getServerSession(authOptions);
  if (!session) return NextResponse.json('Non autorisé', { status: 401 });
  if (!['DG', 'RH'].includes(session.user.userRole)) return new NextResponse('Forbidden', { status: 403 });

  const { employeeId } = await req.json();
  const team = await prismadb.teams.update({
    where: { id: params.teamId },
    data: { members: { disconnect: { id: employeeId } } },
  });
  return NextResponse.json(team);
}
