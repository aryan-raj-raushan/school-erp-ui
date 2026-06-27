"use client";

import { useState } from "react";
import { useLeaveManagement } from "@/hooks/useLeave";
import { LEAVE_PAGE, LEAVE_STATUS_BADGE } from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Select,
  Input,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  Badge,
  Spinner,
  Modal,
  FormField,
  FilterLabel,
  MiniStat,
} from "@/components/ui";
import { CheckCircle, XCircle } from "lucide-react";

type Tab = "teacher" | "student";

export default function AdminLeaveView() {
  const [activeTab, setActiveTab] = useState<Tab>("teacher");

  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    teacherRequests,
    studentRequests,
    isLoading,
    isSaving,
    showReviewModal, setShowReviewModal,
    reviewForm,
    openReview,
    handleReview,
  } = useLeaveManagement();

  const { register, handleSubmit, formState: { errors } } = reviewForm;

  const pendingTeacher = teacherRequests.filter((r) => r.status === "PENDING").length;
  const pendingStudent = studentRequests.filter((r) => r.status === "PENDING").length;

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{LEAVE_PAGE.title}</H1>
        <Div type="row" gap="sm">
          <MiniStat label="Pending Teacher" value={pendingTeacher} color={pendingTeacher > 0 ? "yellow" : "default"} />
          <MiniStat label="Pending Student" value={pendingStudent} color={pendingStudent > 0 ? "yellow" : "default"} />
        </Div>
      </Div>

      {/* AY filter */}
      <Div variant="card" padding="p-4">
        <Div type="row" gap="md" align="center">
          <FilterLabel noWrap>Academic Year</FilterLabel>
          <Select
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            width="md"
          >
            <option value="">Select year</option>
            {years.map((y) => (
              <option key={y.id} value={y.id}>
                {y.name}{y.is_current ? " (Current)" : ""}
              </option>
            ))}
          </Select>
        </Div>
      </Div>

      {/* Tabs */}
      <Div type="row" gap="sm">
        {(["teacher", "student"] as Tab[]).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "teacher" ? LEAVE_PAGE.tabs.teacher : LEAVE_PAGE.tabs.student}
          </Button>
        ))}
      </Div>

      {/* Teacher requests */}
      {activeTab === "teacher" && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.type}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.from}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.to}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.days}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.reason}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.status}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.actions}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
            ) : teacherRequests.length === 0 ? (
              <TableEmptyRow colSpan={8}>{LEAVE_PAGE.empty}</TableEmptyRow>
            ) : (
              teacherRequests.map((req, i) => (
                <TableRow key={req.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{req.leave_type?.name ?? "—"}</TableCell>
                  <TableCell>{req.from_date}</TableCell>
                  <TableCell>{req.to_date}</TableCell>
                  <TableCell>{req.total_days}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>
                    <Badge variant={LEAVE_STATUS_BADGE[req.status]}>{req.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(req.id, "teacher")}
                      >
                        Review
                      </Button>
                    )}
                    {req.reviewer_remarks && req.status !== "PENDING" && (
                      <P size="xs">{req.reviewer_remarks}</P>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Student requests */}
      {activeTab === "student" && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.from}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.to}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.days}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.reason}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.status}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.actions}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
            ) : studentRequests.length === 0 ? (
              <TableEmptyRow colSpan={7}>{LEAVE_PAGE.empty}</TableEmptyRow>
            ) : (
              studentRequests.map((req, i) => (
                <TableRow key={req.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{req.from_date}</TableCell>
                  <TableCell>{req.to_date}</TableCell>
                  <TableCell>{req.total_days}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>
                    <Badge variant={LEAVE_STATUS_BADGE[req.status]}>{req.status}</Badge>
                  </TableCell>
                  <TableCell>
                    {req.status === "PENDING" && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openReview(req.id, "student")}
                      >
                        Review
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <Modal title={LEAVE_PAGE.review.title} onClose={() => setShowReviewModal(false)}>
          <form onSubmit={handleSubmit(handleReview)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={LEAVE_PAGE.review.status} error={errors.status?.message}>
                <Select {...register("status")}>
                  <option value="APPROVED">{LEAVE_PAGE.review.approve}</option>
                  <option value="REJECTED">{LEAVE_PAGE.review.reject}</option>
                </Select>
              </FormField>
              <FormField label={LEAVE_PAGE.review.remarks}>
                <Input {...register("reviewer_remarks")} placeholder="Optional remarks" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowReviewModal(false)}>
                  {LEAVE_PAGE.review.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {LEAVE_PAGE.review.submit}
                </Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
