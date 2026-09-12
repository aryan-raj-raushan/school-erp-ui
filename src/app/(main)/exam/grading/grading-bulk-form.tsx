"use client";

import { useRouter } from "next/navigation";
import { Plus, Trash2, Wand2 } from "lucide-react";
import { useExamGradingBulkForm } from "@/hooks/exam/useExamGrading";
import {
  Div,
  Button,
  FormField,
  Input,
  Textarea,
  PageHeader,
  type PageHeaderConfig,
} from "@/components/ui";
import { GRADING_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

export function GradingBulkFormContent() {
  const router = useRouter();
  const {
    form, gradesField, isSubmitting, onSubmit, addGradeRow, removeGradeRow, autoGenerate,
  } = useExamGradingBulkForm();

  const { register, formState: { errors } } = form;

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Add Grades",
    subtitle: "Create all grade bands for this school in one go",
    backButton: true,
    actions: [
      {
        label: "Auto Generate",
        icon: <Wand2 size={14} />,
        variant: "outline",
        onClick: autoGenerate,
      },
    ],
  };

  return (
    <Div type="col" gap="lg" className="max-w-4xl">
      <PageHeader {...pageHeaderConfig} />

      <form onSubmit={onSubmit}>
        <Div type="col" gap="sm">
          {gradesField.fields.map((field, i) => {
            const rowErrors = errors.grades?.[i];
            return (
              <Div key={field.id} variant="card" className="p-3 sm:p-4">
                <Div type="row" justify="between" align="center" className="mb-3">
                  <span className="text-xs font-semibold text-muted-foreground">Grade {i + 1}</span>
                  {gradesField.fields.length > 1 && (
                    <Button size="icon-xs" type="button" variant="destructive" onClick={() => removeGradeRow(i)}>
                      <Trash2 size={12} />
                    </Button>
                  )}
                </Div>
                <Div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
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

        <Div type="row" justify="end" gap="sm" className="pt-4">
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
