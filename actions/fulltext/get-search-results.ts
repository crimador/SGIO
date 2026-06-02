import { prismadb } from '@/lib/prisma';

export const getSearch = async (search: string) => {
  if (!search?.trim()) return { data: {} };

  const [
    opportunities, accounts, contacts, leads,
    billingDocuments, employees, users, tasks, projects,
  ] = await Promise.all([
    prismadb.crm_Opportunities.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, status: true, budget: true },
      take: 10,
    }),
    prismadb.crm_Accounts.findMany({
      where: {
        deletedAt: null,
        OR: [
          { name:        { contains: search, mode: 'insensitive' } },
          { email:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, type: true },
      take: 10,
    }),
    prismadb.crm_Contacts.findMany({
      where: {
        deletedAt: null,
        OR: [
          { first_name: { contains: search, mode: 'insensitive' } },
          { last_name:  { contains: search, mode: 'insensitive' } },
          { email:      { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, first_name: true, last_name: true, email: true },
      take: 10,
    }),
    prismadb.crm_Leads.findMany({
      where: {
        deletedAt: null,
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { company:   { contains: search, mode: 'insensitive' } },
          { email:     { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, company: true, status: true },
      take: 10,
    }),
    prismadb.billingDocument.findMany({
      where: {
        OR: [
          { number:           { contains: search, mode: 'insensitive' } },
          { crmAccount:       { name: { contains: search, mode: 'insensitive' } } },
          { occasionalClient: { name: { contains: search, mode: 'insensitive' } } },
        ],
      },
      select: {
        id: true, number: true, type: true, status: true, totalTTC: true,
        crmAccount:       { select: { name: true } },
        occasionalClient: { select: { name: true } },
      },
      take: 10,
    }),
    prismadb.employee.findMany({
      where: {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName:  { contains: search, mode: 'insensitive' } },
          { email:     { contains: search, mode: 'insensitive' } },
          { position:  { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, firstName: true, lastName: true, email: true, position: true },
      take: 10,
    }),
    prismadb.users.findMany({
      where: {
        OR: [
          { name:         { contains: search, mode: 'insensitive' } },
          { email:        { contains: search, mode: 'insensitive' } },
          { username:     { contains: search, mode: 'insensitive' } },
          { account_name: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, name: true, email: true, username: true },
      take: 10,
    }),
    prismadb.tasks.findMany({
      where: {
        OR: [
          { title:   { contains: search, mode: 'insensitive' } },
          { content: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true, taskStatus: true },
      take: 10,
    }),
    prismadb.boards.findMany({
      where: {
        OR: [
          { title:       { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
        ],
      },
      select: { id: true, title: true },
      take: 10,
    }),
  ]);

  return {
    data: { opportunities, accounts, contacts, leads, billingDocuments, employees, users, tasks, projects },
  };
};
