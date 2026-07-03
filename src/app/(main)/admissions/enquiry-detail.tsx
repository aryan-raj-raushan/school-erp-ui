"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Plus,
  CheckCircle2,
  XCircle,
  RefreshCw,
  FileText,
  Clock,
} from "lucide-react";
import { useAdmissionEnquiryDetail } from "@/hooks/useAdmissions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { ClassesService } from "@/services/classes.service";
import { AdmissionSourcesService } from "@/services/admissions.service";
import { StaffService } from "@/services/staff.service";
import type { Class, Staff } from "@/types";
import type {
  AdmissionSource,
  EnquiryAction,
} from "@/types/admissions.types";
import {
  Div,
  H2,
  H3,
  P,
  Button,
  Input,
  Select,
  FormField,
  FormGrid,
  PhoneField,
  Badge,
  Spinner,
  InfoRow,
  Modal,
  ModalBody,
  ModalFooter,
  PageHeader,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  ResponsiveModalContainer,
  ResponsiveSelect,
} from "@/components/ui";
import { ACTION_OPTIONS, STATUS_BADGE, STATUS_OPTIONS } from "@/constants/admission.constants";
import { GENDER_OPTIONS } from "@/constants";
import { CATEGORY_OPTIONS, RELIGION_OPTIONS } from "@/constants/shared/index.constant";

const ACTION_ICON: Record<EnquiryAction, React.ReactNode> = {
  NEW_ENQUIRY: <FileText size={16} className="text-slate-500" />,
  NEXT_FOLLOW_UP_UPDATE: <Clock size={16} className="text-blue-500" />,
  ADMISSION_CONFIRMED: <CheckCircle2 size={16} className="text-emerald-500" />,
  ENQUIRY_REJECTED: <XCircle size={16} className="text-red-500" />,
};

export function AdmissionEnquiryDetail({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const startEditing = searchParams.get("edit") === "true";

  const isNew = id === "create-new";

  const { years } = useAcademicYears();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sources, setSources] = useState<AdmissionSource[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [lockedAction, setLockedAction] = useState(false);

  useEffect(() => {
    Promise.all([
      ClassesService.list().then((r) => setClasses(r.items)),
      AdmissionSourcesService.list({ is_enabled: true }).then((r) =>
        setSources(r.items),
      ),
      StaffService.list().then((r) => setTeachers(r.items)),
    ]).catch(() => {});
  }, []);

  const {
    enquiry,
    history,
    isLoading,
    isEditing,
    setIsEditing,
    form,
    isTerminal,
    handleSubmit,
    isSubmitting,
    showHistoryModal,
    openHistoryModal,
    closeHistoryModal,
    historyForm,
    handleAddHistory,
    isHistorySubmitting,
  } = useAdmissionEnquiryDetail(id);

  useEffect(() => {
    if (startEditing && !isNew) setIsEditing(true);
  }, [startEditing, isNew, setIsEditing]);

  const {
    register,
    formState: { errors },
    reset,
  } = form;

  async function onFormSubmit() {
    await handleSubmit();
    if (isNew) router.push("/admissions");
  }

  if (isLoading) {
    return (
      <Div type="row" justify="center" align="center" className="py-32">
        <Spinner size="lg" />
      </Div>
    );
  }

  const canAddHistory = !isNew && !isTerminal;
  const showActionButtons =
    enquiry && (enquiry.status === "NEW" || enquiry.status === "FOLLOW_UP");

  const openHistoryModalWithAction = (action: EnquiryAction) => {
    setLockedAction(true);

    historyForm.setValue("action", action);

    if (action !== "NEXT_FOLLOW_UP_UPDATE") {
      historyForm.setValue("next_followup_date", "");
      historyForm.setValue("next_followup_time", "");
    }

    openHistoryModal();
  };

  const handleAddEntryClick = () => {
    setLockedAction(false);

    historyForm.setValue("action", "NEXT_FOLLOW_UP_UPDATE");

    openHistoryModal();
  };

  return (
    <Div type="col" gap="md" className="max-w-7xl">
      <PageHeader
        sticky
        title={
          isNew
            ? "New Admission Enquiry"
            : (enquiry?.student_name ?? "Enquiry Details")
        }
        subtitle={
          !isNew && enquiry
            ? `Enquiry from ${new Date(enquiry.created_at).toLocaleDateString("en-IN", { day: "2-digit", month: "long", year: "numeric" })}`
            : ""
        }
        actions={
          <Div type="row" gap="sm" align="center" wrap>
            <Button variant="outline" size="sm" onClick={() => router.back()}>
              <ArrowLeft size={14} /> Back
            </Button>
            {!isNew && !isEditing && enquiry && (
              <>
                <Badge variant={STATUS_BADGE[enquiry.status]}>
                  {enquiry.status.replace(/_/g, " ")}
                </Badge>
                {showActionButtons && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        openHistoryModalWithAction("NEXT_FOLLOW_UP_UPDATE")
                      }
                    >
                      <RefreshCw size={14} />
                      Update Follow Up
                    </Button>
                    <Button
                      size="sm"
                      onClick={() =>
                        openHistoryModalWithAction("ADMISSION_CONFIRMED")
                      }
                    >
                      <CheckCircle2 size={14} />
                      Confirm Admission
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() =>
                        openHistoryModalWithAction("ENQUIRY_REJECTED")
                      }
                    >
                      <XCircle size={14} />
                      Reject
                    </Button>
                  </>
                )}
                <Button size="sm" onClick={() => setIsEditing(true)}>
                  <Pencil size={14} /> Edit
                </Button>
              </>
            )}
            {(isEditing || isNew) && (
              <>
                {!isNew && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      reset();
                    }}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  form="enquiry-form"
                  size="sm"
                  loading={isSubmitting}
                >
                  {isNew ? "Create Enquiry" : "Save Changes"}
                </Button>
              </>
            )}
          </Div>
        }
      />

      {/* View Mode */}
      {!isEditing && !isNew && enquiry && (
        <Div type="grid" cols={2} gap="md">
          {/* Parent Info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="uppercase tracking-wider text-xs font-semibold mb-2"
            >
              Parent Information
            </H3>
            <InfoRow label="Father Name" value={enquiry.father_name ?? "—"} />
            <InfoRow label="Mother Name" value={enquiry.mother_name ?? "—"} />
            <InfoRow
              label="Phone"
              value={`${enquiry.dial_code} ${enquiry.phone}`}
            />
            <InfoRow label="Email" value={enquiry.email ?? "—"} />
            <InfoRow
              label="Father Occupation"
              value={enquiry.father_occupation ?? "—"}
            />
            <InfoRow
              label="Mother Occupation"
              value={enquiry.mother_occupation ?? "—"}
            />
            <InfoRow
              label="City / State"
              value={
                [enquiry.city, enquiry.state].filter(Boolean).join(", ") ||
                "—"
              }
            />
          </Div>

          {/* Student Info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="uppercase tracking-wider text-xs font-semibold mb-2"
            >
              Student Information
            </H3>
            <InfoRow label="Student Name" value={enquiry.student_name} />
            <InfoRow
              label="Date of Birth"
              value={
                enquiry.date_of_birth
                  ? new Date(enquiry.date_of_birth).toLocaleDateString(
                      "en-IN",
                    )
                  : "—"
              }
            />
            <InfoRow label="Gender" value={enquiry.gender ?? "—"} />
            <InfoRow label="Religion" value={enquiry.religion ?? "—"} />
            <InfoRow label="Category" value={enquiry.category ?? "—"} />
            <InfoRow
              label="Address"
              value={enquiry.student_current_address ?? "—"}
            />
          </Div>

          {/* Admission Info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="uppercase tracking-wider text-xs font-semibold mb-2"
            >
              Admission Details
            </H3>
            <InfoRow
              label="Applying Year"
              value={
                years.find((y) => y.id === enquiry.applying_academic_year_id)
                  ?.name ?? "—"
              }
            />
            <InfoRow
              label="Applying Class"
              value={
                classes.find((c) => c.id === enquiry.applying_class_id)
                  ?.name ?? "—"
              }
            />
            <InfoRow
              label="Previous School"
              value={enquiry.previous_school_name ?? "—"}
            />
            <InfoRow
              label="Previous Class"
              value={enquiry.previous_class ?? "—"}
            />
            <InfoRow
              label="Reg. Fee Required"
              value={enquiry.registration_fee_required ? "Yes" : "No"}
            />
          </Div>

          {/* Enquiry Info */}
          <Div
            type="col"
            gap="sm"
            className="rounded-xl border border-border bg-card p-5"
          >
            <H3
              color="muted"
              className="uppercase tracking-wider text-xs font-semibold mb-2"
            >
              Enquiry Details
            </H3>
            <InfoRow
              label="Source"
              value={
                sources.find((s) => s.id === enquiry.enquiry_source_id)
                  ?.name ?? "—"
              }
            />
            <InfoRow
              label="Assigned Teacher"
              value={
                teachers.find((t) => t.id === enquiry.assigned_teacher_id)
                  ? `${teachers.find((t) => t.id === enquiry.assigned_teacher_id)?.first_name ?? ""} ${
                      teachers.find(
                        (t) => t.id === enquiry.assigned_teacher_id,
                      )?.last_name ?? ""
                    }`.trim()
                  : "—"
              }
            />
            <InfoRow
              label="Next Follow-up"
              value={
                enquiry.next_followup_date
                  ? new Date(enquiry.next_followup_date).toLocaleDateString(
                      "en-IN",
                    )
                  : "—"
              }
            />
            <InfoRow label="Remarks" value={enquiry.remarks} />
          </Div>
        </Div>
      )}

      {/* Create / Edit Form */}
      {(isEditing || isNew) && (
        <form id="enquiry-form" onSubmit={form.handleSubmit(onFormSubmit as any)}>
          <Div type="col" gap="md">
            {/* Section: Parent Info */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Parent Information
              </H2>
              <FormGrid>
                <FormField
                  label="Father Name"
                  error={errors.father_name?.message}
                >
                  <Input
                    placeholder="Father's full name"
                    {...register("father_name")}
                  />
                </FormField>
                <FormField
                  label="Mother Name"
                  error={errors.mother_name?.message}
                >
                  <Input
                    placeholder="Mother's full name"
                    {...register("mother_name")}
                  />
                </FormField>
                <PhoneField
                  label="Phone"
                  required
                  dialCodeProps={register("dial_code")}
                  phoneProps={register("phone")}
                  phoneError={errors.phone?.message}
                />
                <FormField label="Email" error={errors.email?.message}>
                  <Input
                    type="email"
                    placeholder="Email address"
                    {...register("email")}
                  />
                </FormField>
                <FormField label="Father Occupation">
                  <Input
                    placeholder="e.g. Engineer"
                    {...register("father_occupation")}
                  />
                </FormField>
                <FormField label="Mother Occupation">
                  <Input
                    placeholder="e.g. Teacher"
                    {...register("mother_occupation")}
                  />
                </FormField>
                <FormField label="Father Qualification">
                  <Input
                    placeholder="e.g. B.Tech"
                    {...register("father_qualification")}
                  />
                </FormField>
                <FormField label="Mother Qualification">
                  <Input
                    placeholder="e.g. M.A."
                    {...register("mother_qualification")}
                  />
                </FormField>
                <FormField label="City">
                  <Input placeholder="City" {...register("city")} />
                </FormField>
                <FormField label="State">
                  <Input placeholder="State" {...register("state")} />
                </FormField>
                <FormField label="Country">
                  <Input placeholder="Country" {...register("country")} />
                </FormField>
              </FormGrid>
            </Div>

            {/* Section: Student Info */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Student Information
              </H2>
              <FormGrid>
                <FormField
                  label="Student Name"
                  required
                  className="col-span-full"
                  error={errors.student_name?.message}
                >
                  <Input placeholder="Full name" {...register("student_name")} />
                </FormField>
                <FormField
                  label="Date of Birth"
                  error={errors.date_of_birth?.message}
                >
                  <Input type="date" {...register("date_of_birth")} />
                </FormField>
                <FormField label="Gender" error={errors.gender?.message} htmlFor="gender">
                  <ResponsiveSelect
                    id="gender"
                    {...register("gender")}
                    customPlaceholder="Select gender"
                    options={GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </FormField>
                <FormField label="Category" error={errors.category?.message} htmlFor="category">
                  <ResponsiveSelect
                    id="category"
                    {...register("category")}
                    customPlaceholder="Select category"
                    options={CATEGORY_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </FormField>
                <FormField label="Religion" error={errors.religion?.message} htmlFor="religion">
                  <ResponsiveSelect
                    id="religion"
                    {...register("religion")}
                    customPlaceholder="Select religion"
                    options={RELIGION_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </FormField>
                <FormField label="Current Address" className="col-span-full">
                  <Input
                    placeholder="Student's current address"
                    {...register("student_current_address")}
                  />
                </FormField>
              </FormGrid>
            </Div>

            {/* Section: Admission Info */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Admission Information
              </H2>
              <FormGrid>
                <FormField
                  label="Academic Year"
                  required
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
                <FormField
                  label="Applying Academic Year"
                  required
                  error={errors.applying_academic_year_id?.message}
                  htmlFor="applying_academic_year_id"
                >
                  <ResponsiveSelect
                    id="applying_academic_year_id"
                    {...register("applying_academic_year_id")}
                    customPlaceholder="Select year"
                    options={years.map((y) => ({ value: y.id, label: y.name }))}
                  />
                </FormField>
                <FormField
                  label="Applying Class"
                  required
                  error={errors.applying_class_id?.message}
                  htmlFor="applying_class_id"
                >
                  <ResponsiveSelect
                    id="applying_class_id"
                    {...register("applying_class_id")}
                    customPlaceholder="Select class"
                    options={classes.map((c) => ({ value: c.id, label: c.name }))}
                  />
                </FormField>
                <FormField label="Previous School">
                  <Input
                    placeholder="Previous school name"
                    {...register("previous_school_name")}
                  />
                </FormField>
                <FormField label="Previous Class">
                  <Input
                    placeholder="e.g. Class 5"
                    {...register("previous_class")}
                  />
                </FormField>
              </FormGrid>
              <Div type="row" align="center" gap="sm">
                <input
                  type="checkbox"
                  id="reg_fee"
                  {...register("registration_fee_required")}
                />
                <label
                  htmlFor="reg_fee"
                  className="text-sm font-medium text-foreground/80 cursor-pointer"
                >
                  Registration fee payment required
                </label>
              </Div>
            </Div>

            {/* Section: Enquiry Info */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Enquiry Information
              </H2>
              <FormGrid>
                <FormField label="Enquiry Source" htmlFor="enquiry_source_id">
                  <ResponsiveSelect
                    id="enquiry_source_id"
                    {...register("enquiry_source_id")}
                    customPlaceholder="Select source"
                    options={sources.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </FormField>
                <FormField label="Assigned Teacher" htmlFor="assigned_teacher_id">
                  <ResponsiveSelect
                    id="assigned_teacher_id"
                    {...register("assigned_teacher_id")}
                    customPlaceholder="Select teacher"
                    options={teachers.map((t) => ({ value: t.id, label: `${t.first_name} ${t.last_name ?? ""}` }))}
                  />
                </FormField>
                <FormField label="Next Follow-up Date">
                  <Input type="date" {...register("next_followup_date")} />
                </FormField>
                <FormField label="Next Follow-up Time">
                  <Input type="time" {...register("next_followup_time")} />
                </FormField>
                {!isNew && (
                  <FormField label="Status" error={errors.status?.message} htmlFor="status">
                    <ResponsiveSelect
                      id="status"
                      {...register("status")}
                      disabled={isTerminal}
                      customPlaceholder="Select status"
                      options={STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                    />
                  </FormField>
                )}
                <FormField
                  label="Remarks"
                  required
                  className="col-span-full"
                  error={errors.remarks?.message}
                >
                  <textarea
                    rows={3}
                    placeholder="Add remarks about this enquiry…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    {...register("remarks")}
                  />
                </FormField>
              </FormGrid>
            </Div>
          </Div>
        </form>
      )}

      {/* Enquiry History Section */}
      {!isNew && (
        <Div type="col" gap="md">
          <Div type="row" justify="between" align="center">
            <Div type="col" gap="xs">
              <H2>Enquiry History</H2>
              {isTerminal && (
                <P color="muted" className="text-xs">
                  History is locked — enquiry is{" "}
                  {enquiry?.status === "ADMISSION_CONFIRMED"
                    ? "confirmed"
                    : "rejected"}
                  .
                </P>
              )}
            </Div>
            {canAddHistory && (
              <Button size="sm" onClick={() => handleAddEntryClick()}>
                <Plus size={14} /> Add Entry
              </Button>
            )}
          </Div>

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>Action</TableHeaderCell>
                <TableHeaderCell>Teacher Assigned</TableHeaderCell>
                <TableHeaderCell>Created Date</TableHeaderCell>
                <TableHeaderCell>Details</TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {history.length === 0 ? (
                <TableEmptyRow colSpan={4}>No history yet</TableEmptyRow>
              ) : (
                history.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell primary>
                      <Div type="row" align="center" gap="xs">
                        {ACTION_ICON[entry.action]}
                        <span>{entry.action.replace(/_/g, " ")}</span>
                      </Div>
                    </TableCell>
                    <TableCell>
                      {teachers.find((t) => t.id === entry.assigned_teacher_id)
                        ? `${teachers.find((t) => t.id === entry.assigned_teacher_id)?.first_name ?? ""} ${
                            teachers.find(
                              (t) => t.id === entry.assigned_teacher_id,
                            )?.last_name ?? ""
                          }`.trim()
                        : "—"}
                    </TableCell>
                    <TableCell>
                      {new Date(entry.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                      <P color="muted" className="text-xs">
                        {new Date(entry.created_at).toLocaleTimeString(
                          "en-IN",
                          { hour: "2-digit", minute: "2-digit" },
                        )}
                      </P>
                    </TableCell>
                    <TableCell>
                      <Div type="col" gap="xs">
                        <span className="font-semibold">{entry.action}</span>

                        {entry.action === "NEXT_FOLLOW_UP_UPDATE" && (
                          <>
                            {entry.next_followup_date && (
                              <P className="text-sm">
                                <span className="font-medium">
                                  Next Followup:
                                </span>{" "}
                                {new Date(
                                  entry.next_followup_date,
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "numeric",
                                })}
                                {entry.next_followup_time &&
                                  ` ${entry.next_followup_time}`}
                              </P>
                            )}
                          </>
                        )}

                        {entry.details && (
                          <P className="text-sm whitespace-pre-wrap">
                            Details: {entry.details}
                          </P>
                        )}

                        {entry.remarks && (
                          <P className="text-sm">
                            <span className="font-medium">Remarks:</span>{" "}
                            {entry.remarks}
                          </P>
                        )}
                      </Div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Div>
      )}

      {/* Add History Modal - Responsive */}
      <ResponsiveModalContainer
        isOpen={showHistoryModal}
        onClose={closeHistoryModal}
        title="Add History Entry"
      >
        <form onSubmit={historyForm.handleSubmit(handleAddHistory as any)}>
          <Div type="col" gap="sm" className="px-4 py-3 sm:py-3.5">
            <FormField
              label="Action"
              required
              error={historyForm.formState.errors.action?.message}
            >
              <Select
                {...historyForm.register("action")}
                disabled={lockedAction}
              >
                {ACTION_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </Select>
            </FormField>

            {/* Conditionally show follow-up date/time */}
            {historyForm.watch("action") === "NEXT_FOLLOW_UP_UPDATE" && (
              <Div type="grid" cols={2} gap="sm">
                <FormField
                  label="Next Follow-up Date"
                  required
                  error={
                    historyForm.formState.errors.next_followup_date?.message
                  }
                >
                  <Input
                    type="date"
                    {...historyForm.register("next_followup_date")}
                  />
                </FormField>
                <FormField
                  label="Next Follow-up Time"
                  error={
                    historyForm.formState.errors.next_followup_time?.message
                  }
                >
                  <Input
                    type="time"
                    {...historyForm.register("next_followup_time")}
                  />
                </FormField>
              </Div>
            )}

            <FormField
              label="Details"
              error={historyForm.formState.errors.details?.message}
            >
              <Input
                placeholder="Brief summary of what happened"
                {...historyForm.register("details")}
              />
            </FormField>
            <FormField
              label="Remarks"
              required
              error={historyForm.formState.errors.remarks?.message}
            >
              <textarea
                rows={2}
                placeholder="Add detailed remarks…"
                className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                {...historyForm.register("remarks")}
              />
            </FormField>
          </div>

          <div className="flex justify-end gap-2 px-4 py-2.5 border-t border-border/30">
            <Button
              type="button"
              variant="outline"
              onClick={closeHistoryModal}
            >
              Cancel
            </Button>
            <Button type="submit" loading={isHistorySubmitting}>
              Add Entry
            </Button>
          </div>
        </form>
      </ResponsiveModalContainer>
    </Div>
  );
}
