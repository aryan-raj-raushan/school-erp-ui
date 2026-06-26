'use client';

import { Suspense, useEffect, useState } from 'react';
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
} from '@/components/ui';
import {
  LEAVE_APPLICATION_PAGE,
  LEAVE_STATUS_OPTIONS,
  LEAVE_STATUS_BADGE,
  LEAVE_PAY_TYPE_LABEL,
} from '@/constants/emp-leave.constants';
import type { LeaveApplicationFilters } from '@/types/leave.types';
import { useLeaveTypes } from '@/hooks/leave/useLeaveTypes';

function LeaveApplicationsContent() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = user?.role === 'SCHOOL_ADMIN' || user?.role === 'PRINCIPAL';
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

  return (
    <Div type="col" gap="lg">
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

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Select
          width="sm"
          value={filters.status ?? ''}
          onChange={(e) =>
            handleFilterChange({ status: (e.target.value as any) || undefined })
          }
        >
          {LEAVE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.academic_year_id ?? ''}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
            })
          }
        >
          <option value="">{LEAVE_APPLICATION_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.leave_type_id ?? ''}
          onChange={(e) =>
            handleFilterChange({
              leave_type_id: e.target.value || undefined,
            })
          }
        >
          <option value="">{LEAVE_APPLICATION_PAGE.filters.allLeaveTypes}</option>
          {allLeaveTypes.map((lt) => (
            <option key={lt.id} value={lt.id}>
              {lt.leave_name}
            </option>
          ))}
        </Select>

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
      </Div>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.leaveType}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.startDate}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.endDate}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.totalDays}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.reason}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.appliedOn}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.remarks}</TableHeaderCell>
            <TableHeaderCell>{LEAVE_APPLICATION_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={10}>
              <Spinner />
            </TableEmptyRow>
          ) : applications.length === 0 ? (
            <TableEmptyRow colSpan={10}>
              {LEAVE_APPLICATION_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            applications.map((app, i) => {
              const leaveType = allLeaveTypes.find(
                (lt) => lt.id === app.leave_type_id,
              );
              return (
                <TableRow key={app.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>
                    {leaveType?.leave_name ?? '—'}
                  </TableCell>
                  <TableCell>
                    {new Date(app.start_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    {new Date(app.end_date).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>
                    <P className="font-medium">{app.total_days} days</P>
                  </TableCell>
                  <TableCell>{app.reason ?? '—'}</TableCell>
                  <TableCell>
                    <Badge variant={LEAVE_STATUS_BADGE[app.status]}>
                      {app.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(app.created_at).toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </TableCell>
                  <TableCell>{app.remarks ?? '—'}</TableCell>
                  <TableCell>
                    <Div type="row" gap="sm">
                      {/* Admin: approve / reject on PENDING */}
                      {isAdmin && app.status === 'PENDING' && (
                        <>
                          <Button
                            size="icon-sm"
                            variant="ghost"
                            onClick={() => openReviewModal(app, 'APPROVED')}
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
                            onClick={() => openReviewModal(app, 'REJECTED')}
                            title={LEAVE_APPLICATION_PAGE.buttons.reject}
                          >
                            <XCircle size={14} className="text-destructive" />
                          </Button>
                        </>
                      )}
                      {/* Employee: cancel own PENDING application */}
                      {!isAdmin &&
                        app.employee_id === employeeId &&
                        app.status === 'PENDING' && (
                          <Button
                            size="icon-sm"
                            variant="destructive"
                            onClick={() => cancelLeave(app.id)}
                            title={LEAVE_APPLICATION_PAGE.buttons.cancelApplication}
                          >
                            <X size={14} />
                          </Button>
                        )}
                    </Div>
                  </TableCell>
                </TableRow>
              );
            })
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

      {/* ─── Apply Leave Modal ────────────────────────────────────────── */}
      {showApplyModal && (
        <Modal
          onClose={closeApplyModal}
          title={LEAVE_APPLICATION_PAGE.modal.applyTitle}
          size="md"
        >
          <form onSubmit={handleApply}>
            <ModalBody>
              <Div type="col" gap="md">
                <FormField
                  label={`${LEAVE_APPLICATION_PAGE.labels.academicYear} *`}
                  error={applyErrors.academic_year_id?.message}
                >
                  <Select {...applyRegister('academic_year_id')}>
                    <option value="">Select academic year</option>
                    {years.map((y) => (
                      <option key={y.id} value={y.id}>
                        {y.name}
                      </option>
                    ))}
                  </Select>
                </FormField>

                <FormField
                  label={`${LEAVE_APPLICATION_PAGE.labels.leaveType} *`}
                  error={applyErrors.leave_type_id?.message}
                >
                  <Select
                    {...applyRegister('leave_type_id')}
                    disabled={isLoadingEmployeeLeaves}
                  >
                    <option value="">
                      {isLoadingEmployeeLeaves
                        ? 'Loading your leaves…'
                        : 'Select leave type'}
                    </option>
                    {employeeLeaves.map((el) => (
                      <option key={el.leave_type_id} value={el.leave_type_id}>
                        {el.leave_type.leave_name} ({el.remaining_days} days
                        remaining · {LEAVE_PAY_TYPE_LABEL[el.leave_type.leave_pay_type]})
                      </option>
                    ))}
                  </Select>
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
            </ModalBody>
            <ModalFooter>
              <Button type="button" variant="outline" onClick={closeApplyModal}>
                {LEAVE_APPLICATION_PAGE.buttons.cancel}
              </Button>
              <Button type="submit" loading={isApplying}>
                {LEAVE_APPLICATION_PAGE.buttons.save}
              </Button>
            </ModalFooter>
          </form>
        </Modal>
      )}

      {/* ─── Review Leave Modal ───────────────────────────────────────── */}
      {showReviewModal && selectedApplication && (
        <Modal
          onClose={closeReviewModal}
          title={LEAVE_APPLICATION_PAGE.modal.reviewTitle}
          size="sm"
        >
          <form onSubmit={handleReview}>
            <ModalBody>
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
            </ModalBody>
            <ModalFooter>
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
            </ModalFooter>
          </form>
        </Modal>
      )}
    </Div>
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