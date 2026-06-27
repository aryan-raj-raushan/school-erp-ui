"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { useExamGradingDetail } from "@/hooks/exam/useExamGrading";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div, Button, Spinner, FormField, Input, Textarea,
} from "@/components/ui";
import { GRADING_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

export function GradingFormContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    grade, isLoading, isNew, isEditing, setIsEditing,
    form, isSubmitting, onSubmit,
  } = useExamGradingDetail(slug);

  const { register, formState: { errors } } = form;

  useEffect(() => {
    if (isEditMode) setIsEditing(true);
  }, [isEditMode, setIsEditing]);

  if (isLoading) {
    return <Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>;
  }

  const isReadOnly = !isEditing;

  return (
    <Div type="col" gap="lg" className="max-w-2xl">
      <PageHeader
        title={isNew ? "Add Grade" : `Grade – ${grade?.grade_name ?? ""}`}
        subtitle={!isNew ? `Sequence: #${grade?.sequence_index}` : ""}
        actions={
          <Div type="row" gap="sm" align="center">
            <Button variant="outline" size="sm" onClick={() => router.push(EXAM_ROUTES.grading.list)}>
              <ArrowLeft size={14} /> {GRADING_PAGE.buttons.back}
            </Button>
            {!isNew && !isEditing && (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil size={14} /> {GRADING_PAGE.buttons.edit}
              </Button>
            )}
            {isEditing && !isNew && (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                {GRADING_PAGE.buttons.cancel}
              </Button>
            )}
          </Div>
        }
      />

      <form onSubmit={onSubmit}>
        <Div variant="card" className="p-6">
          <Div type="col" gap="md">
            <Div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <FormField label={GRADING_PAGE.labels.gradeName + " *"} error={errors.grade_name?.message}>
                <Input {...register("grade_name")} placeholder="e.g. A+" disabled={isReadOnly} />
              </FormField>

              <FormField label={GRADING_PAGE.labels.sequenceIndex} error={errors.sequence_index?.message}>
                <Input {...register("sequence_index")} type="number" min={0} placeholder="1" disabled={isReadOnly} />
              </FormField>

              <FormField label={GRADING_PAGE.labels.fromPercentage + " *"} error={errors.from_percentage?.message}>
                <Input {...register("from_percentage")} type="number" min={0} max={100} step="0.01"
                  placeholder="e.g. 90" disabled={isReadOnly} />
              </FormField>

              <FormField label={GRADING_PAGE.labels.toPercentage + " *"} error={errors.to_percentage?.message}>
                <Input {...register("to_percentage")} type="number" min={0} max={100} step="0.01"
                  placeholder="e.g. 100" disabled={isReadOnly} />
              </FormField>
            </Div>

            <FormField label={GRADING_PAGE.labels.description}>
              <Textarea {...register("description")} rows={3} placeholder="Optional description" disabled={isReadOnly} />
            </FormField>

            <Div type="row" align="center" gap="sm">
              <input type="checkbox" id="is_enabled" {...register("is_enabled")}
                className="h-4 w-4 rounded border-border" disabled={isReadOnly} />
              <label htmlFor="is_enabled" className="text-sm text-foreground">
                {GRADING_PAGE.labels.isEnabled}
              </label>
            </Div>

            {isEditing && (
              <Div type="row" gap="md" className="pt-2">
                <Button type="button" variant="outline"
                  onClick={() => isNew ? router.push(EXAM_ROUTES.grading.list) : setIsEditing(false)}>
                  {GRADING_PAGE.buttons.cancel}
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {GRADING_PAGE.buttons.save}
                </Button>
              </Div>
            )}
          </Div>
        </Div>
      </form>
    </Div>
  );
}
