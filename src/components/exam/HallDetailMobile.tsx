"use client";

import type { UseFormReturn } from "react-hook-form";
import { useWatch } from "react-hook-form";
import { DoorOpen } from "lucide-react";
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
  MobileTextField,
  StickyActionBar,
} from "@/components/ui";
import { GridPreview } from "@/components/exam/GridPreview";
import { HALL_DETAILS_PAGE } from "@/constants/exam.constants";
import type { HallDetailFormInput, HallDetailFormValues } from "@/hooks/exam/useExamHall";

interface HallDetailLike {
  room_name: string;
  sitting_capacity: number;
  grid_rows?: number | null;
  grid_cols?: number | null;
  is_enabled?: boolean;
}

export interface HallDetailMobileFormProps {
  form: UseFormReturn<HallDetailFormInput, unknown, HallDetailFormValues>;
  isNew: boolean;
  isSubmitting: boolean;
  onSubmit: () => Promise<unknown> | unknown;
  onCancel: () => void;
}

export function HallDetailMobileForm({
  form,
  isNew,
  isSubmitting,
  onSubmit,
  onCancel,
}: HallDetailMobileFormProps) {
  const { control, register, formState } = form;
  const errors = formState.errors;

  const rows = Number(useWatch({ control, name: "grid_rows" }));
  const cols = Number(useWatch({ control, name: "grid_cols" }));
  const gridMode = rows >= 1 && cols >= 1;

  return (
    <MobileFormScreen
      title={isNew ? "Add room" : "Edit room"}
      submitLabel={HALL_DETAILS_PAGE.buttons.save}
      isSubmitting={isSubmitting}
      onSubmit={onSubmit}
      onCancel={onCancel}
    >
      <FormGroup>
        <MobileTextField
          label={HALL_DETAILS_PAGE.labels.roomName}
          required
          placeholder="e.g. Room 101"
          error={errors.room_name?.message}
          {...register("room_name")}
        />
      </FormGroup>

      <FormGroup title="Grid layout" description="Optional — rows × columns sets the capacity.">
        <FieldRow>
          <MobileTextField
            label="Rows"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            placeholder="5"
            error={errors.grid_rows?.message}
            {...register("grid_rows")}
          />
          <MobileTextField
            label="Columns"
            type="number"
            inputMode="numeric"
            min={1}
            max={30}
            placeholder="6"
            error={errors.grid_cols?.message}
            {...register("grid_cols")}
          />
        </FieldRow>
        {gridMode && <GridPreview rows={rows} cols={cols} />}
      </FormGroup>

      {!gridMode && (
        <FormGroup>
          <MobileTextField
            label={HALL_DETAILS_PAGE.labels.sittingCapacity}
            required
            type="number"
            inputMode="numeric"
            min={1}
            placeholder="50"
            error={errors.sitting_capacity?.message}
            {...register("sitting_capacity")}
          />
        </FormGroup>
      )}

      <ControlledToggleRow control={control} name="is_enabled" label={HALL_DETAILS_PAGE.labels.isEnabled} />
    </MobileFormScreen>
  );
}

export function HallDetailMobileView({
  detail,
  onEdit,
}: {
  detail: HallDetailLike;
  onEdit: () => void;
}) {
  const hasGrid = Boolean(detail.grid_rows && detail.grid_cols);
  return (
    <div className="flex flex-col gap-3 pt-3">
      <DetailHero
        name={detail.room_name}
        subtitle={
          hasGrid
            ? `${detail.grid_rows} × ${detail.grid_cols} grid · ${detail.sitting_capacity} seats`
            : `${detail.sitting_capacity} seats`
        }
        badge={
          <Badge variant={detail.is_enabled === false ? "default" : "success"}>
            {detail.is_enabled === false ? "Disabled" : "Enabled"}
          </Badge>
        }
      />
      <section className="rounded-2xl border border-border/60 bg-white p-4 dark:bg-neutral-900">
        <DetailGrid>
          <DetailField label="Capacity" value={`${detail.sitting_capacity} seats`} />
          <DetailField label="Layout" value={hasGrid ? `${detail.grid_rows} × ${detail.grid_cols}` : "Not set"} />
        </DetailGrid>
        {hasGrid && (
          <GridPreview rows={Number(detail.grid_rows)} cols={Number(detail.grid_cols)} />
        )}
      </section>
      <StickyActionBar>
        <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
          <DoorOpen size={16} /> Edit room
        </Button>
      </StickyActionBar>
    </div>
  );
}
