import { z } from 'zod';

// ─── Generate Report Card ─────────────────────────────────────────────────────

export const generateReportCardSchema = z.object({
  exam_id: z.string().uuid('Please select an exam'),
  class_id: z.string().uuid('Please select a class'),
  section_id: z.string().uuid().optional().or(z.literal('')),
  student_id: z.string().uuid().optional().or(z.literal('')),
  remarks: z.string().max(500, 'Max 500 characters').optional(),
  scope: z.enum(['class', 'student']),
});

export type GenerateReportCardFormValues = z.infer<typeof generateReportCardSchema>;

// ─── Publish Results ──────────────────────────────────────────────────────────

export const publishResultSchema = z.object({
  exam_id: z.string().uuid('Please select an exam'),
  class_id: z.string().uuid().optional().or(z.literal('')),
  section_id: z.string().uuid().optional().or(z.literal('')),
  is_published: z.boolean(),
});

export type PublishResultFormValues = z.infer<typeof publishResultSchema>;

// ─── Mark Entry (single cell — internal, no form submit) ─────────────────────
// Actual validation is inline in the table; this schema is used for
// the "Enter Marks" filter selection form on the list page.

export const markFilterSchema = z.object({
  academic_year_id: z.string().uuid('Please select an academic year'),
  exam_id: z.string().uuid('Please select an exam'),
  class_id: z.string().uuid('Please select a class'),
  section_id: z.string().uuid().optional().or(z.literal('')),
});

export type MarkFilterFormValues = z.infer<typeof markFilterSchema>;
