"use client";

import type { FieldValues, Path, UseFormReturn } from "react-hook-form";
import { Div, FormField, Input, P, PhoneField } from "@/components/ui";

export function SchoolSupportFields<T extends FieldValues>({ form }: { form: UseFormReturn<T> }) {
  const n = (name: string) => name as Path<T>;
  const errors = form.formState.errors as Record<string, { message?: string } | undefined>;
  return (
    <Div type="col" gap="md">
      <P color="muted">Support contact</P>
      <P color="muted" className="text-xs">
        Shown only to this school — in the sidebar, header and parent app — as their help line.
      </P>
      <FormField label="Support person / team name" error={errors.support_name?.message}>
        <Input placeholder="e.g. Priya — Customer Success" {...form.register(n("support_name"))} />
      </FormField>
      <Div type="grid" cols={2} gap="md">
        <PhoneField
          label="Support number"
          dialCodeProps={form.register(n("support_dial_code"))}
          phoneProps={form.register(n("support_phone"))}
          phoneError={errors.support_phone?.message}
        />
        <FormField label="Support email" error={errors.support_email?.message}>
          <Input type="email" placeholder="help@yourcompany.com" {...form.register(n("support_email"))} />
        </FormField>
      </Div>
    </Div>
  );
}
