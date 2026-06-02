import { prismadb } from '@/lib/prisma';

export const getExpenses = async () => {
  try {
    const expenses = await prismadb.expense.findMany({
      include: {
        account: {
          select: { name: true },
        },
        treasuryAccount: {
          select: { name: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });
    return expenses;
  } catch (error) {
    console.error('[EXPENSES_GET]', error);
    return [];
  }
};

export const createExpense = async (data: any) => {
  try {
    const expense = await prismadb.expense.create({ data });
    return expense;
  } catch (error) {
    console.error('[EXPENSE_CREATE]', error);
    throw error;
  }
};

export const updateExpense = async (id: string, data: any) => {
  try {
    const expense = await prismadb.expense.update({ where: { id }, data });
    return expense;
  } catch (error) {
    console.error('[EXPENSE_UPDATE]', error);
    throw error;
  }
};

export const deleteExpense = async (id: string) => {
  try {
    await prismadb.expense.delete({ where: { id } });
    return true;
  } catch (error) {
    console.error('[EXPENSE_DELETE]', error);
    throw error;
  }
};
