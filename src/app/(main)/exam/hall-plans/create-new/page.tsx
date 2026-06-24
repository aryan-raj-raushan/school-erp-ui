"use client";

import { Suspense, useEffect } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { useHallPlanDetail } from "@/hooks/exam/useExamHall";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Button,
  Spinner,
  FormField,
  Input,
  Textarea,
} from "@/components/ui";
import { HALL_PLANS_PAGE, EXAM_ROUTES } from "@/constants/exam.constants";

function HallPlanFormContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get("edit") === "true";

  const {
    plan,
    isLoading,
    isNew,
    isEditing,
    setIsEditing,
    form,
    isSubmitting,
    onSubmit,
  } = useHallPlanDetail(slug);

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
        title={isNew ? "Add Hall Plan" : plan?.plan_name ?? "Hall Plan"}
        subtitle=""
        actions={
          <Div type="row" gap="sm" align="center">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(EXAM_ROUTES.hallPlans.list)}
            >
              <ArrowLeft size={14} /> {HALL_PLANS_PAGE.buttons.back}
            </Button>
            {!isNew && !isEditing && (
              <Button size="sm" onClick={() => setIsEditing(true)}>
                <Pencil size={14} /> {HALL_PLANS_PAGE.buttons.edit}
              </Button>
            )}
            {isEditing && !isNew && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setIsEditing(false)}
              >
                {HALL_PLANS_PAGE.buttons.cancel}
              </Button>
            )}
          </Div>
        }
      />

      <form onSubmit={onSubmit}>
        <Div variant="card" className="p-6">
          <Div type="col" gap="md">
            <FormField
              label={HALL_PLANS_PAGE.labels.planName + " *"}
              error={errors.plan_name?.message}
            >
              <Input
                {...register("plan_name")}
                placeholder="e.g. Hall Plan A"
                disabled={isReadOnly}
              />
            </FormField>

            <FormField label={HALL_PLANS_PAGE.labels.description}>
              <Textarea
                {...register("description")}
                rows={3}
                placeholder="Optional description"
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
              <label
                htmlFor="is_enabled"
                className="text-sm text-foreground"
              >
                {HALL_PLANS_PAGE.labels.isEnabled}
              </label>
            </Div>

            {isEditing && (
              <Div type="row" gap="md" className="pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() =>
                    isNew
                      ? router.push(EXAM_ROUTES.hallPlans.list)
                      : setIsEditing(false)
                  }
                >
                  {HALL_PLANS_PAGE.buttons.cancel}
                </Button>
                <Button type="submit" loading={isSubmitting}>
                  {HALL_PLANS_PAGE.buttons.save}
                </Button>
              </Div>
            )}
          </Div>
        </Div>
      </form>
    </Div>
  );
}

function HallPlanSlugContent() {
  const params = useParams();
  const slug = Array.isArray(params.slug)
    ? params.slug[0]
    : params.slug ?? "create-new";
  return <HallPlanFormContent slug={slug} />;
}

export default function HallPlanSlugPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <HallPlanSlugContent />
    </Suspense>
  );
}