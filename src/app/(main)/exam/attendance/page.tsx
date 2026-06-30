"use client";

import { Suspense, useMemo } from "react";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useExamAttendanceList } from "@/hooks/exam/useExamAttendance";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useExamSchedules } from "@/hooks/exam/useExamSchedule";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  Button,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
} from "@/components/ui";
import {
  ATTENDANCE_PAGE,
  EXAM_ROUTES,
  ATTENDANCE_STATUS_OPTIONS,
  ATTENDANCE_BADGE,
} from "@/constants/exam.constants";

type AttendanceRow = {
  id: string;
  student_name: string;
  subject_name: string;
  exam_date: string;
  status: string;
  remarks?: string;
};

function AttendanceListContent() {
  const router = useRouter();
  const { records, pagination, filters, isLoading, updateFilters } =
    useExamAttendanceList();

  const {
    years,
    classes,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: false });

  const { exams } = useExams(
    filters.academic_year_id
      ? { academic_year_id: filters.academic_year_id }
      : {}
  );

  // Deduplicate exams by exam_name to avoid duplicates when created with multiple classes
  const deduplicatedExams = useMemo(() => {
    const seen = new Set<string>();
    return exams.filter((e) => {
      if (seen.has(e.exam_name)) return false;
      seen.add(e.exam_name);
      return true;
    });
  }, [exams]);

  const { schedules } = useExamSchedules(
    filters.exam_id ? { exam_id: filters.exam_id, limit: 100 } : {}
  );

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    handleClassChange("");
    updateFilters({
      academic_year_id: val || undefined,
      exam_id: undefined,
      schedule_id: undefined,
    });
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={ATTENDANCE_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} records` : ""}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.attendance.mark)}>
            <ClipboardList size={16} /> {ATTENDANCE_PAGE.buttons.mark}
          </Button>
        }
      />

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <Select
          width="sm"
          value={selectedAcademicYearId}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">{ATTENDANCE_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.exam_id ?? ""}
          disabled={!selectedAcademicYearId}
          onChange={(e) =>
            updateFilters({ exam_id: e.target.value || undefined, schedule_id: undefined })
          }
        >
          <option value="">{ATTENDANCE_PAGE.filters.allExams}</option>
          {deduplicatedExams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.exam_name}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.schedule_id ?? ""}
          disabled={!filters.exam_id}
          onChange={(e) =>
            updateFilters({ schedule_id: e.target.value || undefined })
          }
        >
          <option value="">{ATTENDANCE_PAGE.filters.allSchedules}</option>
          {schedules.map((s) => (
            <option key={s.id} value={s.id}>
              {s.subject_name} – {s.exam_date}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            updateFilters({ status: (e.target.value as any) || undefined })
          }
        >
          <option value="">{ATTENDANCE_PAGE.filters.allStatus}</option>
          {ATTENDANCE_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Div>

      {(() => {
        const columns = useMemo<ColumnDef<AttendanceRow>[]>(
          () => [
            {
              id: "index",
              header: ATTENDANCE_PAGE.table.sno,
              cell: ({ row }) => row.index + 1,
            },
            {
              accessorKey: "student_name",
              header: ATTENDANCE_PAGE.table.student,
              meta: { primary: true },
            },
            {
              id: "schedule",
              header: ATTENDANCE_PAGE.table.schedule,
              cell: ({ row }) => `${row.original.subject_name} – ${row.original.exam_date}`,
            },
            {
              accessorKey: "status",
              header: ATTENDANCE_PAGE.table.status,
              cell: ({ row }) => (
                <Badge variant={ATTENDANCE_BADGE[row.original.status]}>
                  {row.original.status}
                </Badge>
              ),
            },
            {
              accessorKey: "remarks",
              header: ATTENDANCE_PAGE.table.remarks,
              cell: ({ row }) => row.original.remarks ?? "—",
            },
          ],
          []
        );

        return (
          <DataTable
            columns={columns}
            data={records.map((r) => ({
              ...r,
              remarks: r.remarks ?? undefined,
            }))}
            isLoading={isLoading}
            emptyText={ATTENDANCE_PAGE.table.noEntry}
            pagination={pagination ?? undefined}
          />
        );
      })()}
    </Div>
  );
}

export default function AttendancePage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AttendanceListContent />
    </Suspense>
  );
}