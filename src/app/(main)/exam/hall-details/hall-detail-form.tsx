"use client";

import { useEffect, useId, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil, Grid3x3 } from "lucide-react";
import { useHallDetailForm } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import { Div, Button, Spinner, FormField, Input, P, Span } from "@/components/ui";
import { HALL_DETAILS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";
import { GridPreview } from "@/components/exam/GridPreview";
import { useIsMobile } from "@/hooks/use-mobile";
import { HallDetailMobileForm, HallDetailMobileView } from "@/components/exam/HallDetailMobile";
import { useWatch } from "react-hook-form";

function HallDetailFormContent({ slug }: { slug: string }) {
  const router = useRouter();
  const isMobile = useIsMobile();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";
  const gridRowsId = useId();
  const gridColsId = useId();

  const {
    detail,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  } = useHallDetailForm(slug);

  const { register, control, formState: { errors } } = form;

  const gridRows = useWatch({ control, name: "grid_rows" }) as number | string | undefined;
  const gridCols = useWatch({ control, name: "grid_cols" }) as number | string | undefined;
  const manualCapacity = useWatch({ control, name: "sitting_capacity" }) as number | undefined;

  const parsedRows = Number(gridRows);
  const parsedCols = Number(gridCols);
  const gridMode = parsedRows >= 1 && parsedCols >= 1;
  const autoCapacity = gridMode ? parsedRows * parsedCols : null;

  useEffect(() => {
    if (isEditMode) setIsEditing(true);
  }, [isEditMode, setIsEditing]);

  if (isLoading) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  if (isMobile) {
    if (!isNew && !isEditing && detail) {
      return <HallDetailMobileView detail={detail} onEdit={() => setIsEditing(true)} />;
    }
    return (
      <HallDetailMobileForm
        form={form}
        isNew={isNew}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={() =>
          isNew || isEditMode ? router.push(EXAM_ROUTES.hallDetails.list) : setIsEditing(false)
        }
      />
    );
  }

  const isReadOnly = !isEditing;
  const displayCapacity = autoCapacity ?? detail?.sitting_capacity ?? manualCapacity;

  return (
    <Div type="col" gap="lg" className="max-w-xl">
      <PageHeader
        title={isNew ? "Add Room" : (detail?.room_name ?? "Room")}
        subtitle={
          !isNew && detail
            ? detail.grid_rows && detail.grid_cols
              ? `${detail.grid_rows} × ${detail.grid_cols} grid · ${detail.sitting_capacity} seats`
              : `${detail.sitting_capacity} seats`
            : ""
        }
        actions={
          <Div type="row" gap="sm" align="center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(EXAM_ROUTES.hallDetails.list)}
            >
              <ArrowLeft size={14} /> {HALL_DETAILS_PAGE.buttons.back}
            </Button>
            {!isNew && !isEditing && (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil size={14} /> {HALL_DETAILS_PAGE.buttons.edit}
              </Button>
            )}
            {isEditing && !isNew && (
              <Button size="sm" variant="outline" onClick={() => setIsEditing(false)}>
                {HALL_DETAILS_PAGE.buttons.cancel}
              </Button>
            )}
          </Div>
        }
      />

      <form onSubmit={onSubmit}>
        <Div variant="card" className="p-6">
          <Div type="col" gap="md">
            <FormField
              label={HALL_DETAILS_PAGE.labels.roomName + " *"}
              error={errors.room_name?.message}
            >
              <Input
                {...register("room_name")}
                placeholder="e.g. Room 101"
                disabled={isReadOnly}
              />
            </FormField>

            <Div className="rounded-lg border border-border p-4 bg-muted/20">
              <Div type="row" className="flex items-center gap-2 mb-3">
                <Grid3x3 size={14} className="text-muted-foreground" />
                <P color="default" className="text-sm font-medium">Grid Layout</P>
                <Span className="text-xs text-muted-foreground ml-1">
                  (optional — auto-calculates capacity)
                </Span>
              </Div>
              <Div type="grid" cols={2} gap="sm" className="grid-cols-2">
                <FormField label="Rows" error={errors.grid_rows?.message}>
                  <Div className="relative">
                    <label htmlFor={gridRowsId} className="sr-only">Rows</label>
                    <Input
                      id={gridRowsId}
                      {...register("grid_rows")}
                      type="number"
                      min={1}
                      max={30}
                      placeholder="e.g. 5"
                      disabled={isReadOnly}
                    />
                  </Div>
                </FormField>
                <FormField label="Columns" error={errors.grid_cols?.message}>
                  <Div className="relative">
                    <label htmlFor={gridColsId} className="sr-only">Columns</label>
                    <Input
                      id={gridColsId}
                      {...register("grid_cols")}
                      type="number"
                      min={1}
                      max={30}
                      placeholder="e.g. 6"
                      disabled={isReadOnly}
                    />
                  </Div>
                </FormField>
              </Div>
              {gridMode && !isReadOnly && <GridPreview rows={parsedRows} cols={parsedCols} />}
              {isReadOnly && detail?.grid_rows && detail?.grid_cols && (
                <GridPreview rows={detail.grid_rows} cols={detail.grid_cols} />
              )}
            </Div>

            {!gridMode && (
              <FormField
                label={HALL_DETAILS_PAGE.labels.sittingCapacity + " *"}
                error={errors.sitting_capacity?.message}
              >
                <Input
                  {...register("sitting_capacity")}
                  type="number"
                  min={1}
                  placeholder="e.g. 50"
                  disabled={isReadOnly}
                />
              </FormField>
            )}

            {gridMode && displayCapacity && (
              <Div type="row" className="flex items-center gap-2 text-sm bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg px-3 py-2">
                <Span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  {parsedRows} × {parsedCols} = {autoCapacity} seats
                </Span>
                <Span className="text-xs text-muted-foreground">auto-calculated</Span>
              </Div>
            )}

            <Div type="row" align="center" gap="sm">
              <input
                type="checkbox"
                id="is_enabled"
                {...register("is_enabled")}
                className="h-4 w-4 rounded border-border"
                disabled={isReadOnly}
              />
              <label htmlFor="is_enabled" className="text-sm text-foreground">
                {HALL_DETAILS_PAGE.labels.isEnabled}
              </label>
            </Div>

            {isEditing && (
              <Div type="row" gap="md" className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    isNew ? router.push(EXAM_ROUTES.hallDetails.list) : setIsEditing(false)
                  }
                >
                  {HALL_DETAILS_PAGE.buttons.cancel}
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {HALL_DETAILS_PAGE.buttons.save}
                </Button>
              </Div>
            )}
          </Div>
        </Div>
      </form>
    </Div>
  );
}

function HallDetailSlugContent() {
  const searchParams = useSearchParams();
  const slug = searchParams.get("id") ?? "create-new";
  return <HallDetailFormContent slug={slug} />;
}

export { HallDetailFormContent };

export default function HallDetailSlugPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <HallDetailSlugContent />
    </Suspense>
  );
}
