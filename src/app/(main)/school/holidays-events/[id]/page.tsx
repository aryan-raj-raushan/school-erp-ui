"use client";

import { use, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  X,
  Calendar,
  PartyPopper,
  Clock,
} from "lucide-react";
import { useSchoolEventDetail } from "@/hooks/useSchoolEvents";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import {
  Div,
  H1,
  H2,
  H3,
  P,
  Button,
  Input,
  Select,
  Textarea,
  FormField,
  Badge,
  Spinner,
  InfoRow,
} from "@/components/ui";
import { SchoolEventsService } from "@/services/school-events.service";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "EVENT", label: "Event" },
  { value: "HOLIDAY", label: "Holiday" },
];

export default function SchoolEventDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  console.log("Params: ", params);
  const { id } = use(params);
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryId = searchParams.get("id");
  const startEditing = searchParams.get("edit") === "true";

  // id param is "create-new" or "view" (with ?id= query)
  const resolvedId =
    id === "view"
      ? (queryId ?? undefined)
      : id === "create-new"
        ? undefined
        : id;
  const isNew = id === "create-new";

  const { years } = useAcademicYears();
  const {
    event,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    handleSubmit,
    isSubmitting,
  } = useSchoolEventDetail(isNew ? "create-new" : resolvedId);

  // Auto-enter edit mode if ?edit=true
  useEffect(() => {
    if (startEditing && !isNew) setIsEditing(true);
  }, [startEditing, isNew, setIsEditing]);

  const {
    register,
    formState: { errors },
    watch,
    reset,
  } = form;
  const watchedType = watch("type");

  function handleBack() {
    router.back();
  }

  async function onSubmit() {
    const result = await form.handleSubmit(async (values) => {
      const payload = {
        ...values,
        from_time: values.from_time || undefined,
        to_time: values.to_time || undefined,
        description: values.description || undefined,
      };
      if (isNew) {
        const res = await SchoolEventsService.create(payload);
        toast.success(`${res.name} created`);
        router.push("/school/holidays-events");
      } else {
        await SchoolEventsService.update(resolvedId!, payload);
        toast.success("Updated successfully");
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

  const typeColor = watchedType === "HOLIDAY" ? "warning" : "info";
  const TypeIcon = watchedType === "HOLIDAY" ? Calendar : PartyPopper;

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      {/* Header */}
      <Div type="row" align="center" gap="md">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ArrowLeft size={16} />
          Back
        </Button>
        <Div type="col" gap="xs" className="flex-1">
          <Div type="row" align="center" gap="sm">
            <TypeIcon
              size={20}
              className={
                watchedType === "HOLIDAY" ? "text-amber-500" : "text-blue-500"
              }
            />
            <H1>{isNew ? "Add New" : (event?.name ?? "Details")}</H1>
            {!isNew && event && <Badge variant={typeColor}>{event.type}</Badge>}
          </Div>
          {!isNew && event && (
            <P color="muted">
              {new Date(event.from_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
              {event.from_date !== event.to_date && (
                <>
                  {" "}
                  —{" "}
                  {new Date(event.to_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </>
              )}
            </P>
          )}
        </Div>

        {/* Edit toggle — only on view mode */}
        {!isNew && (
          <Div type="row" gap="sm">
            {isEditing ? (
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
            )}
          </Div>
        )}
      </Div>

      {/* View Mode */}
      {!isEditing && !isNew && event && (
        <Div type="col" gap="lg">
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="mb-2 uppercase tracking-wider text-xs font-semibold"
            >
              General
            </H3>
            <InfoRow label="Name" value={event.name} />
            <InfoRow label="Type" value={event.type} />
            <InfoRow
              label="Academic Year"
              value={
                years.find((y) => y.id === event.academic_year_id)?.name ?? "—"
              }
            />
            {event.description && (
              <InfoRow label="Description" value={event.description} />
            )}
          </Div>

          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="mb-2 uppercase tracking-wider text-xs font-semibold"
            >
              Schedule
            </H3>
            <Div type="grid" cols={2} gap="md">
              <Div type="col" gap="xs">
                <P color="muted">From Date</P>
                <P color="default">
                  {new Date(event.from_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </P>
                {event.from_time && (
                  <Div type="row" align="center" gap="xs">
                    <Clock size={12} className="text-muted-foreground" />
                    <P color="muted" className="text-xs">
                      {event.from_time.slice(0, 5)}
                    </P>
                  </Div>
                )}
              </Div>
              <Div type="col" gap="xs">
                <P color="muted">To Date</P>
                <P color="default">
                  {new Date(event.to_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </P>
                {event.to_time && (
                  <Div type="row" align="center" gap="xs">
                    <Clock size={12} className="text-muted-foreground" />
                    <P color="muted" className="text-xs">
                      {event.to_time.slice(0, 5)}
                    </P>
                  </Div>
                )}
              </Div>
            </Div>
          </Div>
        </Div>
      )}

      {/* Create / Edit Form */}
      {(isEditing || isNew) && (
        <form onSubmit={form.handleSubmit(onSubmit as any)}>
          <Div type="col" gap="lg">
            {/* General Section */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                General Information
              </H2>

              <FormField
                label="Name *"
                error={errors.name?.message}
                htmlFor="name"
              >
                <Input
                  id="name"
                  placeholder="e.g. Diwali Holiday, Annual Sports Day"
                  {...register("name")}
                />
              </FormField>

              <Div type="grid" cols={2} gap="md">
                <FormField
                  label="Type *"
                  error={errors.type?.message}
                  htmlFor="type"
                >
                  <Select id="type" {...register("type")}>
                    {TYPE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  label="Academic Year *"
                  error={errors.academic_year_id?.message}
                  htmlFor="academic_year_id"
                >
                  <Select
                    id="academic_year_id"
                    {...register("academic_year_id")}
                  >
                    <option value="">Select year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </Div>

              <FormField
                label="Description"
                error={errors.description?.message}
                htmlFor="description"
              >
                <textarea
                  id="description"
                  rows={3}
                  placeholder="Optional details about this event or holiday…"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  {...register("description")}
                />
              </FormField>
            </Div>

            {/* Schedule Section */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Schedule
              </H2>

              <Div type="grid" cols={2} gap="md">
                <FormField
                  label="From Date *"
                  error={errors.from_date?.message}
                  htmlFor="from_date"
                >
                  <Input
                    id="from_date"
                    type="date"
                    {...register("from_date")}
                  />
                </FormField>
                <FormField
                  label="From Time"
                  error={errors.from_time?.message}
                  htmlFor="from_time"
                >
                  <Input
                    id="from_time"
                    type="time"
                    {...register("from_time")}
                  />
                </FormField>
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField
                  label="To Date *"
                  error={errors.to_date?.message}
                  htmlFor="to_date"
                >
                  <Input id="to_date" type="date" {...register("to_date")} />
                </FormField>
                <FormField
                  label="To Time"
                  error={errors.to_time?.message}
                  htmlFor="to_time"
                >
                  <Input id="to_time" type="time" {...register("to_time")} />
                </FormField>
              </Div>
            </Div>

            {/* Actions */}
            <Div type="row" justify="end" gap="sm">
              {isNew ? (
                <Button variant="outline" type="button" onClick={handleBack}>
                  Cancel
                </Button>
              ) : (
                <Button
                  variant="outline"
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    reset();
                  }}
                >
                  Cancel
                </Button>
              )}
              <Button type="submit" loading={isSubmitting}>
                {isNew ? "Create" : "Save Changes"}
              </Button>
            </Div>
          </Div>
        </form>
      )}
    </Div>
  );
}
