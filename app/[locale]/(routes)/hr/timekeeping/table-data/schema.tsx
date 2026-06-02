import { z } from 'zod';

const dateOrString = z.union([z.string(), z.date()]).transform((v) =>
  v instanceof Date ? v.toISOString() : v
);

export const timekeepingSchema = z.object({
  id: z.string(),
  createdAt: dateOrString,
  timeIn: dateOrString,
  timeOut: z.union([z.string(), z.date()]).nullable().transform((v) =>
    v instanceof Date ? v.toISOString() : v
  ),
  verified: z.boolean(),
  employee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
});

export type Timekeeping = z.infer<typeof timekeepingSchema>;
