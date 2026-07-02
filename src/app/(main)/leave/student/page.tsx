'use client';

import { useStudentLeave } from '@/hooks/useStudentLeave';
import {
  Div,
  P,
  Button,
  Badge,
  Spinner,
  PageHeader,
  PageCol,
  DataTable,
  Modal,
  ModalBody,
  ModalFooter,
  FormField,
  Input,
  Select,
  EmptyState,
  type ColumnDef,
  ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';
import { LEAVE_STATUS_BADGE } from '@/constants/leave.constants';
import type { StudentLeaveRequest } from '@/types';

const today = new Date().toISOString().split('T')[0];

export default function StudentLeavePage() {
  const {
    requests,
    isLoading,
    isReviewing,
    selectedRequest,
    reviewRemarks,
    setReviewRemarks,
    openReview,
    closeReview,
    review,
    isApplyOpen,
    isApplying,
    sectionOptions,
    applySectionId,
    setApplySectionId,
    applyStudents,
    applyStudentId,
    setApplyStudentId,
    isLoadingApplyStudents,
    applyFromDate,
    setApplyFromDate,
    applyToDate,
    setApplyToDate,
    applyReason,
    setApplyReason,
    openApply,
    closeApply,
    applyLeave,
  } = useStudentLeave();

  const columns: ColumnDef<StudentLeaveRequest>[] = [
    {
      id: 'index',
      header: '#',
      size: 48,
      cell: ({ row }) => row.index + 1,
    },
    {
      accessorKey: 'student_id',
      header: 'Student',
      meta: { primary: true },
      cell: ({ row }) => row.original.student_name ?? row.original.student_id,
    },
    {
      accessorKey: 'from_date',
      header: 'From',
    },
    {
      accessorKey: 'to_date',
      header: 'To',
    },
    {
      accessorKey: 'total_days',
      header: 'Days',
      size: 80,
    },
    {
      accessorKey: 'reason',
      header: 'Reason',
    },
    {
      accessorKey: 'status',
      header: 'Status',
      size: 120,
      cell: ({ row }) => (
        <Badge variant={LEAVE_STATUS_BADGE[row.original.status]}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: '',
      size: 100,
      cell: ({ row }) =>
        row.original.status === 'PENDING' ? (
          <Button size="sm" onClick={() => openReview(row.original)}>Review</Button>
        ) : null,
    },
  ];

  if (isLoading) {
    return (
      <PageCol>
        <Div type="row" justify="center" padding="p-12">
          <Spinner />
        </Div>
      </PageCol>
    );
  }

  return (
    <PageCol>
      <PageHeader
        title="Student Leave Requests"
        subtitle="Review and approve leave requests for students"
        actions={<Button onClick={openApply}>Apply on Behalf</Button>}
      />

      {requests.length === 0 ? (
        <EmptyState
          title="No leave requests"
          description="No student leave requests found"
          action={{ label: 'Apply on Behalf', onClick: openApply }}
        />
      ) : (
        <DataTable columns={columns} data={requests} isLoading={isLoading} />
      )}

      {/* ── Apply on Behalf Modal ── */}
      {isApplyOpen && (
        <ResponsiveModalContainer isOpen={isApplyOpen} onClose={closeApply} title="Apply Leave on Behalf of Student">
          <div className="px-4 py-4">
            <Div type="col" gap="md">
              <FormField label="Section">
                <ResponsiveSelect
                  value={applySectionId}
                  onChange={(e) => setApplySectionId(e.target.value)}
                  customPlaceholder="Select section"
                  options={sectionOptions.map((s) => ({ value: s.id, label: s.label }))}
                />
              </FormField>

              <FormField label="Student">
                <ResponsiveSelect
                  value={applyStudentId}
                  onChange={(e) => setApplyStudentId(e.target.value)}
                  disabled={!applySectionId || isLoadingApplyStudents}
                  customPlaceholder={
                    isLoadingApplyStudents ? 'Loading students…' : 'Select student'
                  }
                  options={applyStudents.map((s) => ({
                    value: s.id,
                    label: `${s.first_name} ${s.last_name ?? ''} ${s.admission_number ? `(${s.admission_number})` : ''}`.trim(),
                  }))}
                />
              </FormField>

              <Div type="grid" cols={2} gap="sm">
                <FormField label="From Date">
                  <Input
                    type="date"
                    value={applyFromDate}
                    max={today}
                    onChange={(e) => {
                      const val = e.target.value;
                      setApplyFromDate(val);
                      if (val > applyToDate) setApplyToDate(val);
                    }}
                  />
                </FormField>
                <FormField label="To Date">
                  <Input
                    type="date"
                    value={applyToDate}
                    min={applyFromDate}
                    max={today}
                    onChange={(e) => {
                      const val = e.target.value;
                      setApplyToDate(val);
                      if (val < applyFromDate) setApplyFromDate(val);
                    }}
                  />
                </FormField>
              </Div>

              <FormField label="Reason">
                <Input
                  value={applyReason}
                  onChange={(e) => setApplyReason(e.target.value)}
                  placeholder="e.g. Fever, Family function, Medical appointment"
                />
              </FormField>
            </Div>
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button variant="outline" onClick={closeApply}>Cancel</Button>
            <Button loading={isApplying} onClick={applyLeave}>Submit Request</Button>
          </div>
        </ResponsiveModalContainer>
      )}

      {/* ── Review Modal ── */}
      {selectedRequest && (
        <Modal onClose={closeReview} title="Review Student Leave Request">
          <ModalBody>
            <Div type="col" gap="sm">
              <Div type="grid" cols={2} gap="sm">
                <Div type="col" gap="xs">
                  <P size="xs" color="muted">Student</P>
                  <P color="default">{selectedRequest.student_name ?? selectedRequest.student_id}</P>
                </Div>
                <Div type="col" gap="xs">
                  <P size="xs" color="muted">Period</P>
                  <P color="default">{selectedRequest.from_date} → {selectedRequest.to_date} ({selectedRequest.total_days} days)</P>
                </Div>
              </Div>
              <Div type="col" gap="xs">
                <P size="xs" color="muted">Reason</P>
                <P color="default">{selectedRequest.reason}</P>
              </Div>
            </Div>
            <Div padding="mt-4">
              <FormField label="Remarks (optional)">
                <Input
                  value={reviewRemarks}
                  onChange={(e) => setReviewRemarks(e.target.value)}
                  placeholder="Add your review comments"
                />
              </FormField>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={closeReview}>Cancel</Button>
            <Button variant="destructive" loading={isReviewing} onClick={() => review('REJECTED')}>Reject</Button>
            <Button variant="success" loading={isReviewing} onClick={() => review('APPROVED')}>Approve</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
