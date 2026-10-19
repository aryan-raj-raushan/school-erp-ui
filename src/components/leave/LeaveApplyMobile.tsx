"use client";

import { useState } from "react";
import { CalendarDays, ChevronRight, UserRound } from "lucide-react";
import {
  Badge,
  BottomSheet,
  Button,
  ControlledChoiceChips,
  ControlledSelectField,
  FieldRow,
  FormGroup,
  ListAvatar,
  MobileTextArea,
  MobileTextField,
  StickyActionBar,
} from "@/components/ui";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import type { useLeaveApply } from "@/hooks/leave/useLeaveApply";
import {
  LEAVE_APPLY_PAGE as PAGE,
  LEAVE_PAY_TYPE_LABEL,
  LEAVE_STATUS_BADGE,
} from "@/constants/emp-leave.constants";
import { formatDate } from "@/lib/utils";

type LeaveApplyState = ReturnType<typeof useLeaveApply>;

const MODE_OPTIONS = [
  { value: "self", label: "For myself" },
  { value: "behalf", label: "On behalf" },
] as const;

function BalanceCard({ state }: { state: LeaveApplyState }) {
  const balance = state.currentLeaveBalance;
  if (!balance) return null;

  const total = balance.leave_type.leave_count_days;
  const usedPercent =
    total > 0 ? Math.min(100, (balance.used_days / total) * 100) : 0;
  const overRequest = state.totalDays > balance.remaining_days;

  return (
    <section className="rounded-3xl border border-border/70 bg-muted/30 p-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold">
          {balance.leave_type.leave_name}
        </h3>
        <Badge
          variant={
            balance.leave_type.leave_pay_type === "PAID" ? "success" : "warning"
          }
        >
          {LEAVE_PAY_TYPE_LABEL[balance.leave_type.leave_pay_type]}
        </Badge>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-lg font-bold">{total}</p>
          <p className="text-[11px] text-muted-foreground">
            {PAGE.labels.balance}
          </p>
        </div>
        <div>
          <p className="text-lg font-bold text-orange-600">
            {balance.used_days}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {PAGE.labels.used}
          </p>
        </div>
        <div>
          <p
            className={`text-lg font-bold ${
              balance.remaining_days <= 0
                ? "text-destructive"
                : "text-emerald-600"
            }`}
          >
            {balance.remaining_days}
          </p>
          <p className="text-[11px] text-muted-foreground">
            {PAGE.labels.remaining}
          </p>
        </div>
      </div>

      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary"
          style={{ width: `${usedPercent}%` }}
        />
      </div>

      {state.totalDays > 0 && (
        <div className="mt-3 flex items-center justify-between rounded-2xl bg-background px-3 py-2.5">
          <span className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays size={16} /> Requesting
          </span>
          <span
            className={`text-sm font-semibold ${
              overRequest ? "text-destructive" : ""
            }`}
          >
            {state.totalDays} day{state.totalDays !== 1 ? "s" : ""}
          </span>
        </div>
      )}
    </section>
  );
}

/**
 * Phone layout of the "Apply leave" form: mode chips, employee sheet,
 * year / leave type pickers, balance summary, dates, reason and a pinned
 * submit bar. Driven by the same `useLeaveApply` state as desktop.
 */
export function LeaveApplyMobile({ state }: { state: LeaveApplyState }) {
  const { years } = useAcademicYears();
  const [employeeSheetOpen, setEmployeeSheetOpen] = useState(false);
  const { form } = state;
  const { control, register, watch, formState } = form;
  const errors = formState.errors;

  const yearId = watch("academic_year_id");
  const needsEmployee = state.applyMode === "behalf" && !state.selectedEmployee;
  const employeeName = state.selectedEmployee
    ? `${state.selectedEmployee.first_name} ${
        state.selectedEmployee.last_name ?? ""
      }`.trim()
    : "";

  const leaveTypePlaceholder = !yearId
    ? PAGE.info.selectYearFirst
    : needsEmployee
    ? PAGE.info.selectEmployeeFirst
    : state.isLoadingLeaves
    ? "Loading leave balance…"
    : state.employeeLeaves.length === 0
    ? PAGE.info.noAssignedLeaves
    : PAGE.placeholders.selectLeaveType;

  return (
    <>
      <form
        onSubmit={state.handleSubmit}
        noValidate
        className="flex flex-col gap-5 pt-3"
      >
        <h1 className="text-xl font-bold">{PAGE.pageHeading.title}</h1>

        <FormGroup title="Who is this for?">
          <ControlledChoiceChips
            control={control}
            name="apply_mode"
            label="Applying"
            options={MODE_OPTIONS}
          />
          {state.applyMode === "behalf" && (
            <div data-invalid={errors.employee_id ? "true" : undefined}>
              <button
                type="button"
                onClick={() => setEmployeeSheetOpen(true)}
                className={`flex min-h-16 w-full items-center gap-3 rounded-2xl border bg-white px-4 py-2 text-left active:bg-muted dark:bg-neutral-900 ${
                  errors.employee_id ? "border-destructive" : "border-border"
                }`}
              >
                {state.selectedEmployee ? (
                  <ListAvatar
                    src={state.selectedEmployee.profile_image}
                    name={employeeName}
                    size={40}
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserRound size={20} />
                  </span>
                )}
                <span className="min-w-0 flex-1">
                  <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    {PAGE.labels.employee}
                  </span>
                  <span className="block truncate text-base">
                    {employeeName || "Choose an employee"}
                  </span>
                </span>
                <ChevronRight size={18} className="text-muted-foreground" />
              </button>
              {errors.employee_id?.message && (
                <p className="mt-1.5 px-1 text-xs font-medium text-destructive">
                  {errors.employee_id.message}
                </p>
              )}
            </div>
          )}
        </FormGroup>

        <FormGroup title="Leave details">
          <ControlledSelectField
            control={control}
            name="academic_year_id"
            label={PAGE.labels.academicYear}
            required
            placeholder={PAGE.placeholders.selectYear}
            options={years.map((y) => ({ value: y.id, label: y.name }))}
          />
          <ControlledSelectField
            control={control}
            name="leave_type_id"
            label={PAGE.labels.leaveType}
            required
            disabled={
              !yearId || needsEmployee || state.employeeLeaves.length === 0
            }
            placeholder={leaveTypePlaceholder}
            options={state.employeeLeaves.map((el) => ({
              value: el.leave_type_id,
              label: `${el.leave_type.leave_name} · ${el.remaining_days} left`,
            }))}
          />
          <BalanceCard state={state} />
          <FieldRow>
            <MobileTextField
              label={PAGE.labels.startDate}
              type="date"
              required
              error={errors.start_date?.message}
              {...register("start_date")}
            />
            <MobileTextField
              label={PAGE.labels.endDate}
              type="date"
              required
              error={errors.end_date?.message}
              {...register("end_date")}
            />
          </FieldRow>
          <MobileTextArea
            label={PAGE.labels.reason}
            placeholder={PAGE.placeholders.reason}
            error={errors.reason?.message}
            {...register("reason")}
          />
          <p className="px-1 text-xs text-muted-foreground">
            {PAGE.info.daysCalculation}
          </p>
        </FormGroup>

        <FormGroup title={PAGE.table.recentTitle}>
          {state.isLoadingRecent ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Loading…
            </p>
          ) : state.recentApplications.length === 0 ? (
            <p className="py-4 text-center text-sm text-muted-foreground">
              {PAGE.table.noRecent}
            </p>
          ) : (
            <ul className="flex flex-col gap-2.5">
              {state.recentApplications.map((app) => (
                <li
                  key={app.id}
                  className="rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {formatDate(app.start_date)} → {formatDate(app.end_date)}
                    </p>
                    <Badge variant={LEAVE_STATUS_BADGE[app.status]}>
                      {app.status}
                    </Badge>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {app.total_days} day{app.total_days !== 1 ? "s" : ""}
                    {app.reason ? ` · ${app.reason}` : ""}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </FormGroup>

        <StickyActionBar>
          <Button
            type="button"
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={state.resetForm}
          >
            Reset
          </Button>
          <Button
            type="submit"
            size="lg"
            className="flex-[2]"
            loading={state.isSubmitting}
          >
            {PAGE.buttons.submit}
          </Button>
        </StickyActionBar>
      </form>

      <BottomSheet
        isOpen={employeeSheetOpen}
        onClose={() => setEmployeeSheetOpen(false)}
        title="Choose employee"
        maxHeight="85dvh"
      >
        <input
          type="search"
          value={state.staffSearch}
          onChange={(e) => state.setStaffSearch(e.target.value)}
          placeholder={PAGE.placeholders.searchEmployee}
          className="mb-3 h-12 w-full rounded-2xl border border-border bg-transparent px-4 text-base outline-none focus:border-primary"
        />
        {state.isLoadingStaff ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            Loading…
          </p>
        ) : state.staffList.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No employees found
          </p>
        ) : (
          <ul>
            {state.staffList.map((staff) => {
              const name = `${staff.first_name} ${
                staff.last_name ?? ""
              }`.trim();
              return (
                <li key={staff.id}>
                  <button
                    type="button"
                    onClick={() => {
                      state.selectEmployee(staff);
                      setEmployeeSheetOpen(false);
                    }}
                    className="flex min-h-16 w-full items-center gap-3 rounded-xl px-2 text-left active:bg-muted"
                  >
                    <ListAvatar
                      src={staff.profile_image}
                      name={name}
                      size={44}
                    />
                    <span className="min-w-0 flex-1 truncate text-[15px] font-medium">
                      {name}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </BottomSheet>
    </>
  );
}
