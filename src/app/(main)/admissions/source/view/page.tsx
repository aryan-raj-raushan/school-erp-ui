"use client";

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil, X } from "lucide-react";
import { useAdmissionSourceDetail } from "@/hooks/useAdmissions";
import {
  Div,
  H1,
  H2,
  H3,
  P,
  Button,
  Input,
  Select,
  FormField,
  Badge,
  Spinner,
  InfoRow,
} from "@/components/ui";

function AdmissionSourceDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const startEditing = searchParams.get("edit") === "true";

  const isNew = !queryId;
  const resolvedId = queryId ?? undefined;

  const {
    source,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    handleSubmit,
    isSubmitting,
  } = useAdmissionSourceDetail(isNew ? "create-new" : resolvedId);

  useEffect(() => {
    if (startEditing && !isNew) setIsEditing(true);
  }, [startEditing, isNew, setIsEditing]);

  const {
    register,
    formState: { errors },
    reset,
    watch,
  } = form;
  const isEnabled = watch("is_enabled");

  async function onSubmit() {
    const result = await form.handleSubmit(async (values) => {
      const payload = {
        ...values,
        start_date: values.start_date || undefined,
        end_date: values.end_date || undefined,
      };
      const { AdmissionSourcesService } =
        await import("@/services/admissions.service");
      if (isNew) {
        const created = await AdmissionSourcesService.create(payload);
        const { toast } = await import("sonner");
        toast.success(`"${created.name}" created`);
        router.push("/admissions/source");
      } else {
        await AdmissionSourcesService.update(resolvedId!, payload);
        const { toast } = await import("sonner");
        toast.success("Source updated");
        setIsEditing(false);
      }
    })();
    return result;
  }

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft size={16} /> Back
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <H1>
              {isNew
                ? "New Admission Source"
                : (source?.name ?? "Source Details")}
            </H1>
            {!isNew && source && (
              <Badge variant={source.is_enabled ? "success" : "default"}>
                {source.is_enabled ? "Enabled" : "Disabled"}
              </Badge>
            )}
          </Div>
        </Div>
        {!isNew &&
          (isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsEditing(false);
                reset();
              }}
            >
              <X size={14} /> Cancel
            </Button>
          ) : (
            <Button size="sm" onClick={() => setIsEditing(true)}>
              <Pencil size={14} /> Edit
            </Button>
          ))}
      </Div>

      {/* View Mode */}
      {!isEditing && !isNew && source && (
        <Div
          type="col"
          gap="sm"
          className="rounded-xl border border-border bg-card p-5"
        >
          <H3
            color="muted"
            className="uppercase tracking-wider text-xs font-semibold mb-2"
          >
            Details
          </H3>
          <InfoRow label="Name" value={source.name} />
          <InfoRow
            label="Status"
            value={source.is_enabled ? "Enabled" : "Disabled"}
          />
          <InfoRow
            label="Start Date"
            value={
              source.start_date
                ? new Date(source.start_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <InfoRow
            label="End Date"
            value={
              source.end_date
                ? new Date(source.end_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })
                : "—"
            }
          />
          <InfoRow
            label="Created"
            value={new Date(source.created_at).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          />
        </Div>
      )}

      {/* Form */}
      {(isEditing || isNew) && (
        <form onSubmit={form.handleSubmit(onSubmit as any)}>
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
                  placeholder="e.g. School Website, Word of Mouth, Newspaper Ad"
                  {...register("name")}
                />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField
                  label="Start Date"
                  error={errors.start_date?.message}
                >
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
                onClick={() =>
                  isNew ? router.back() : (setIsEditing(false), reset())
                }
              >
                Cancel
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {isNew ? "Create Source" : "Save Changes"}
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}

function AdmissionSourceDetailPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-20"><span>Loading...</span></div>}>
      <AdmissionSourceDetailContent />
    </Suspense>
  );
}

export default AdmissionSourceDetailPage;
