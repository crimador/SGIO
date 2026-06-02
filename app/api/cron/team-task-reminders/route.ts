import { NextResponse } from 'next/server';
import { sendTeamTaskReminders } from '@/actions/cron/team-task-reminders';

// Appeler via un cron externe (ex: Vercel Cron, cron-job.org) chaque matin
// GET /api/cron/team-task-reminders?secret=CRON_SECRET
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const secret = searchParams.get('secret');

  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json('Non autorisé', { status: 401 });
  }

  await sendTeamTaskReminders();
  return NextResponse.json({ ok: true, sentAt: new Date().toISOString() });
}
