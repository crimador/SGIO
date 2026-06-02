import { z } from 'zod';

const dateOrString = z.union([z.string(), z.date()]).transform((v) =>
  v instanceof Date ? v.toISOString() : v
);

const nullableDateOrString = z.union([z.string(), z.date()]).nullable().transform((v) =>
  v instanceof Date ? v.toISOString() : v
);

export const requestSchema = z.object({
  id: z.string(),
  employeeID: z.string(),
  employee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    position: z.string().nullable().optional(),
    onBoarding: nullableDateOrString.optional(),
  }),
  type: z.string(),
  status: z.enum(['EN_ATTENTE', 'APPROUVE', 'REJETE']),
  message: z.string(),
  startDate: dateOrString,
  endDate: nullableDateOrString.optional(),
  numberOfDays: z.number().nullable().optional(),
  requestedAmount: z.coerce.number().nullable().optional(),
  documentType: z.string().nullable().optional(),
  legalDays: z.number().nullable().optional(),
  returnedAt: nullableDateOrString.optional(),
  createdAt: dateOrString.optional(),
});

export type Request = z.infer<typeof requestSchema>;
