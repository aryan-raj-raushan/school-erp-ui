"use client";

import { Suspense } from "react";
import { Search, X, CalendarDays, User, Users } from "lucide-react";
import { useLeaveApply } from "@/hooks/leave/useLeaveApply";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  H2,
  H3,
  P,
  Button,
  Input,
  Select,
  FormField,
  Badge,
  Spinner,
} from "@/components/ui";
import {
  LEAVE_STATUS_BADGE,
  LEAVE_PAY_TYPE_LABEL,
  LEAVE_APPLY_PAGE as PAGE,
} from "@/constants/emp-leave.constants";

function LeaveApplyContent() {
  const { years } = useAcademicYears();

  const {
    form,
    applyMode,
    totalDays,
    currentLeaveBalance,
    employeeLeaves,
    isLoadingLeaves,
    staffSearch,
    setStaffSearch,
    staffList,
    isLoadingStaff,
    selectedEmployee,
    showEmployeePicker,
    setShowEmployeePicker,
    selectEmployee,
    clearEmployee,
    recentApplications,
    isLoadingRecent,
    handleSubmit,
    isSubmitting,
    resetForm,
  } = useLeaveApply();

  const {
    register,
    formState: { errors },
    watch,
  } = form;

  const selectedLeaveTypeId = watch("leave_type_id");
  const selectedAcademicYearId = watch("academic_year_id");

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={PAGE.pageHeading.title}
        subtitle={PAGE.pageHeading.subtitle}
      />

      <form onSubmit={handleSubmit}>
        <Div type="grid" cols={3} gap="lg">
          {/* ── Left column: main form (spans 2 cols) ── */}
          <Div type="col" gap="lg" className="col-span-2">
            {/* ── Section 1: Who is this leave for? ────────────────────── */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {PAGE.sections.selectEmployee}
              </H2>

              {/* Mode toggle */}
              <Div type="row" gap="sm">
                <Button
                  type="button"
                  onClick={() => form.setValue("apply_mode", "self")}
                  className={[
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    applyMode === "self"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/40",
                  ].join(" ")}
                >
                  <User size={14} />
                  {PAGE.labels.myself}
                </Button>
                <Button
                  type="button"
                  onClick={() => form.setValue("apply_mode", "behalf")}
                  className={[
                    "flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition-colors",
                    applyMode === "behalf"
                      ? "border-primary bg-primary/10"
                      : "border-border bg-background text-muted-foreground hover:bg-muted/40",
                  ].join(" ")}
                >
                  <Users size={14} />
                  {PAGE.labels.onBehalf}
                </Button>
              </Div>

              {/* Employee picker (only shown in behalf mode) */}
              {applyMode === "behalf" && (
                <Div type="col" gap="sm">
                  {selectedEmployee ? (
                    /* Selected employee chip */
                    <Div
                      type="row"
                      align="center"
                      gap="md"
                      className="rounded-lg border border-primary/30 bg-primary/5 px-4 py-3"
                    >
                      <Div className="h-9 w-9 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                        {`${selectedEmployee.first_name?.[0] ?? ""}${selectedEmployee.last_name?.[0] ?? ""}`.toUpperCase()}
                      </Div>
                      <Div type="col" gap="xs" className="flex-1 min-w-0">
                        <P className="font-medium text-sm">
                          {`${selectedEmployee.first_name} ${selectedEmployee.last_name ?? ""}`.trim()}
                        </P>
                      </Div>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={clearEmployee}
                      >
                        <X size={14} />
                        {PAGE.buttons.changeEmployee}
                      </Button>
                    </Div>
                  ) : (
                    /* Search + dropdown */
                    <Div type="col" gap="sm">
                      <FormField
                        label={PAGE.labels.employee}
                        error={errors.employee_id?.message}
                      >
                        <Div className="relative">
                          <Search
                            size={14}
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                          />
                          <Input
                            className="pl-9"
                            placeholder={PAGE.placeholders.searchEmployee}
                            value={staffSearch}
                            onChange={(e) => {
                              setStaffSearch(e.target.value);
                              setShowEmployeePicker(true);
                            }}
                            onFocus={() => setShowEmployeePicker(true)}
                          />
                        </Div>
                      </FormField>

                      {/* Dropdown results */}
                      {showEmployeePicker && (
                        <Div
                          type="col"
                          gap="xs"
                          className="rounded-lg border border-border bg-card shadow-md max-h-56 overflow-y-auto"
                        >
                          {isLoadingStaff ? (
                            <Div type="row" justify="center" className="py-4">
                              <Spinner />
                            </Div>
                          ) : staffList.length === 0 ? (
                            <P
                              color="muted"
                              className="p-3 text-sm text-center"
                            >
                              No employees found
                            </P>
                          ) : (
                            staffList.map((staff) => {
                              const name =
                                `${staff.first_name} ${staff.last_name ?? ""}`.trim();
                              return (
                                <Button
                                  key={staff.id}
                                  type="button"
                                  onClick={() => selectEmployee(staff)}
                                  className="flex items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-muted/50 transition-colors"
                                >
                                  <Div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
                                    {`${staff.first_name?.[0] ?? ""}${staff.last_name?.[0] ?? ""}`.toUpperCase()}
                                  </Div>
                                  <Div type="col" gap="xs">
                                    <Div className="font-medium">{name}</Div>
                                    
                                  </Div>
                                </Button>
                              );
                            })
                          )}
                        </Div>
                      )}
                    </Div>
                  )}
                </Div>
              )}
            </Div>

            {/* ── Section 2: Leave Details ──────────────────────────────── */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {PAGE.sections.leaveDetails}
              </H2>

              {/* Academic Year */}
              <FormField
                label={`${PAGE.labels.academicYear} *`}
                error={errors.academic_year_id?.message}
              >
                <Select {...register("academic_year_id")}>
                  <option value="">{PAGE.placeholders.selectYear}</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name}
                    </option>
                  ))}
                </Select>
              </FormField>

              {/* Leave Type — only shown once we know who + what year */}
              <FormField
                label={`${PAGE.labels.leaveType} *`}
                error={errors.leave_type_id?.message}
              >
                {!selectedAcademicYearId ? (
                  <P color="muted" className="text-sm py-1">
                    {PAGE.info.selectYearFirst}
                  </P>
                ) : applyMode === "behalf" && !selectedEmployee ? (
                  <P color="muted" className="text-sm py-1">
                    {PAGE.info.selectEmployeeFirst}
                  </P>
                ) : isLoadingLeaves ? (
                  <Div type="row" align="center" gap="sm" className="py-1">
                    <Spinner size="sm" />
                    <P color="muted" className="text-sm">
                      Loading leave balance…
                    </P>
                  </Div>
                ) : employeeLeaves.length === 0 ? (
                  <P color="muted" className="text-sm py-1">
                    {PAGE.info.noAssignedLeaves}
                  </P>
                ) : (
                  <Select {...register("leave_type_id")}>
                    <option value="">
                      {PAGE.placeholders.selectLeaveType}
                    </option>
                    {employeeLeaves.map((el) => (
                      <option key={el.leave_type_id} value={el.leave_type_id}>
                        {el.leave_type.leave_name} — {el.remaining_days} days
                        remaining (
                        {LEAVE_PAY_TYPE_LABEL[el.leave_type.leave_pay_type]})
                      </option>
                    ))}
                  </Select>
                )}
              </FormField>

              {/* Date range */}
              <Div type="grid" cols={2} gap="md">
                <FormField
                  label={`${PAGE.labels.startDate} *`}
                  error={errors.start_date?.message}
                >
                  <Input type="date" {...register("start_date")} />
                </FormField>
                <FormField
                  label={`${PAGE.labels.endDate} *`}
                  error={errors.end_date?.message}
                >
                  <Input type="date" {...register("end_date")} />
                </FormField>
              </Div>

              {/* Reason */}
              <FormField
                label={PAGE.labels.reason}
                error={errors.reason?.message}
              >
                <textarea
                  rows={3}
                  placeholder={PAGE.placeholders.reason}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                  {...register("reason")}
                />
              </FormField>

              {/* Info note */}
              <P color="muted" className="text-xs">
                {PAGE.info.daysCalculation}
              </P>
            </Div>

            {/* Actions */}
            <Div type="row" justify="end" gap="sm">
              <Button type="button" variant="outline" onClick={resetForm}>
                {PAGE.buttons.reset}
              </Button>
              <Button type="submit" loading={isSubmitting}>
                {PAGE.buttons.submit}
              </Button>
            </Div>
          </Div>

          {/* ── Right column: summary panel ──────────────────────────────── */}
          <Div type="col" gap="md">
            {/* Leave balance card */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {PAGE.sections.summary}
              </H3>

              {currentLeaveBalance ? (
                <Div type="col" gap="sm">
                  <P className="font-semibold">
                    {currentLeaveBalance.leave_type.leave_name}
                  </P>
                  <Div type="row" gap="sm">
                    <Badge
                      variant={
                        currentLeaveBalance.leave_type.leave_pay_type === "PAID"
                          ? "success"
                          : "warning"
                      }
                    >
                      {
                        LEAVE_PAY_TYPE_LABEL[
                          currentLeaveBalance.leave_type.leave_pay_type
                        ]
                      }
                    </Badge>
                  </Div>

                  {/* Balance breakdown */}
                  <Div type="col" gap="xs" className="mt-1">
                    <Div type="row" justify="between">
                      <P color="muted" className="text-xs">
                        {PAGE.labels.balance}
                      </P>
                      <P className="text-xs font-medium">
                        {currentLeaveBalance.leave_type.leave_count_days} days
                      </P>
                    </Div>
                    <Div type="row" justify="between">
                      <P color="muted" className="text-xs">
                        {PAGE.labels.used}
                      </P>
                      <P className="text-xs font-medium text-orange-600">
                        {currentLeaveBalance.used_days} days
                      </P>
                    </Div>
                    <Div type="row" justify="between">
                      <P color="muted" className="text-xs">
                        {PAGE.labels.remaining}
                      </P>
                      <P
                        className={[
                          "text-xs font-semibold",
                          currentLeaveBalance.remaining_days <= 0
                            ? "text-destructive"
                            : "text-emerald-600",
                        ].join(" ")}
                      >
                        {currentLeaveBalance.remaining_days} days
                      </P>
                    </Div>

                    {/* Progress bar */}
                    <Div className="mt-1 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <Div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${Math.min(
                            100,
                            (currentLeaveBalance.used_days /
                              currentLeaveBalance.leave_type.leave_count_days) *
                              100,
                          )}%`,
                        }}
                      />
                    </Div>
                  </Div>

                  {/* Days being requested */}
                  {totalDays > 0 && (
                    <Div
                      type="row"
                      justify="between"
                      align="center"
                      className="mt-2 rounded-lg bg-muted/40 px-3 py-2"
                    >
                      <Div type="row" align="center" gap="xs">
                        <CalendarDays
                          size={13}
                          className="text-muted-foreground"
                        />
                        <P color="muted" className="text-xs">
                          Requesting
                        </P>
                      </Div>
                      <P
                        className={[
                          "text-sm font-semibold",
                          totalDays > currentLeaveBalance.remaining_days
                            ? "text-destructive"
                            : "text-foreground",
                        ].join(" ")}
                      >
                        {totalDays} day{totalDays !== 1 ? "s" : ""}
                      </P>
                    </Div>
                  )}
                </Div>
              ) : (
                <P color="muted" className="text-sm">
                  {selectedLeaveTypeId
                    ? "Loading balance…"
                    : "Select a leave type to see balance."}
                </P>
              )}
            </Div>

            {/* Recent applications panel */}
            <Div
              type="col"
              gap="md"
              className="rounded-xl border border-border bg-card p-5"
            >
              <H3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                {PAGE.table.recentTitle}
              </H3>

              {isLoadingRecent ? (
                <Div type="row" justify="center" className="py-4">
                  <Spinner />
                </Div>
              ) : recentApplications.length === 0 ? (
                <P color="muted" className="text-sm">
                  {PAGE.table.noRecent}
                </P>
              ) : (
                <Div type="col" gap="sm">
                  {recentApplications.map((app) => (
                    <Div
                      key={app.id}
                      type="col"
                      gap="xs"
                      className="rounded-lg border border-border/50 px-3 py-2.5"
                    >
                      <Div type="row" justify="between" align="center">
                        <P className="text-xs font-medium">
                          {new Date(app.start_date).toLocaleDateString(
                            "en-IN",
                            {
                              day: "2-digit",
                              month: "short",
                            },
                          )}{" "}
                          →{" "}
                          {new Date(app.end_date).toLocaleDateString("en-IN", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </P>
                        <Badge variant={LEAVE_STATUS_BADGE[app.status]}>
                          {app.status}
                        </Badge>
                      </Div>
                      <P color="muted" className="text-xs">
                        {app.total_days} day{app.total_days !== 1 ? "s" : ""}
                        {app.reason ? ` · ${app.reason}` : ""}
                      </P>
                    </Div>
                  ))}
                </Div>
              )}
            </Div>
          </Div>
        </Div>
      </form>
    </Div>
  );
}

export default function LeaveApplyPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <LeaveApplyContent />
    </Suspense>
  );
}
