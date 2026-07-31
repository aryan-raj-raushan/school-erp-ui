"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Pencil, X, Clock } from "lucide-react";
import { useSchoolEventDetail } from "@/hooks/useSchoolEvents";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Div,
  H2,
  H3,
  P,
  Button,
  Input,
  FormField,
  Spinner,
  InfoRow,
  ResponsiveSelect,
  Span,
  PageHeader,
  type PageHeaderConfig,
} from "@/components/ui";
import { SchoolEventsService } from "@/services/school-events.service";
import { RolesService, type Role } from "@/services/roles.service";
import { toast } from "sonner";

const TYPE_OPTIONS = [
  { value: "EVENT", label: "Event" },
  { value: "HOLIDAY", label: "Holiday" },
];

const APPLIES_TO_OPTIONS = [
  { value: "STUDENTS", label: "Students Only" },
  { value: "STAFF", label: "Staff Only" },
  { value: "BOTH", label: "Students & Staff" },
];

export function HolidayEventDetail({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startEditing = searchParams.get("edit") === "true";
  const isNew = id === "create-new";
  const [roles, setRoles] = useState<Role[]>([]);
  const [rolesLoading, setRolesLoading] = useState(false);

  const { years } = useAcademicYears();
  const {
    event,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    handleSubmit,
    isSubmitting,
  } = useSchoolEventDetail(id);

  useEffect(() => {
    async function fetchRoles() {
      setRolesLoading(true);
      try {
        const result = await RolesService.list({ limit: 100 });
        setRoles(result.items);
      } catch (err: unknown) {
        console.error('Failed to load roles:', err);
      } finally {
        setRolesLoading(false);
      }
    }
    fetchRoles();
  }, []);

  useEffect(() => {
    if (startEditing && !isNew) setIsEditing(true);
  }, [startEditing, isNew, setIsEditing]);

  const {
    register,
    formState: { errors },
    reset,
  } = form;
  const isMobile = useIsMobile();

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
        await SchoolEventsService.update(id, payload);
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

  const dateRangeLabel =
    !isNew && event
      ? `${event.type === "HOLIDAY" ? "Holiday" : "Event"} • ${new Date(
          event.from_date,
        ).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "long",
          year: "numeric",
        })}${
          event.from_date !== event.to_date
            ? ` — ${new Date(event.to_date).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}`
            : ""
        }`
      : undefined;

  const pageHeaderConfig: PageHeaderConfig = {
    title: isNew ? "Add New Event" : (event?.name ?? "Details"),
    subtitle: dateRangeLabel,
    backButton: isMobile,
    actions: isNew
      ? undefined
      : isEditing
        ? [
            {
              label: "Cancel",
              icon: <X size={14} />,
              variant: "outline",
              onClick: () => {
                setIsEditing(false);
                reset();
              },
            },
          ]
        : [
            {
              label: "Edit",
              icon: <Pencil size={14} />,
              onClick: () => setIsEditing(true),
            },
          ],
  };

  return (
    <Div type="col" gap="lg" className="max-w-3xl">
      <PageHeader {...pageHeaderConfig} />

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

          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="mb-2 uppercase tracking-wider text-xs font-semibold"
            >
              Applicability
            </H3>
            <InfoRow
              label="Applies To"
              value={
                event.applies_to === "BOTH"
                  ? "Students & Staff"
                  : event.applies_to === "STUDENTS"
                    ? "Students Only"
                    : "Staff Only"
              }
            />
            {(event.applies_to === "STAFF" || event.applies_to === "BOTH") && event.exempt_role_ids?.length > 0 && (
              <InfoRow
                label="Staff Working"
                value={
                  roles
                    .filter((r) => event.exempt_role_ids.includes(r.id))
                    .map((r) => r.name)
                    .join(", ") || "—"
                }
              />
            )}
          </Div>
        </Div>
      )}

      {/* Create / Edit Form */}
      {(isEditing || isNew) && (
        <form onSubmit={form.handleSubmit(onSubmit as any)}>
          <Div type="col" gap="lg">
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
                  <ResponsiveSelect
                    id="type"
                    {...register("type")}
                    options={TYPE_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                  />
                </FormField>

                <FormField
                  label="Academic Year *"
                  error={errors.academic_year_id?.message}
                  htmlFor="academic_year_id"
                >
                  <ResponsiveSelect
                    id="academic_year_id"
                    {...register("academic_year_id")}
                    customPlaceholder="Select year"
                    options={years.map((y) => ({ value: y.id, label: y.name }))}
                  />
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

            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                Applicability (Staff & Students)
              </H2>

              <FormField
                label="Applies To *"
                error={errors.applies_to?.message}
                htmlFor="applies_to"
              >
                <ResponsiveSelect
                  id="applies_to"
                  {...register("applies_to")}
                  options={APPLIES_TO_OPTIONS.map((opt) => ({ value: opt.value, label: opt.label }))}
                />
              </FormField>

              {(form.watch("applies_to") === "STAFF" || form.watch("applies_to") === "BOTH") && (
                <FormField
                  label="Staff Who Work During This Holiday=="
                  hint="Select staff roles that are required to work on this holiday (e.g., Peon, Gate Guard). Selected staff will receive salary during this holiday."
                  htmlFor="exempt_role_ids"
                >
                  <Div className="space-y-2 border border-border rounded-lg p-3 bg-muted/20">
                    {rolesLoading ? (
                      <P color="muted" className="text-sm">Loading roles...</P>
                    ) : roles.length === 0 ? (
                      <P color="muted" className="text-sm">No roles available</P>
                    ) : (
                      roles.map((role) => (
                        <label key={role.id} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            value={role.id}
                            checked={form.watch("exempt_role_ids")?.includes(role.id) ?? false}
                            onChange={(e) => {
                              const current = form.watch("exempt_role_ids") ?? [];
                              if (e.target.checked) {
                                form.setValue("exempt_role_ids", [...current, role.id]);
                              } else {
                                form.setValue("exempt_role_ids", current.filter(id => id !== role.id));
                              }
                            }}
                            className="w-4 h-4 rounded cursor-pointer"
                          />
                          <Span className="text-sm text-foreground">{role.name}</Span>
                        </label>
                      ))
                    )}
                  </Div>
                </FormField>
              )}
            </Div>

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
