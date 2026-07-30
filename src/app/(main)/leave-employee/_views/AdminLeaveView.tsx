"use client";

import { useMemo, useState } from "react";
import { useLeaveManagement } from "@/hooks/useLeave";
import { LEAVE_PAGE, LEAVE_STATUS_BADGE } from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Input,
  Badge,
  FormField,
  FilterLabel,
  MiniStat,
  ResponsiveModalContainer,
  ResponsiveSelect,
  DataTable,
  type ColumnDef,
  RowActions,
} from "@/components/ui";
import {  Eye } from "lucide-react";

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

  const teacherColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "type",
        header: LEAVE_PAGE.table.type,
        meta: { primary: true },
        cell: ({ row }) => row.original.leave_type?.name ?? "—",
      },
      {
        accessorKey: "from_date",
        header: LEAVE_PAGE.table.from,
      },
      {
        accessorKey: "to_date",
        header: LEAVE_PAGE.table.to,
      },
      {
        accessorKey: "total_days",
        header: LEAVE_PAGE.table.days,
      },
      {
        accessorKey: "reason",
        header: LEAVE_PAGE.table.reason,
      },
      {
        accessorKey: "status",
        header: LEAVE_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={LEAVE_STATUS_BADGE[row.original.status as keyof typeof LEAVE_STATUS_BADGE]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: LEAVE_PAGE.table.actions,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <RowActions
              actions={[
                {
                  label: "Review",
                  icon: <Eye size={14} />,
                  onClick: () => openReview(req.id, "teacher"),
                  hidden: req.status !== "PENDING",
                },
              ]}
            />
          );
        },
      },
    ],
    [openReview],
  );

  const studentColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "from_date",
        header: LEAVE_PAGE.table.from,
        meta: { primary: true },
      },
      {
        accessorKey: "to_date",
        header: LEAVE_PAGE.table.to,
      },
      {
        accessorKey: "total_days",
        header: LEAVE_PAGE.table.days,
      },
      {
        accessorKey: "reason",
        header: LEAVE_PAGE.table.reason,
      },
      {
        accessorKey: "status",
        header: LEAVE_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={LEAVE_STATUS_BADGE[row.original.status as keyof typeof LEAVE_STATUS_BADGE]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: LEAVE_PAGE.table.actions,
        cell: ({ row }) => {
          const req = row.original;
          return (
            <RowActions
              actions={[
                {
                  label: "Review",
                  icon: <Eye size={14} />,
                  onClick: () => openReview(req.id, "student"),
                  hidden: req.status !== "PENDING",
                },
              ]}
            />
          );
        },
      },
    ],
    [openReview],
  );

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
          <ResponsiveSelect
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            customPlaceholder="Select year"
            options={years.map((y) => ({ value: y.id, label: `${y.name}${y.is_current ? " (Current)" : ""}` }))}
          />
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
        <DataTable
          columns={teacherColumns}
          data={teacherRequests}
          isLoading={isLoading}
          emptyText={LEAVE_PAGE.empty}
          fillViewport
        />
      )}

      {/* Student requests */}
      {activeTab === "student" && (
        <DataTable
          columns={studentColumns}
          data={studentRequests}
          isLoading={isLoading}
          emptyText={LEAVE_PAGE.empty}
          fillViewport
        />
      )}

      {/* Review Modal */}
      <ResponsiveModalContainer isOpen={showReviewModal} title={LEAVE_PAGE.review.title} onClose={() => setShowReviewModal(false)}>
          <form onSubmit={handleSubmit(handleReview)}>
            <Div type="col" gap="md" className="px-4 py-4">
              <FormField label={LEAVE_PAGE.review.status} error={errors.status?.message}>
                <ResponsiveSelect
                  {...register("status")}
                  options={[
                    { value: "APPROVED", label: LEAVE_PAGE.review.approve },
                    { value: "REJECTED", label: LEAVE_PAGE.review.reject },
                  ]}
                />
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
      </ResponsiveModalContainer>
    </Div>
  );
}
