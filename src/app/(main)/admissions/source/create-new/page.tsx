"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useAdmissionSourceDetail } from "@/hooks/useAdmissions";
import { AdmissionSourcesService } from "@/services/admissions.service";
import type { AdmissionSourceFormValues } from "@/lib/validations/admissions.validation";
import {
  Div, H1, H2, Button, Input, FormField, Spinner,
} from "@/components/ui";

function CreateAdmissionSourceContent() {
  const router = useRouter();
  const { form, isSubmitting } = useAdmissionSourceDetail("create-new");
  const { register, formState: { errors }, handleSubmit } = form;

  async function onSubmit(values: AdmissionSourceFormValues) {
    const payload = {
      ...values,
      start_date: values.start_date || undefined,
      end_date: values.end_date || undefined,
    };
    const created = await AdmissionSourcesService.create(payload);
    toast.success(`"${created.name}" created`);
    router.push("/admissions/source");
  }

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </Button>
        <H1>New Admission Source</H1>
      </Div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Div type="col" gap="lg">
          <Div type="col" gap="md" className="rounded-xl border border-border bg-card p-5">
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Source Details
            </H2>

            <FormField label="Name *" error={errors.name?.message}>
              <Input placeholder="e.g. School Website, Word of Mouth" {...register("name")} />
            </FormField>

            <Div type="grid" cols={2} gap="md">
              <FormField label="Start Date" error={errors.start_date?.message}>
                <Input type="date" {...register("start_date")} />
              </FormField>
              <FormField label="End Date" error={errors.end_date?.message}>
                <Input type="date" {...register("end_date")} />
              </FormField>
            </Div>

            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_enabled"
                {...register("is_enabled")}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="is_enabled" className="text-sm font-medium text-foreground/80 cursor-pointer">
                Source is enabled (visible for new enquiries)
              </label>
            </Div>
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Create Source
            </Button>
          </Div>
        </Div>
      </form>
    </Div>
  );
}

export default function CreateAdmissionSourcePage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <CreateAdmissionSourceContent />
    </Suspense>
  );
}
