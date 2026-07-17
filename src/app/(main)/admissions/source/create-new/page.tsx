"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { useAdmissionSourceDetail } from "@/hooks/useAdmissions";
import {
  Div,
  H2,
  Button,
  Input,
  FormField,
  Spinner,
  PageHeader,
  type PageHeaderConfig,
  DatePicker,
} from "@/components/ui";

function CreateAdmissionSourceContent() {
  const router = useRouter();
  const { form, isSubmitting, onSubmit } =
    useAdmissionSourceDetail("create-new");
  const {
    register,
    watch,
    setValue,
    formState: { errors },
    handleSubmit,
  } = form;

  const pageHeaderConfig: PageHeaderConfig = {
    title: "New Admission Source",
    backButton: true,
  };

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <PageHeader {...pageHeaderConfig} />

      <form onSubmit={handleSubmit(onSubmit)}>
        <Div type="col" gap="lg">
          <Div
            type="col"
            gap="md"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Source Details
            </H2>

            <FormField label="Name *" error={errors.name?.message}>
              <Input
                placeholder="e.g. School Website, Word of Mouth"
                {...register("name")}
              />
            </FormField>

            <Div type="grid" cols={2} gap="md">
              <FormField label="Start Date" error={errors.start_date?.message}>
                <DatePicker
                  value={watch("start_date")}
                  onChange={(v) => setValue("start_date", v)}
                />
              </FormField>
              <FormField label="End Date" error={errors.end_date?.message}>
                <DatePicker
                  value={watch("end_date")}
                  onChange={(v) => setValue("end_date", v)}
                />
              </FormField>
            </Div>

            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_enabled"
                {...register("is_enabled")}
                className="h-4 w-4 rounded border-border"
              />
              <label
                htmlFor="is_enabled"
                className="text-sm font-medium text-foreground/80 cursor-pointer"
              >
                Source is enabled (visible for new enquiries)
              </label>
            </Div>
          </Div>

          <Div type="row" justify="end" gap="sm">
            <Button
              variant="outline"
              type="button"
              onClick={() => router.back()}
            >
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
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <CreateAdmissionSourceContent />
    </Suspense>
  );
}
