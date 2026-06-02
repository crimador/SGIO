import { z } from 'zod';

export const campaignSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string().optional().nullable(),
  status: z.string().optional().nullable(),
});

export type Campaign = z.infer<typeof campaignSchema>;
