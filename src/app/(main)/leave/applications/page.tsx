'use client';

import { Suspense, useEffect, useState, useMemo } from 'react';
import { CheckCircle2, XCircle, Plus, X } from 'lucide-react';
import { useLeaveApplications } from '@/hooks/leave/useLeaveApplications';
import { useAcademicYears } from '@/hooks/useAcademicYears';
import { useAuthStore } from '@/store/auth.store';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div,
  P,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
  PageCol,
  FilterBar,
  ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';
import {
  LEAVE_APPLICATION_PAGE,
  LEAVE_STATUS_OPTIONS,
  LEAVE_STATUS_BADGE,
  LEAVE_PAY_TYPE_LABEL,
} from '@/constants/emp-leave.constants';
import type { LeaveApplicationFilters, LeaveApplication } from '@/types/leave.types';
import { useLeaveTypes } from '@/hooks/leave/useLeaveTypes';

function LeaveApplicationsContent() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'SCHOOL_ADMIN';
  const employeeId = user?.id ?? '';

  const { years } = useAcademicYears();

  const {leaveTypes:allLeaveTypes} = useLeaveTypes();

  const {
    applications,
    pagination,
    filters,
    isLoading,
    updateFilters,
    cancelLeave,
    // Apply modal
    showApplyModal,
    openApplyModal,
    closeApplyModal,
    applyForm,
    handleApply,
    isApplying,
    employeeLeaves,
    isLoadingEmployeeLeaves,
    // Review modal
    showReviewModal,
    openReviewModal,
    closeReviewModal,
    reviewForm,
    handleReview,
    isReviewing,
    selectedApplication,
    reviewingStatus,
  } = useLeaveApplications();

  const {
    register: applyRegister,
    formState: { errors: applyErrors },
    watch: applyWatch,
  } = applyForm;

  const {
    register: reviewRegister,
    formState: { errors: reviewErrors },
  } = reviewForm;

  function handleFilterChange(next: Partial<LeaveApplicationFilters>) {
    updateFilters(next);
  }

  const columns = useMemo<ColumnDef<LeaveApplication>[]>(
    () => [
      {
        id: 'index',
        header: LEAVE_APPLICATION_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: 'leave_type_id',
        header: LEAVE_APPLICATION_PAGE.table.leaveType,
        meta: { primary: true },
        cell: ({ row }) => {
          const leaveType = allLeaveTypes.find(
            (lt) => lt.id === row.original.leave_type_id,
          );
          return leaveType?.leave_name ?? '—';
        },
      },
      {
        accessorKey: 'start_date',
        header: LEAVE_APPLICATION_PAGE.table.startDate,
        cell: ({ row }) =>
          new Date(row.original.start_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
      {
        accessorKey: 'end_date',
        header: LEAVE_APPLICATION_PAGE.table.endDate,
        cell: ({ row }) =>
          new Date(row.original.end_date).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
      {
        accessorKey: 'total_days',
        header: LEAVE_APPLICATION_PAGE.table.totalDays,
        cell: ({ row }) => (
          <P className="font-medium">{row.original.total_days} days</P>
        ),
      },
      {
        accessorKey: 'reason',
        header: LEAVE_APPLICATION_PAGE.table.reason,
        cell: ({ row }) => row.original.reason ?? '—',
      },
      {
        accessorKey: 'status',
        header: LEAVE_APPLICATION_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={LEAVE_STATUS_BADGE[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: LEAVE_APPLICATION_PAGE.table.appliedOn,
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          }),
      },
      {
        accessorKey: 'remarks',
        header: LEAVE_APPLICATION_PAGE.table.remarks,
        cell: ({ row }) => row.original.remarks ?? '—',
      },
      {
        id: 'actions',
        header: LEAVE_APPLICATION_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="sm">
            {/* Admin: approve / reject on PENDING */}
            {isAdmin && row.original.status === 'PENDING' && (
              <>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => openReviewModal(row.original, 'APPROVED')}
                  title={LEAVE_APPLICATION_PAGE.buttons.approve}
                >
                  <CheckCircle2
                    size={14}
                    className="text-emerald-600"
                  />
                </Button>
                <Button
                  size="icon-sm"
                  variant="ghost"
                  onClick={() => openReviewModal(row.original, 'REJECTED')}
                  title={LEAVE_APPLICATION_PAGE.buttons.reject}
                >
                  <XCircle size={14} className="text-destructive" />
                </Button>
              </>
            )}
            {/* Employee: cancel own PENDING application */}
            {!isAdmin &&
              row.original.employee_id === employeeId &&
              row.original.status === 'PENDING' && (
                <Button
                  size="icon-sm"
                  variant="destructive"
                  onClick={() => cancelLeave(row.original.id)}
                  title={LEAVE_APPLICATION_PAGE.buttons.cancelApplication}
                >
                  <X size={14} />
                </Button>
              )}
          </Div>
        ),
      },
    ],
    [isAdmin, employeeId, allLeaveTypes, openReviewModal, cancelLeave],
  );

  return (
    <PageCol>
      <PageHeader
        title={LEAVE_APPLICATION_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} applications` : ''}
        actions={
          !isAdmin ? (
            <Button onClick={() => openApplyModal(employeeId)}>
              <Plus size={16} />
              {LEAVE_APPLICATION_PAGE.buttons.applyLeave}
            </Button>
          ) : null
        }
      />

      <FilterBar>
        <ResponsiveSelect
          value={filters.status ?? ''}
          onChange={(e) =>
            handleFilterChange({ status: (e.target.value as any) || undefined })
          }
          options={LEAVE_STATUS_OPTIONS}
          customPlaceholder={LEAVE_APPLICATION_PAGE.filters.allStatus || 'All Statuses'}
        />

        <ResponsiveSelect
          value={filters.academic_year_id ?? ''}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
            })
          }
          options={years.map((y) => ({ value: y.id, label: y.name }))}
          customPlaceholder={LEAVE_APPLICATION_PAGE.filters.allYears}
        />

        <ResponsiveSelect
          value={filters.leave_type_id ?? ''}
          onChange={(e) =>
            handleFilterChange({
              leave_type_id: e.target.value || undefined,
            })
          }
          options={allLeaveTypes.map((lt) => ({ value: lt.id, label: lt.leave_name }))}
          customPlaceholder={LEAVE_APPLICATION_PAGE.filters.allLeaveTypes}
        />

        {/* Date range */}
        <Input
          type="date"
          width="sm"
          value={filters.from_date ?? ''}
          onChange={(e) =>
            handleFilterChange({ from_date: e.target.value || undefined })
          }
          placeholder="From date"
        />
        <Input
          type="date"
          width="sm"
          value={filters.to_date ?? ''}
          onChange={(e) =>
            handleFilterChange({ to_date: e.target.value || undefined })
          }
          placeholder="To date"
        />
      </FilterBar>

      <DataTable
        columns={columns}
        data={applications}
        isLoading={isLoading}
        emptyText={LEAVE_APPLICATION_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
      />

      {/* ─── Apply Leave Modal ────────────────────────────────────────── */}
      {showApplyModal && (
        <ResponsiveModalContainer
          isOpen={showApplyModal}
          onClose={closeApplyModal}
          title={LEAVE_APPLICATION_PAGE.modal.applyTitle}
        >
          <form onSubmit={handleApply}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                <FormField
                  label={`${LEAVE_APPLICATION_PAGE.labels.academicYear} *`}
                  error={applyErrors.academic_year_id?.message}
                >
                  <ResponsiveSelect
                    {...applyRegister('academic_year_id')}
                    customPlaceholder="Select academic year"
                    options={years.map((y) => ({ value: y.id, label: y.name }))}
                  />
                </FormField>

                <FormField
                  label={`${LEAVE_APPLICATION_PAGE.labels.leaveType} *`}
                  error={applyErrors.leave_type_id?.message}
                >
                  <ResponsiveSelect
                    {...applyRegister('leave_type_id')}
                    disabled={isLoadingEmployeeLeaves}
                    customPlaceholder={
                      isLoadingEmployeeLeaves
                        ? 'Loading your leaves…'
                        : 'Select leave type'
                    }
                    options={employeeLeaves.map((el) => ({
                      value: el.leave_type_id,
                      label: `${el.leave_type.leave_name} (${el.remaining_days} days remaining · ${LEAVE_PAY_TYPE_LABEL[el.leave_type.leave_pay_type]})`,
                    }))}
                  />
                </FormField>

                <Div type="grid" cols={2} gap="md">
                  <FormField
                    label={`${LEAVE_APPLICATION_PAGE.labels.startDate} *`}
                    error={applyErrors.start_date?.message}
                  >
                    <Input type="date" {...applyRegister('start_date')} />
                  </FormField>
                  <FormField
                    label={`${LEAVE_APPLICATION_PAGE.labels.endDate} *`}
                    error={applyErrors.end_date?.message}
                  >
                    <Input type="date" {...applyRegister('end_date')} />
                  </FormField>
                </Div>

                <FormField
                  label={LEAVE_APPLICATION_PAGE.labels.reason}
                  error={applyErrors.reason?.message}
                >
                  <textarea
                    rows={3}
                    placeholder={LEAVE_APPLICATION_PAGE.placeholders.reason}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    {...applyRegister('reason')}
                  />
                </FormField>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeApplyModal}>
                {LEAVE_APPLICATION_PAGE.buttons.cancel}
              </Button>
              <Button type="submit" loading={isApplying}>
                {LEAVE_APPLICATION_PAGE.buttons.save}
              </Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}

      {/* ─── Review Leave Modal ───────────────────────────────────────── */}
      {showReviewModal && selectedApplication && (
        <ResponsiveModalContainer
          isOpen={showReviewModal}
          onClose={closeReviewModal}
          title={LEAVE_APPLICATION_PAGE.modal.reviewTitle}
        >
          <form onSubmit={handleReview}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                {/* Summary of what is being reviewed */}
                <Div
                  type="col"
                  gap="xs"
                  className="rounded-lg border border-border bg-muted/30 p-3"
                >
                  <P className="text-sm font-medium">
                    {allLeaveTypes.find(
                      (lt) => lt.id === selectedApplication.leave_type_id,
                    )?.leave_name ?? 'Leave'}
                  </P>
                  <P color="muted" className="text-xs">
                    {new Date(selectedApplication.start_date).toLocaleDateString(
                      'en-IN',
                      { day: '2-digit', month: 'short', year: 'numeric' },
                    )}{' '}
                    →{' '}
                    {new Date(selectedApplication.end_date).toLocaleDateString(
                      'en-IN',
                      { day: '2-digit', month: 'short', year: 'numeric' },
                    )}{' '}
                    · {selectedApplication.total_days} days
                  </P>
                  {selectedApplication.reason && (
                    <P color="muted" className="text-xs">
                      Reason: {selectedApplication.reason}
                    </P>
                  )}
                </Div>

                {/* Decision badge */}
                <Div type="row" align="center" gap="sm">
                  <P className="text-sm font-medium">Decision:</P>
                  <Badge
                    variant={
                      reviewingStatus === 'APPROVED' ? 'success' : 'destructive'
                    }
                  >
                    {reviewingStatus}
                  </Badge>
                  {/* Hidden field keeps the value */}
                  <input
                    type="hidden"
                    value={reviewingStatus}
                    {...reviewRegister('status')}
                  />
                </Div>

                <FormField
                  label={LEAVE_APPLICATION_PAGE.labels.remarks}
                  error={reviewErrors.remarks?.message}
                >
                  <textarea
                    rows={3}
                    placeholder={LEAVE_APPLICATION_PAGE.placeholders.remarks}
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    {...reviewRegister('remarks')}
                  />
                </FormField>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeReviewModal}>
                {LEAVE_APPLICATION_PAGE.buttons.cancel}
              </Button>
              <Button
                type="submit"
                loading={isReviewing}
                variant={
                  reviewingStatus === 'APPROVED' ? 'default' : 'destructive'
                }
              >
                {reviewingStatus === 'APPROVED'
                  ? LEAVE_APPLICATION_PAGE.buttons.approve
                  : LEAVE_APPLICATION_PAGE.buttons.reject}
              </Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}

export default function LeaveApplicationsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <LeaveApplicationsContent />
    </Suspense>
  );
}