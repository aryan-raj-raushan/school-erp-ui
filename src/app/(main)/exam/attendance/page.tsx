"use client";

import { Suspense, useMemo, useEffect } from "react";
import { ClipboardList } from "lucide-react";
import { useRouter } from "next/navigation";
import { useExamAttendanceList } from "@/hooks/exam/useExamAttendance";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useExamSchedules } from "@/hooks/exam/useExamSchedule";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import {
  Div,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  FilterToolbar,
  type FilterField,
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

type PersistedAttendanceFilters = {
  academic_year_id?: string;
  class_id?: string;
  exam_id?: string;
  schedule_id?: string;
  status?: string;
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
    selectedClassId,
    handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: false });

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedAttendanceFilters>({
    key: STORAGE_FILTER_KEYS.ATTENDANCE + ":exam",
    defaultValue: {},
  });

  const { exams } = useExams(
    filters.academic_year_id
      ? { academic_year_id: filters.academic_year_id }
      : {}
  );

  const deduplicatedExams = useMemo(() => {
    const seen = new Set<string>();
    return exams.filter((e) => {
      if (seen.has(e.exam_name)) return false;
      seen.add(e.exam_name);
      return true;
    });
  }, [exams]);

  const { schedules } = useExamSchedules(
    filters.exam_id
      ? { exam_id: filters.exam_id, class_id: filters.class_id, limit: 100 }
      : {}
  );

  function handleFilterChange(next: Record<string, string | undefined>) {
    const mapped: Record<string, unknown> = {};

    if ("academic_year_id" in next) {
      const val = next.academic_year_id;
      setSelectedAcademicYearId(val ?? "");
      mapped.academic_year_id = val || undefined;
      if (next.class_id === undefined) {
        handleClassChange("");
        mapped.class_id = undefined;
        mapped.exam_id = undefined;
        mapped.schedule_id = undefined;
      }
    }

    if ("class_id" in next) {
      const val = next.class_id;
      handleClassChange(val ?? "");
      mapped.class_id = val || undefined;
      mapped.exam_id = undefined;
      mapped.schedule_id = undefined;
    }

    if ("exam_id" in next) {
      mapped.exam_id = next.exam_id || undefined;
      mapped.schedule_id = undefined;
    }

    if ("schedule_id" in next) {
      mapped.schedule_id = next.schedule_id || undefined;
    }

    if ("status" in next) {
      mapped.status = next.status || undefined;
    }

      updateFilters(mapped as Partial<typeof filters>);

    const persisted: Partial<PersistedAttendanceFilters> = {};
    (["academic_year_id", "class_id", "exam_id", "schedule_id", "status"] as const).forEach(
      (field) => {
        if (field in next) persisted[field] = next[field] as never;
      },
    );
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    setSelectedAcademicYearId("");
    handleClassChange("");
    updateFilters({
      academic_year_id: undefined,
      class_id: undefined,
      exam_id: undefined,
      schedule_id: undefined,
      status: undefined,
    });
    clearStoredFilters();
  }

  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      const mapped: Record<string, unknown> = {};
      if (storedFilters.academic_year_id) {
        setSelectedAcademicYearId(storedFilters.academic_year_id);
        mapped.academic_year_id = storedFilters.academic_year_id;
      }
      if (storedFilters.class_id) {
        handleClassChange(storedFilters.class_id);
        mapped.class_id = storedFilters.class_id;
      }
      if (storedFilters.exam_id) mapped.exam_id = storedFilters.exam_id;
      if (storedFilters.schedule_id) mapped.schedule_id = storedFilters.schedule_id;
      if (storedFilters.status) mapped.status = storedFilters.status;
    updateFilters(mapped as Partial<typeof filters>);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: ATTENDANCE_PAGE.filters.allYears,
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
        resetKeys: ["class_id", "exam_id", "schedule_id"],
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: ATTENDANCE_PAGE.filters.allClasses,
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !selectedAcademicYearId,
        resetKeys: ["exam_id", "schedule_id"],
      },
      {
        type: "select",
        key: "exam_id",
        label: "Exam",
        placeholder: ATTENDANCE_PAGE.filters.allExams,
        options: deduplicatedExams.map((e) => ({
          value: e.id,
          label: e.exam_name,
        })),
        disabled: !selectedAcademicYearId,
        resetKeys: ["schedule_id"],
      },
      {
        type: "select",
        key: "schedule_id",
        label: "Schedule",
        placeholder: ATTENDANCE_PAGE.filters.allSchedules,
        options: schedules.map((s) => ({
          value: s.id,
          label: `${s.subject_name} – ${s.exam_date}`,
        })),
        disabled: !filters.exam_id,
      },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: ATTENDANCE_PAGE.filters.allStatus,
        options: ATTENDANCE_STATUS_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    ],
    [years, classes, deduplicatedExams, schedules, selectedAcademicYearId, filters.exam_id],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId || undefined,
    class_id: selectedClassId || undefined,
    exam_id: filters.exam_id,
    schedule_id: filters.schedule_id,
    status: filters.status,
  };

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

  const pageHeaderConfig: PageHeaderConfig = {
    backButton: true,
    title: ATTENDANCE_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} records` : "",
    actions: [
      {
        label: "Admit Cards",
        variant: "outline",
        onClick: () => router.push(EXAM_ROUTES.admitCard.list),
      },
      {
        label: ATTENDANCE_PAGE.buttons.mark,
        icon: <ClipboardList size={14} />,
        onClick: () => router.push(EXAM_ROUTES.attendance.mark),
      },
    ],
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={handleFilterChange}
        onClear={handleClearFilters}
        sheetTitle="Filter Attendance"
      />

      <DataTable
        columns={columns}
        data={records.map((r) => ({
          ...r,
          remarks: r.remarks ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText={ATTENDANCE_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
        fillViewport
      />
    </PageCol>
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