import { z } from 'zod';

// We're keeping a simple non-relational schema here.
// IRL, you will have a schema for your data models.
export const timekeepingSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  timeIn: z.string(),
  timeOut: z.string().nullable(),
  verified: z.boolean(),
  employee: z.object({
    firstName: z.string(),
    lastName: z.string(),
    email: z.string(),
  }),
});

export type Timekeeping = z.infer<typeof timekeepingSchema>;
