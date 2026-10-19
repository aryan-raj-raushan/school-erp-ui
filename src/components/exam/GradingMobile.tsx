"use client";

import type { UseFormReturn } from "react-hook-form";
import { Plus, Trash2, Wand2 } from "lucide-react";
import {
  Badge,
  Button,
  ControlledToggleRow,
  DetailField,
  DetailGrid,
  DetailHero,
  FieldRow,
  FormGroup,
  MobileFormScreen,
  MobileTextArea,
  MobileTextField,
  StickyActionBar,
} from "@/components/ui";
import { GRADING_PAGE } from "@/constants/exam.constants";
import type { GradingFormInput, GradingFormOutput } from "@/hooks/exam/useExamGrading";
import type { ExamGrading } from "@/types/exam.types";

// ─── Single grade ─────────────────────────────────────────────────────────────

export interface GradingMobileFormProps {
  form: UseFormReturn<GradingFormInput, unknown, GradingFormOutput>;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function GradingMobileForm({ form, isSubmitting, onSubmit, onCancel }: GradingMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  return (
    <MobileFormScreen
      title="Edit grade"
      submitLabel={GRADING_PAGE.buttons.save}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <FormGroup>
        <MobileTextField
          label={GRADING_PAGE.labels.gradeName}
          required
          placeholder="e.g. A+"
          error={errors.grade_name?.message}
          {...register("grade_name")}
        />
        <FieldRow>
          <MobileTextField
            label="From %"
            required
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            error={errors.from_percentage?.message}
            {...register("from_percentage")}
          />
          <MobileTextField
            label="To %"
            required
            type="number"
            inputMode="decimal"
            min={0}
            max={100}
            step="0.01"
            error={errors.to_percentage?.message}
            {...register("to_percentage")}
          />
        </FieldRow>
        <MobileTextField
          label={GRADING_PAGE.labels.sequenceIndex}
          type="number"
          inputMode="numeric"
          min={0}
          error={errors.sequence_index?.message}
          {...register("sequence_index")}
        />
        <MobileTextArea
          label={GRADING_PAGE.labels.description}
          placeholder="Optional description"
          {...register("description")}
        />
        <ControlledToggleRow control={control} name="is_enabled" label={GRADING_PAGE.labels.isEnabled} />
      </FormGroup>
    </MobileFormScreen>
  );
}

export function GradingMobileView({ grade, onEdit }: { grade: ExamGrading; onEdit: () => void }) {
  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={`Grade ${grade.grade_name}`}
        subtitle={`${grade.from_percentage}% – ${grade.to_percentage}%`}
        meta={`Order #${grade.sequence_index}`}
        badge={
          <Badge variant={grade.is_enabled ? "success" : "default"}>
            {grade.is_enabled ? "Enabled" : "Disabled"}
          </Badge>
        }
      />
      <section className="rounded-2xl border border-border/60 bg-white p-4 dark:bg-neutral-900">
        <DetailGrid>
          <DetailField label="From" value={`${grade.from_percentage}%`} />
          <DetailField label="To" value={`${grade.to_percentage}%`} />
          <DetailField wide label="Description" value={grade.description} />
        </DetailGrid>
      </section>
      <StickyActionBar>
        <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
          Edit grade
        </Button>
      </StickyActionBar>
    </div>
  );
}

// ─── Bulk ─────────────────────────────────────────────────────────────────────

export interface GradingBulkMobileProps {
  form: UseFormReturn<{ grades: GradingFormInput[] }, unknown, { grades: GradingFormOutput[] }>;
  rowCount: number;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
  onAddRow: () => void;
  onRemoveRow: (index: number) => void;
  onAutoGenerate: () => void;
  rowIds: ReadonlyArray<string>;
}

export function GradingBulkMobile({
  form,
  rowCount,
  isSubmitting,
  onSubmit,
  onCancel,
  onAddRow,
  onRemoveRow,
  onAutoGenerate,
  rowIds,
}: GradingBulkMobileProps) {
  const { register, formState } = form;
  const errors = formState.errors;

  return (
    <MobileFormScreen
      title="Add grades"
      submitLabel={GRADING_PAGE.buttons.save}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <Button type="button" variant="outline" size="lg" onClick={onAutoGenerate}>
        <Wand2 size={18} /> Auto-generate standard scale
      </Button>

      {rowIds.map((id, i) => {
        const rowErrors = errors.grades?.[i];
        return (
          <section
            key={id}
            className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-muted/30 p-3"
          >
            <header className="flex items-center justify-between px-1">
              <h3 className="text-sm font-semibold">Grade {i + 1}</h3>
              {rowCount > 1 && (
                <button
                  type="button"
                  aria-label={`Remove grade ${i + 1}`}
                  onClick={() => onRemoveRow(i)}
                  className="flex h-10 w-10 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
                >
                  <Trash2 size={18} />
                </button>
              )}
            </header>
            <MobileTextField
              label={GRADING_PAGE.labels.gradeName}
              required
              placeholder="e.g. A+"
              error={rowErrors?.grade_name?.message}
              {...register(`grades.${i}.grade_name`)}
            />
            <FieldRow>
              <MobileTextField
                label="From %"
                required
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.01"
                error={rowErrors?.from_percentage?.message}
                {...register(`grades.${i}.from_percentage`)}
              />
              <MobileTextField
                label="To %"
                required
                type="number"
                inputMode="decimal"
                min={0}
                max={100}
                step="0.01"
                error={rowErrors?.to_percentage?.message}
                {...register(`grades.${i}.to_percentage`)}
              />
            </FieldRow>
            <MobileTextField
              label={GRADING_PAGE.labels.sequenceIndex}
              type="number"
              inputMode="numeric"
              min={0}
              {...register(`grades.${i}.sequence_index`)}
            />
            <MobileTextArea
              label={GRADING_PAGE.labels.description}
              rows={2}
              placeholder="Optional description"
              {...register(`grades.${i}.description`)}
            />
          </section>
        );
      })}

      <Button type="button" variant="outline" size="lg" onClick={onAddRow}>
        <Plus size={18} /> Add grade
      </Button>
    </MobileFormScreen>
  );
}
