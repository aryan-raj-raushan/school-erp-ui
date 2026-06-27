"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { ClipboardList } from "lucide-react";
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
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
} from "@/components/ui";
import {
  ATTENDANCE_PAGE,
  EXAM_ROUTES,
  ATTENDANCE_STATUS_OPTIONS,
  ATTENDANCE_BADGE,
} from "@/constants/exam.constants";

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
          {exams.map((e) => (
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

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{ATTENDANCE_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{ATTENDANCE_PAGE.table.student}</TableHeaderCell>
            <TableHeaderCell>{ATTENDANCE_PAGE.table.schedule}</TableHeaderCell>
            <TableHeaderCell>{ATTENDANCE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{ATTENDANCE_PAGE.table.remarks}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}>
              <Spinner />
            </TableEmptyRow>
          ) : records.length === 0 ? (
            <TableEmptyRow colSpan={5}>
              {ATTENDANCE_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            records.map((r, i) => (
              <TableRow key={r.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{r.student_name}</TableCell>
                <TableCell>{r.subject_name} – {r.exam_date}</TableCell>
                <TableCell>
                  <Badge variant={ATTENDANCE_BADGE[r.status]}>{r.status}</Badge>
                </TableCell>
                <TableCell>{r.remarks ?? "—"}</TableCell>
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