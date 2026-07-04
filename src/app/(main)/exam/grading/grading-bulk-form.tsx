"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, Trash2, Wand2 } from "lucide-react";
import { useExamGradingBulkForm } from "@/hooks/exam/useExamGrading";
import { PageHeader } from "@/components/ui/page-header";
import { Div, Button, FormField, Input, Textarea } from "@/components/ui";
import { GRADING_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

export function GradingBulkFormContent() {
  const router = useRouter();
  const {
    form, gradesField, isSubmitting, onSubmit, addGradeRow, removeGradeRow, autoGenerate,
  } = useExamGradingBulkForm();

  const { register, formState: { errors } } = form;

  return (
    <Div type="col" gap="lg" className="max-w-4xl">
      <PageHeader
        title="Add Grades"
        subtitle="Create all grade bands for this school in one go"
        actions={
          <Div type="row" gap="sm" align="center">
            <Button variant="outline" size="sm" onClick={() => router.push(EXAM_ROUTES.grading.list)}>
              <ArrowLeft size={14} /> {GRADING_PAGE.buttons.back}
            </Button>
            <Button type="button" size="sm" variant="outline" onClick={autoGenerate}>
              <Wand2 size={14} /> Auto Generate
            </Button>
          </Div>
        }
      />

      <form onSubmit={onSubmit}>
        <Div type="col" gap="sm">
          {gradesField.fields.map((field, i) => {
            const rowErrors = errors.grades?.[i];
            return (
              <Div key={field.id} variant="card" className="p-4">
                <Div type="row" justify="between" align="center" className="mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Grade {i + 1}</span>
                  {gradesField.fields.length > 1 && (
                    <Button size="icon-xs" type="button" variant="destructive" onClick={() => removeGradeRow(i)}>
                      <Trash2 size={12} />
                    </Button>
                  )}
                </Div>
                <Div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <FormField label={GRADING_PAGE.labels.gradeName + " *"} error={rowErrors?.grade_name?.message}>
                    <Input {...register(`grades.${i}.grade_name`)} placeholder="e.g. A+" />
                  </FormField>
                  <FormField label={GRADING_PAGE.labels.fromPercentage + " *"} error={rowErrors?.from_percentage?.message}>
                    <Input {...register(`grades.${i}.from_percentage`)} type="number" min={0} max={100} step="0.01" placeholder="e.g. 90" />
                  </FormField>
                  <FormField label={GRADING_PAGE.labels.toPercentage + " *"} error={rowErrors?.to_percentage?.message}>
                    <Input {...register(`grades.${i}.to_percentage`)} type="number" min={0} max={100} step="0.01" placeholder="e.g. 100" />
                  </FormField>
                  <FormField label={GRADING_PAGE.labels.sequenceIndex}>
                    <Input {...register(`grades.${i}.sequence_index`)} type="number" min={0} />
                  </FormField>
                </Div>
                <FormField label={GRADING_PAGE.labels.description} className="mt-3">
                  <Textarea {...register(`grades.${i}.description`)} rows={2} placeholder="Optional description" />
                </FormField>
              </Div>
            );
          })}
        </Div>

        <Button type="button" variant="outline" size="sm" className="w-fit mt-3" onClick={addGradeRow}>
          <Plus size={14} /> Add Grade
        </Button>

        <Div type="row" gap="md" className="pt-4">
          <Button type="button" variant="outline" onClick={() => router.push(EXAM_ROUTES.grading.list)}>
            {GRADING_PAGE.buttons.cancel}
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {GRADING_PAGE.buttons.save}
          </Button>
        </Div>
      </form>
    </Div>
  );
}
