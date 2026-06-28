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
  EmptyState,
  type ColumnDef,
} from '@/components/ui';
import { LEAVE_STATUS_BADGE } from '@/constants/leave.constants';
import type { StudentLeaveRequest } from '@/types';

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
      cell: ({ row }) => row.original.student_id,
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
      />

      {requests.length === 0 ? (
        <EmptyState title="No leave requests" description="No student leave requests found" />
      ) : (
        <DataTable columns={columns} data={requests} isLoading={isLoading} />
      )}

      {selectedRequest && (
        <Modal onClose={closeReview} title="Review Student Leave Request">
          <ModalBody>
            <Div type="grid" cols={2} gap="sm">
              <Div type="col" gap="xs">
                <P size="xs">Period</P>
                <P color="default">{selectedRequest.from_date} → {selectedRequest.to_date} ({selectedRequest.total_days} days)</P>
              </Div>
              <Div type="col" gap="xs">
                <P size="xs">Reason</P>
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
