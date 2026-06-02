import { z } from 'zod';

const dateOrString = z.union([z.string(), z.date()]).transform((v) =>
  v instanceof Date ? v.toISOString() : v
);

export const payslipSchema = z.object({
  id: z.string(),
  employeeID: z.string(),
  employee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    position: z.string().nullable().optional(),
  }),
  period: z.string(),
  baseSalary: z.coerce.number(),
  bonuses: z.coerce.number(),
  deductions: z.coerce.number(),
  netSalary: z.coerce.number(),
  status: z.enum(['BROUILLON', 'EMIS', 'PAYE']),
  notes: z.string().nullable().optional(),
  createdAt: dateOrString.optional(),
});

export type Payslip = z.infer<typeof payslipSchema>;
