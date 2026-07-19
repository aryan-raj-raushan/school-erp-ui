import { z } from 'zod';

const toOptionalNumber = z.preprocess(
  (v) => (v === '' || v == null ? undefined : Number(v)),
  z.number().positive().optional(),
);

// A ResponsiveSelect that's untouched (or was hidden then never re-selected)
// submits its native <select>'s default value, which is "" — not undefined.
// z.enum(...).optional() only tolerates undefined, so plain "" fails validation
// even though it really just means "nothing chosen". These wrappers normalize
// "" to undefined (optional) or to the given default before the enum check
// runs — built around an already-constructed z.enum(...) (rather than a raw
// string array) so the literal union type is preserved through to z.infer.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function optionalEnum<T extends z.ZodEnum<any>>(schema: T) {
  return z.preprocess((v) => (v === '' ? undefined : v), schema.optional());
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function enumWithDefault<T extends z.ZodEnum<any>>(schema: T, fallback: z.infer<T>) {
  return z.preprocess((v) => (v === '' || v == null ? fallback : v), schema);
}

const subscriptionFields = {
  school_id: z.string().min(1, 'School is required'),
  plan_id: z.string().optional(),
  plan_name: z.string().optional(),
  plan_type: optionalEnum(z.enum(['MONTHLY', 'QUARTERLY', 'HALF_YEARLY', 'ANNUAL', 'CUSTOM'])),
  billing_model: optionalEnum(z.enum(['FLAT', 'PER_STUDENT'])),
  amount: toOptionalNumber,
  price_per_student: toOptionalNumber,
  currency: z.string().default('INR'),
  max_students: toOptionalNumber,
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  is_trial: z.boolean().default(false),
  auto_renew: z.boolean().default(false),
  grace_period_days: toOptionalNumber,
  restriction_mode: enumWithDefault(z.enum(['NONE', 'SOFT', 'PARTIAL', 'COMPLETE']), 'NONE'),
  restricted_resources: z.array(z.string()).default([]),
  payment_methods_allowed: z.array(z.string()).default([]),
};

export const createSubscriptionSchema = z.object(subscriptionFields).superRefine((data, ctx) => {
  if (data.plan_id) return;
  if (!data.plan_name) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['plan_name'], message: 'Plan name is required' });
  }
  if (!data.plan_type) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['plan_type'], message: 'Billing cycle is required' });
  }
  if (!data.billing_model) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['billing_model'], message: 'Billing model is required' });
    return;
  }
  if (data.billing_model === 'FLAT' && data.amount == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['amount'], message: 'Amount is required' });
  }
  if (data.billing_model === 'PER_STUDENT' && data.price_per_student == null) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['price_per_student'], message: 'Price per student is required' });
  }
});

export type CreateSubscriptionFormValues = z.infer<typeof createSubscriptionSchema>;
