import { z } from 'zod';

const toOptionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().positive().optional(),
);

// An untouched ResponsiveSelect submits its native <select>'s default value,
// which is "" — not undefined. A plain z.enum(...) with a defaultValues-driven
// "default" selection rejects "" outright since it's not a real member, even
// though the user never had to touch the field. Normalize "" to the intended
// default before the enum check runs — built around an already-constructed
// z.enum(...) (rather than a raw string array) so the literal union type is
// preserved through to z.infer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enumWithDefault<T extends z.ZodEnum<any>>(schema: T, fallback: z.infer<T>) {
  return z.preprocess((v) => (v === '' || v == null ? fallback : v), schema);
}

const planFields = {
  name: z.string().min(1, 'Plan name is required'),
  billing_model: enumWithDefault(z.enum(['FLAT', 'PER_STUDENT']), 'FLAT'),
  flat_amount: toOptionalNumber,
  price_per_student: toOptionalNumber,
  billing_cycle: enumWithDefault(z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'CUSTOM']), 'MONTHLY'),
  is_active: z.boolean().default(true),
};

export const createSubscriptionPlanSchema = z.object(planFields).superRefine((data, ctx) => {
  if (data.billing_model === 'FLAT' && data.flat_amount == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['flat_amount'], message: 'Flat amount is required' });
  }
  if (data.billing_model === 'PER_STUDENT' && data.price_per_student == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price_per_student'], message: 'Price per student is required' });
  }
});

export type CreateSubscriptionPlanFormValues = z.infer<typeof createSubscriptionPlanSchema>;

export const updateSubscriptionPlanSchema = z.object(planFields).partial();
export type UpdateSubscriptionPlanFormValues = z.infer<typeof updateSubscriptionPlanSchema>;
