import { z } from 'zod';

export const taskSchema = z.object({
  id: z.string(),
  document_name: z.string(),
  document_file_url: z.string(),
  document_file_mimeType: z.string(),
  createdAt: z.date().nullable().optional(),
  document_system_type: z.string().nullable().optional(),
  size: z.number().nullable().optional(),
  created_by: z
    .object({ name: z.string().nullable() })
    .nullable()
    .optional(),
  accounts: z
    .array(z.object({ id: z.string(), name: z.string() }))
    .optional()
    .default([]),
  tasks: z
    .array(z.object({ id: z.string(), title: z.string() }))
    .optional()
    .default([]),
});

export type Task = z.infer<typeof taskSchema>;
