"use client";

import { Suspense, useEffect, useState } from "react";
import { Search, Plus, Trash2, ArrowLeft } from "lucide-react";
import { useLeaveAssigned } from "@/hooks/leave/useLeaveAssigned";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import type { Staff } from "@/types";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Button,
  Input,
  Select,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Badge,
  Spinner,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
} from "@/components/ui";
import {
  LEAVE_ASSIGNED_PAGE,
  LEAVE_VALIDITY_LABEL,
  LEAVE_PAY_TYPE_LABEL,
} from "@/constants/emp-leave.constants";
import { useStaffsPage } from "@/hooks/useStaffsPage";

// ─── Step 1: Employee picker ──────────────────────────────────────────────────
interface EmployeePickerProps {
  onSelect: (employee: Staff) => void;
}

function EmployeePicker({ onSelect }: EmployeePickerProps) {
  const [search, setSearch] = useState("");

  const { staffList, isLoading, setFilters } = useStaffsPage({
    search,
    limit: 20,
  });

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev: any) => ({
        ...prev,
        search: search || undefined,
        page: 1,
      }));
    }, 350);

    return () => clearTimeout(t);
  }, [search, setFilters]);

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={LEAVE_ASSIGNED_PAGE.pageHeading.title}
        subtitle={LEAVE_ASSIGNED_PAGE.pageHeading.subtitle}
      />

      {/* Search bar */}
      <Div type="row" gap="md" align="center">
        <Div
          type="row"
          align="center"
          gap="sm"
          className="relative flex-1 max-w-md"
        >
          <Search
            size={15}
            className="absolute left-3 text-muted-foreground pointer-events-none"
          />
          <Input
            className="pl-9"
            placeholder={LEAVE_ASSIGNED_PAGE.filters.searchEmployee}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Div>
      </Div>

      {/* Employee cards */}
      {isLoading ? (
        <Div type="row" justify="center" className="py-16">
          <Spinner size="lg" />
        </Div>
      ) : staffList.length === 0 ? (
        <Div type="col" align="center" gap="sm" className="py-16">
          <P color="muted">{LEAVE_ASSIGNED_PAGE.empty.noEmployees}</P>
        </Div>
      ) : (
        <Div type="grid" cols={3} gap="md">
          {staffList.map((staff) => {
            const name = `${staff.first_name} ${staff.last_name ?? ""}`.trim();
            const initials =
              `${staff.first_name?.[0] ?? ""}${staff.last_name?.[0] ?? ""}`.toUpperCase();
            return (
              <Div
                key={staff.id}
                boxCard
                interactive
                onClick={() => onSelect(staff)}
                className="cursor-pointer"
              >
                <Div type="row" align="center" gap="md">
                  {/* Avatar */}
                  <Div className="h-10 w-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold text-primary">
                    {initials}
                  </Div>
                  <Div type="col" gap="xs" className="flex-1 min-w-0">
                    <P className="font-medium truncate">{name}</P>
                    <P color="muted" className="text-xs truncate">
                      {staff.email ?? staff.phone ?? "—"}
                    </P>
                    {staff.designation && (
                      <P color="muted" className="text-xs truncate">
                        {staff.designation}
                      </P>
                    )}
                  </Div>
                </Div>
              </Div>
            );
          })}
        </Div>
      )}
    </Div>
  );
}

// ─── Step 2: Assignments table for the selected employee ──────────────────────
interface AssignmentsViewProps {
  employee: Staff;
  onBack: () => void;
}

function AssignmentsView({ employee, onBack }: AssignmentsViewProps) {
  const { years } = useAcademicYears();
  const employeeName =
    `${employee.first_name} ${employee.last_name ?? ""}`.trim();

  const {
    assignedLeaves,
    pagination,
    filters,
    isLoading,
    updateFilters,
    revokeLeave,
    showAssignModal,
    openAssignModal,
    closeAssignModal,
    form,
    handleAssign,
    isAssigning,
    availableLeaveTypes,
    isLoadingLeaveTypes,
  } = useLeaveAssigned(employee.id);

  const {
    register,
    formState: { errors },
  } = form;

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={LEAVE_ASSIGNED_PAGE.pageHeading.title}
        subtitle={`${employeeName} · ${pagination?.total ?? 0} ${LEAVE_ASSIGNED_PAGE.pageHeading.assignmentsSuffix}`}
        actions={
          <Div type="row" gap="sm">
            <Button variant="outline" size="sm" onClick={onBack}>
              <ArrowLeft size={14} />
              {LEAVE_ASSIGNED_PAGE.buttons.back}
            </Button>
            <Button onClick={openAssignModal}>
              <Plus size={16} />
              {LEAVE_ASSIGNED_PAGE.buttons.assignLeave}
            </Button>
          </Div>
        }
      />

      {/* Employee info pill */}
      <Div type="row" align="center" gap="sm">
        <Div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-xs font-semibold text-primary">
          {`${employee.first_name?.[0] ?? ""}${employee.last_name?.[0] ?? ""}`.toUpperCase()}
        </Div>
        <Div type="col" gap="xs">
          <P className="text-sm font-medium">{employeeName}</P>
          {employee?.designation && (
            <P color="muted" className="text-xs">
              {employee?.designation}
            </P>
          )}
        </Div>
      </Div>

      {/* Filter by academic year */}
      <Div type="row" gap="md" align="center" wrap>
        <Select
          width="sm"
          value={filters.academic_year_id ?? ""}
          onChange={(e) =>
            updateFilters({ academic_year_id: e.target.value || undefined })
          }
        >
          <option value="">{LEAVE_ASSIGNED_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </Select>
      </Div>

      {/* Assignments table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{LEAVE_ASSIGNED_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.leaveName}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.validity}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.payType}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.totalDays}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.usedDays}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.remainingDays}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.academicYear}
            </TableHeaderCell>
            <TableHeaderCell>
              {LEAVE_ASSIGNED_PAGE.table.actions}
            </TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={9}>
              <Spinner />
            </TableEmptyRow>
          ) : assignedLeaves.length === 0 ? (
            <TableEmptyRow colSpan={9}>
              {LEAVE_ASSIGNED_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            assignedLeaves.map((al, i) => (
              <TableRow key={al.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{al.leave_type.leave_name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {LEAVE_VALIDITY_LABEL[al.leave_type.leave_validity]}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      al.leave_type.leave_pay_type === "PAID"
                        ? "success"
                        : "warning"
                    }
                  >
                    {LEAVE_PAY_TYPE_LABEL[al.leave_type.leave_pay_type]}
                  </Badge>
                </TableCell>
                <TableCell>{al.leave_type.leave_count_days}</TableCell>
                <TableCell>
                  <P
                    className={
                      al.used_days > 0 ? "font-medium text-orange-600" : ""
                    }
                  >
                    {al.used_days}
                  </P>
                </TableCell>
                <TableCell>
                  <P
                    className={
                      al.remaining_days <= 0
                        ? "font-semibold text-destructive"
                        : "font-semibold text-emerald-600"
                    }
                  >
                    {al.remaining_days}
                  </P>
                </TableCell>
                <TableCell>
                  {years.find((y) => y.id === al.academic_year_id)?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon-sm"
                    variant="destructive"
                    onClick={() => revokeLeave(al.id)}
                    title={LEAVE_ASSIGNED_PAGE.buttons.revoke}
                  >
                    <Trash2 size={14} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {/* Assign Leave Modal */}
      {showAssignModal && (
        <Modal
          onClose={closeAssignModal}
          title={LEAVE_ASSIGNED_PAGE.modal.title}
          size="sm"
        >
          <form onSubmit={handleAssign}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField
                  label={`${LEAVE_ASSIGNED_PAGE.labels.leaveType} *`}
                  error={errors.leave_type_id?.message}
                >
                  <Select
                    {...register("leave_type_id")}
                    disabled={isLoadingLeaveTypes}
                  >
                    <option value="">
                      {isLoadingLeaveTypes ? "Loading…" : "Select leave type"}
                    </option>
                    {availableLeaveTypes.map((lt) => (
                      <option key={lt.id} value={lt.id}>
                        {lt.leave_name} ({lt.leave_count_days} days ·{" "}
                        {LEAVE_PAY_TYPE_LABEL[lt.leave_pay_type]})
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  label={`${LEAVE_ASSIGNED_PAGE.labels.academicYear} *`}
                  error={errors.academic_year_id?.message}
                >
                  <Select {...register("academic_year_id")}>
                    <option value="">Select academic year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </FormField>
              </Div>
            </ModalBody>
            <ModalFooter>
              <Button
                type="button"
                variant="outline"
                onClick={closeAssignModal}
              >
                {LEAVE_ASSIGNED_PAGE.buttons.cancel}
              </Button>
              <Button type="submit" loading={isAssigning}>
                {LEAVE_ASSIGNED_PAGE.buttons.save}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
  );
}

// ─── Root page — orchestrates the two steps ───────────────────────────────────
function LeaveAssignedContent() {
  const [selectedEmployee, setSelectedEmployee] = useState<Staff | null>(null);

  if (selectedEmployee) {
    return (
      <AssignmentsView
        employee={selectedEmployee}
        onBack={() => setSelectedEmployee(null)}
      />
    );
  }

  return <EmployeePicker onSelect={setSelectedEmployee} />;
}

export default function LeaveAssignedPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <LeaveAssignedContent />
    </Suspense>
  );
}
