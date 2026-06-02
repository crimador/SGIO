import { authOptions } from '@/lib/auth';
import { openAiHelper } from '@/lib/openai';
import { canAccess } from '@/lib/permissions';
import { prismadb } from '@/lib/prisma';
import { OpenAIStream, StreamingTextResponse } from 'ai';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { getServerSession } from 'next-auth';
import type { UserRole } from '@/lib/permissions';

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) return new Response('Unauthorized', { status: 401 });

  const openai = await openAiHelper(session.user.id);
  if (!openai) return new Response('No openai key found', { status: 500 });

  const userRole = (session.user.userRole ?? 'COMMERCIAL') as UserRole;

  const { messages } = await req.json();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const billingClientSelect = {
    crmAccount: { select: { name: true } },
    occasionalClient: { select: { name: true } },
  };

  // Tout en parallèle — le filtre par module se fait sur le prompt, pas sur les requêtes
  const [
    enabledModules,
    // CRM
    crmTasks,
    opportunities,
    accounts,
    leads,
    contacts,
    // Facturation OHADA
    recentDocs,
    overdueDocs,
    pendingQuotes,
    // Projets
    projectBoards,
    projectTasks,
    // RH
    employees,
    teams,
    hrRequests,
    paySlips,
    timekeeping,
    // Finance
    expenses,
    treasuryAccounts,
    // GPT model admin
    activeModel,
  ] = await Promise.all([
    // ── Modules activés ───────────────────────────────────────────────────
    prismadb.system_Modules_Enabled.findMany({ select: { name: true, enabled: true } }),

    // ── CRM ──────────────────────────────────────────────────────────────
    prismadb.crm_Accounts_Tasks.findMany({
      where: { user: session.user.id },
      orderBy: { dueDateAt: 'asc' },
      take: 20,
      include: { crm_accounts: { select: { name: true } } },
    }),
    prismadb.crm_Opportunities.findMany({
      where: { assigned_to: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { assigned_account: { select: { name: true } } },
    }),
    prismadb.crm_Accounts.findMany({
      where: { assigned_to: session.user.id },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { name: true, status: true, type: true, industry: true },
    }),
    prismadb.crm_Leads.findMany({
      where: { assigned_to: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        firstName: true,
        lastName: true,
        company: true,
        status: true,
        email: true,
        lead_source: true,
        createdAt: true,
      },
    }),
    prismadb.crm_Contacts.findMany({
      where: { assigned_to: session.user.id },
      orderBy: { createdAt: 'desc' },
      take: 15,
      select: {
        first_name: true,
        last_name: true,
        position: true,
        email: true,
        office_phone: true,
        status: true,
        assigned_accounts: { select: { name: true } },
      },
    }),

    // ── Facturation OHADA ─────────────────────────────────────────────────
    prismadb.billingDocument.findMany({
      orderBy: { issueDate: 'desc' },
      take: 15,
      select: {
        number: true,
        type: true,
        status: true,
        totalTTC: true,
        issueDate: true,
        dueDate: true,
        paidAt: true,
        ...billingClientSelect,
        payments: { select: { amount: true } },
      },
    }),
    prismadb.billingDocument.findMany({
      where: {
        type: 'FACTURE',
        dueDate: { lt: today },
        status: { notIn: ['PAYE', 'ANNULE'] },
      },
      orderBy: { dueDate: 'asc' },
      select: {
        number: true,
        status: true,
        totalTTC: true,
        dueDate: true,
        ...billingClientSelect,
        payments: { select: { amount: true } },
      },
    }),
    prismadb.billingDocument.findMany({
      where: {
        type: 'DEVIS',
        status: { notIn: ['ACCEPTE', 'REFUSE', 'ANNULE'] },
      },
      orderBy: { issueDate: 'desc' },
      take: 10,
      select: {
        number: true,
        status: true,
        totalTTC: true,
        issueDate: true,
        dueDate: true,
        ...billingClientSelect,
      },
    }),

    // ── Projets ───────────────────────────────────────────────────────────
    prismadb.boards.findMany({
      where: {
        OR: [{ user: session.user.id }, { sharedWith: { has: session.user.id } }],
      },
      orderBy: { updatedAt: 'desc' },
      take: 10,
      select: { title: true, description: true, visibility: true },
    }),
    prismadb.tasks.findMany({
      where: { user: session.user.id, taskStatus: { not: 'COMPLETE' } },
      orderBy: { dueDateAt: 'asc' },
      take: 20,
      select: {
        title: true,
        priority: true,
        taskStatus: true,
        dueDateAt: true,
        assigned_section: { select: { title: true } },
      },
    }),

    // ── RH / Employés ────────────────────────────────────────────────────
    prismadb.employee.findMany({
      orderBy: { createdAt: 'asc' },
      take: 30,
      select: {
        firstName: true,
        lastName: true,
        role: true,
        position: true,
        email: true,
        onBoarding: true,
      },
    }),
    prismadb.teams.findMany({
      select: {
        name: true,
        responsible: { select: { firstName: true, lastName: true } },
        members: { select: { firstName: true, lastName: true } },
      },
    }),
    prismadb.request.findMany({
      where: { status: 'EN_ATTENTE' },
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        type: true,
        status: true,
        startDate: true,
        endDate: true,
        numberOfDays: true,
        message: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    }),
    prismadb.paySlip.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        period: true,
        baseSalary: true,
        bonuses: true,
        deductions: true,
        netSalary: true,
        status: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    }),
    prismadb.timekeeping.findMany({
      orderBy: { timeIn: 'desc' },
      take: 30,
      select: {
        timeIn: true,
        timeOut: true,
        verified: true,
        employee: { select: { firstName: true, lastName: true } },
      },
    }),

    // ── Finance ───────────────────────────────────────────────────────────
    prismadb.expense.findMany({
      orderBy: { date: 'desc' },
      take: 15,
      select: {
        description: true,
        amount: true,
        category: true,
        date: true,
        paymentMethod: true,
        account: { select: { name: true } },
      },
    }),
    prismadb.treasuryAccount.findMany({
      where: { isActive: true },
      select: {
        name: true,
        type: true,
        currency: true,
        entries: { select: { type: true, amount: true } },
      },
    }),

    // ── Modèle GPT admin ─────────────────────────────────────────────────
    prismadb.gpt_models.findFirst({
      where: { status: 'ACTIVE' },
      select: { model: true },
    }),
  ]);

  // ── Helpers ──────────────────────────────────────────────────────────────
  const isEnabled = (name: string, module: Parameters<typeof canAccess>[1]) =>
    (enabledModules.find((m) => m.name === name)?.enabled ?? false) &&
    canAccess(userRole, module);

  const fmt = (d: Date | null | undefined) =>
    d ? format(d, 'dd MMM yyyy', { locale: fr }) : '—';

  const fmtTime = (d: Date | null | undefined) =>
    d ? format(d, 'dd MMM yyyy HH:mm', { locale: fr }) : '—';

  const fmtAmount = (n: number) => n.toLocaleString('fr-FR') + ' FCFA';

  const billingClient = (doc: {
    crmAccount: { name: string } | null;
    occasionalClient: { name: string } | null;
  }) => doc.crmAccount?.name ?? doc.occasionalClient?.name ?? '—';

  const paidAmount = (payments: { amount: number }[]) =>
    payments.reduce((s, p) => s + p.amount, 0);

  // ── Formatage des sections ────────────────────────────────────────────────

  const crmTaskLines = crmTasks.map((t) => {
    const overdue =
      t.taskStatus !== 'COMPLETE' && t.dueDateAt && new Date(t.dueDateAt) < today
        ? ' ⚠ EN RETARD'
        : '';
    return `- [${t.taskStatus}] ${t.title} | Priorité: ${t.priority} | Compte: ${t.crm_accounts?.name ?? '—'} | Échéance: ${fmt(t.dueDateAt)}${overdue}`;
  });

  const oppLines = opportunities.map(
    (o) =>
      `- ${o.name ?? '(sans nom)'} | Compte: ${o.assigned_account?.name ?? '—'} | Stade: ${o.sales_stage ?? '—'} | Montant: ${o.expected_revenue.toLocaleString('fr-FR')} FCFA | Clôture: ${fmt(o.close_date)} | Statut: ${o.status}`
  );

  const accountLines = accounts.map(
    (a) =>
      `- ${a.name} | Type: ${a.type ?? '—'} | Statut: ${a.status ?? '—'} | Secteur: ${a.industry ?? '—'}`
  );

  const leadLines = leads.map(
    (l) =>
      `- ${l.firstName ?? ''} ${l.lastName} | Société: ${l.company ?? '—'} | Statut: ${l.status ?? '—'} | Source: ${l.lead_source ?? '—'} | Email: ${l.email ?? '—'}`
  );

  const contactLines = contacts.map(
    (c) =>
      `- ${c.first_name ?? ''} ${c.last_name} | Poste: ${c.position ?? '—'} | Compte: ${c.assigned_accounts?.name ?? '—'} | Email: ${c.email ?? '—'} | Tél: ${c.office_phone ?? '—'} | Actif: ${c.status ? 'Oui' : 'Non'}`
  );

  const docLines = recentDocs.map((d) => {
    const paid = paidAmount(d.payments);
    const reste = d.totalTTC - paid;
    const resteStr =
      reste > 0.01 && d.type === 'FACTURE' ? ` | Reste dû: ${fmtAmount(reste)}` : '';
    return `- [${d.type}] N°${d.number} | Client: ${billingClient(d)} | TTC: ${fmtAmount(d.totalTTC)} | Statut: ${d.status} | Émis: ${fmt(d.issueDate)} | Échéance: ${fmt(d.dueDate ?? undefined)}${resteStr}`;
  });

  const overdueLines = overdueDocs.map((d) => {
    const paid = paidAmount(d.payments);
    const reste = d.totalTTC - paid;
    return `- ⚠ N°${d.number} | Client: ${billingClient(d)} | TTC: ${fmtAmount(d.totalTTC)} | Reste dû: ${fmtAmount(reste)} | Échéance dépassée: ${fmt(d.dueDate ?? undefined)} | Statut: ${d.status}`;
  });

  const quoteLines = pendingQuotes.map(
    (d) =>
      `- N°${d.number} | Client: ${billingClient(d)} | Montant: ${fmtAmount(d.totalTTC)} | Statut: ${d.status} | Émis: ${fmt(d.issueDate)} | Validité: ${fmt(d.dueDate ?? undefined)}`
  );

  const boardLines = projectBoards.map(
    (b) => `- ${b.title} | Visibilité: ${b.visibility ?? '—'} | Desc: ${b.description}`
  );

  const projectTaskLines = projectTasks.map((t) => {
    const overdue =
      t.taskStatus !== 'COMPLETE' && t.dueDateAt && new Date(t.dueDateAt) < today
        ? ' ⚠ EN RETARD'
        : '';
    return `- [${t.taskStatus}] ${t.title} | Priorité: ${t.priority} | Section: ${t.assigned_section?.title ?? '—'} | Échéance: ${fmt(t.dueDateAt)}${overdue}`;
  });

  const employeeLines = employees.map(
    (e) =>
      `- ${e.firstName} ${e.lastName} | Rôle: ${e.role} | Poste: ${e.position ?? '—'} | Email: ${e.email} | Entrée: ${fmt(e.onBoarding ?? undefined)}`
  );

  const teamLines = teams.map(
    (t) =>
      `- ${t.name} | Responsable: ${t.responsible ? `${t.responsible.firstName} ${t.responsible.lastName}` : '—'} | Membres (${t.members.length}): ${t.members.map((m) => `${m.firstName} ${m.lastName}`).join(', ') || '—'}`
  );

  const requestLines = hrRequests.map(
    (r) =>
      `- ${r.employee.firstName} ${r.employee.lastName} | Type: ${r.type} | Du: ${fmt(r.startDate)} au ${fmt(r.endDate ?? undefined)} | Jours: ${r.numberOfDays ?? '—'} | Motif: ${r.message}`
  );

  const paySlipLines = paySlips.map(
    (p) =>
      `- ${p.employee.firstName} ${p.employee.lastName} | Période: ${p.period} | Salaire base: ${fmtAmount(p.baseSalary)} | Primes: ${fmtAmount(p.bonuses)} | Retenues: ${fmtAmount(p.deductions)} | Net: ${fmtAmount(p.netSalary)} | Statut: ${p.status}`
  );

  const timekeepingLines = timekeeping.map(
    (t) =>
      `- ${t.employee.firstName} ${t.employee.lastName} | Entrée: ${fmtTime(t.timeIn)} | Sortie: ${fmtTime(t.timeOut ?? undefined)} | Vérifié: ${t.verified ? 'Oui' : 'Non'}`
  );

  const expenseLines = expenses.map(
    (e) =>
      `- ${e.description} | Montant: ${fmtAmount(e.amount)} | Catégorie: ${e.category} | Date: ${fmt(e.date)} | Paiement: ${e.paymentMethod} | Compte: ${e.account?.name ?? '—'}`
  );

  const treasuryLines = treasuryAccounts.map((a) => {
    const balance = a.entries.reduce(
      (sum, e) => (e.type === 'ENTREE' ? sum + e.amount : sum - e.amount),
      0
    );
    return `- ${a.name} | Type: ${a.type} | Devise: ${a.currency} | Solde: ${fmtAmount(balance)}`;
  });

  // ── Construction du prompt — sections filtrées par modules activés ────────
  const sections: string[] = [];

  if (isEnabled('crm', 'crm')) {
    sections.push(
      `=== CRM — TÂCHES (${crmTasks.length}) ===\n${crmTaskLines.join('\n') || 'Aucune tâche assignée.'}`,
      `=== CRM — OPPORTUNITÉS (${opportunities.length}) ===\n${oppLines.join('\n') || 'Aucune opportunité assignée.'}`,
      `=== CRM — COMPTES (${accounts.length}) ===\n${accountLines.join('\n') || 'Aucun compte assigné.'}`,
      `=== CRM — LEADS (${leads.length}) ===\n${leadLines.join('\n') || 'Aucun lead assigné.'}`,
      `=== CRM — CONTACTS (${contacts.length}) ===\n${contactLines.join('\n') || 'Aucun contact assigné.'}`
    );
  }

  if (isEnabled('invoice', 'finance')) {
    sections.push(
      `=== FACTURATION OHADA — FACTURES EN RETARD (${overdueDocs.length}) ===\n${overdueLines.join('\n') || 'Aucune facture en retard.'}`,
      `=== FACTURATION OHADA — DEVIS EN ATTENTE (${pendingQuotes.length}) ===\n${quoteLines.join('\n') || 'Aucun devis en attente.'}`,
      `=== FACTURATION OHADA — DOCUMENTS RÉCENTS (${recentDocs.length}) ===\n${docLines.join('\n') || 'Aucun document trouvé.'}`
    );
  }

  if (isEnabled('projects', 'projects')) {
    sections.push(
      `=== PROJETS — TABLEAUX (${projectBoards.length}) ===\n${boardLines.join('\n') || 'Aucun tableau de projet.'}`,
      `=== PROJETS — TÂCHES EN COURS (${projectTasks.length}) ===\n${projectTaskLines.join('\n') || 'Aucune tâche de projet en cours.'}`
    );
  }

  if (isEnabled('employee', 'hr')) {
    sections.push(
      `=== RH — EMPLOYÉS (${employees.length}) ===\n${employeeLines.join('\n') || 'Aucun employé enregistré.'}`,
      `=== RH — ÉQUIPES (${teams.length}) ===\n${teamLines.join('\n') || 'Aucune équipe.'}`,
      `=== RH — DEMANDES EN ATTENTE (${hrRequests.length}) ===\n${requestLines.join('\n') || 'Aucune demande en attente.'}`,
      `=== RH — FICHES DE PAIE RÉCENTES (${paySlips.length}) ===\n${paySlipLines.join('\n') || 'Aucune fiche de paie.'}`,
      `=== RH — POINTAGE RÉCENT (${timekeeping.length}) ===\n${timekeepingLines.join('\n') || 'Aucun pointage enregistré.'}`
    );
  }

  if (isEnabled('finance', 'finance')) {
    sections.push(
      `=== FINANCE — DÉPENSES RÉCENTES (${expenses.length}) ===\n${expenseLines.join('\n') || 'Aucune dépense enregistrée.'}`,
      `=== FINANCE — TRÉSORERIE (${treasuryAccounts.length} compte(s)) ===\n${treasuryLines.join('\n') || 'Aucun compte de trésorerie actif.'}`
    );
  }

  const activeModuleNames = enabledModules
    .filter((m) => m.enabled)
    .map((m) => m.name)
    .join(', ');

  const roleLabels: Record<UserRole, string> = {
    DG: 'Directeur Général (accès total)',
    COMPTABLE: 'Comptable (Finance, CRM lecture seule, RH, Projets)',
    COMMERCIAL: 'Commercial (CRM, Projets, Documents)',
    RH: 'Responsable RH (RH, Projets, Documents)',
  };

  const systemPrompt = `Tu es un assistant ERP strictement dédié à KEKELI GROUP (Togo, OHADA, TVA 18%).
Tu aides l'utilisateur : ${session.user.name} (${session.user.email}).
Rôle : ${roleLabels[userRole]}.
Date du jour : ${format(new Date(), 'EEEE dd MMMM yyyy', { locale: fr })}.
Modules accessibles selon le rôle : ${activeModuleNames}.

RÈGLE ABSOLUE : Tu ne réponds QU'aux questions en lien direct avec les données des modules actifs ci-dessous. Si la question ne concerne pas ces données, réponds UNIQUEMENT par : "Je suis réservé aux questions liées à votre activité dans KEKELI GROUP. Je ne peux pas répondre à cette demande."
Ne fais aucune exception, même si l'utilisateur insiste ou reformule différemment.

Réponds toujours en français. Sois précis, concis et professionnel.
Les montants sont en FCFA. La numérotation des documents suit le format FAC/MM/AAAA/001, DEV/MM/AAAA/001, AVOIR/MM/AAAA/001.

${sections.join('\n\n')}`;

  const isGroq = !!process.env.GROQ_API_KEY && !process.env.OPENAI_API_KEY;
  const model = isGroq ? 'llama-3.3-70b-versatile' : (activeModel?.model ?? 'gpt-4o-mini');

  const response = await openai.chat.completions.create({
    model,
    stream: true,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
    max_tokens: 2000,
  });

  const stream = OpenAIStream(response);
  return new StreamingTextResponse(stream);
}
