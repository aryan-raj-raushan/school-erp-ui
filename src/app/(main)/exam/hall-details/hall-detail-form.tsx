"use client";

import { useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { useHallDetailForm, useHallPlans } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Button,
  Spinner,
  FormField,
  Input,
  Select,
} from "@/components/ui";
import { HALL_DETAILS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

export function HallDetailFormContent({
  slug,
  defaultPlanId,
}: {
  slug: string;
  defaultPlanId?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    detail,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  } = useHallDetailForm(slug, defaultPlanId);

  const { plans } = useHallPlans();

  const {
    register,
    formState: { errors },
  } = form;

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

  const isReadOnly = !isEditing;

  return (
    <Div type="col" gap="lg" className="max-w-xl">
      <PageHeader
        title={isNew ? "Add Room" : (detail?.room_name ?? "Room")}
        subtitle={
          !isNew && detail ? `Capacity: ${detail.sitting_capacity} seats` : ""
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
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
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
              label={HALL_DETAILS_PAGE.labels.hallPlan + " *"}
              error={errors.hall_plan_id?.message}
            >
              <Select
                {...register("hall_plan_id")}
                disabled={isReadOnly || !isNew}
              >
                <option value="">Select hall plan</option>
                {plans.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.plan_name}
                  </option>
                ))}
              </Select>
            </FormField>

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
                    isNew
                      ? router.push(EXAM_ROUTES.hallDetails.list)
                      : setIsEditing(false)
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
