"use client";

import { Suspense, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExamSchedules } from "@/hooks/exam/useExamSchedule";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useFilterParams } from "@/hooks/useFilterParams";
import {
  Div,
  Button,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageHeader,
} from "@/components/ui";
import {
  SCHEDULE_PAGE,
  EXAM_ROUTES,
  SUBJECT_TYPE_OPTIONS,
} from "@/constants/exam.constants";
import type { ExamSchedule } from "@/types/exam.types";

function ScheduleContent() {
  const router = useRouter();

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    class_id: undefined,
    section_id: undefined,
    exam_id: undefined,
    subject_type: undefined,
    page: undefined,
  });

  const { schedules, pagination, filters, isLoading, updateFilters, remove } =
    useExamSchedules({
      academic_year_id: urlFilters.academic_year_id
        ? urlFilters.academic_year_id
        : undefined,
      class_id: urlFilters.class_id ? urlFilters.class_id : undefined,
      section_id: urlFilters.section_id ? urlFilters.section_id : undefined,
      exam_id: urlFilters.exam_id ? urlFilters.exam_id : undefined,
      subject_type: urlFilters.subject_type
        ? (urlFilters.subject_type as any)
        : undefined,
      page: urlFilters.page ? Number(urlFilters.page) : 1,
    });

  const {
    years,
    classes,
    sections,
    allSections,
    currentYear,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    handleClassChange,
    handleSectionChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  // sync auto-selected current year into schedule filters on first load
  useEffect(() => {
    if (currentYear && !filters.academic_year_id) {
      updateFilters({ academic_year_id: currentYear.id });
      setUrlFilters({
        academic_year_id: currentYear.id,
      });
    }
  }, [currentYear]);

  const { exams } = useExams(
    filters.academic_year_id
      ? {
          academic_year_id: filters.academic_year_id,
          class_id: filters.class_id,
        }
      : {}
  );

  function handleFilterChange(next: Partial<Record<string, string | undefined>>) {
    updateFilters(next as any);
    setUrlFilters(next);
  }

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    handleClassChange("");
    handleFilterChange({
      academic_year_id: val || undefined,
      class_id: undefined,
      section_id: undefined,
      exam_id: undefined,
      page: undefined,
    });
  }

  function handleClassFilter(val: string) {
    handleClassChange(val);
    handleFilterChange({
      class_id: val || undefined,
      section_id: undefined,
      exam_id: undefined,
      page: undefined,
    });
  }

  function handleSectionFilter(val: string) {
    handleSectionChange(val);
    handleFilterChange({
      section_id: val || undefined,
      page: undefined,
    });
  }

  async function handleDelete(id: string) {
    await remove(id);
  }

  const columns = useMemo<ColumnDef<ExamSchedule>[]>(
    () => [
      {
        id: "sno",
        header: SCHEDULE_PAGE.table.sno,
        cell: ({ row }) => {
          const isChild = !!row.original.parent_schedule_id;
          return isChild ? `↳ ${row.index + 1}` : row.index + 1;
        },
      },
      {
        accessorKey: "subject_name",
        header: SCHEDULE_PAGE.table.subject,
        meta: { primary: true },
      },
      {
        id: "section",
        header: SCHEDULE_PAGE.table.section,
        cell: ({ row }) => {
          const section = allSections.find(
            (sec) => sec.id === row.original.section_id
          );
          return section ? section.name : "—";
        },
      },
      {
        accessorKey: "subject_type",
        header: SCHEDULE_PAGE.table.type,
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.subject_type === "MAIN_EXAM" ? "info" : "warning"
            }
          >
            {row.original.subject_type.replace(/_/g, " ")}
          </Badge>
        ),
      },
      {
        accessorKey: "exam_date",
        header: SCHEDULE_PAGE.table.date,
      },
      {
        id: "time",
        header: SCHEDULE_PAGE.table.time,
        cell: ({ row }) =>
          `${row.original.start_time} – ${row.original.end_time}`,
      },
      {
        accessorKey: "exam_marks",
        header: SCHEDULE_PAGE.table.marks,
      },
      {
        accessorKey: "passing_marks",
        header: SCHEDULE_PAGE.table.passing,
      },
      {
        id: "actions",
        header: SCHEDULE_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button
              size="icon-sm"
              variant="ghost"
              title="Edit"
              onClick={() => router.push(EXAM_ROUTES.schedule.edit(row.original.id))}
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              title="Delete"
              onClick={() => handleDelete(row.original.id)}
            >
              <Trash2 size={14} />
            </Button>
          </Div>
        ),
      },
    ],
    [allSections, router]
  );

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={SCHEDULE_PAGE.pageHeading.title}
        subtitle={
          pagination ? `${pagination.total} entries` : ""
        }
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.schedule.create)}>
            <Plus size={16} /> {SCHEDULE_PAGE.buttons.add}
          </Button>
        }
      />

      {/* Filters */}
      <Div type="row" gap="md" wrap>
        <Select
          width="sm"
          value={selectedAcademicYearId}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">{SCHEDULE_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.class_id ?? ""}
          disabled={!selectedAcademicYearId}
          onChange={(e) => handleClassFilter(e.target.value)}
        >
          <option value="">{SCHEDULE_PAGE.filters.allClasses}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.section_id ?? ""}
          disabled={!filters.class_id}
          onChange={(e) => handleSectionFilter(e.target.value)}
        >
          <option value="">{SCHEDULE_PAGE.filters.allSections}</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.exam_id ?? ""}
          disabled={!filters.class_id}
          onChange={(e) =>
            handleFilterChange({ exam_id: e.target.value || undefined })
          }
        >
          <option value="">{SCHEDULE_PAGE.filters.allExams}</option>
          {exams.map((e) => (
            <option key={e.id} value={e.id}>
              {e.exam_name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.subject_type ?? ""}
          onChange={(e) =>
            handleFilterChange({
              subject_type: (e.target.value as any) || undefined,
            })
          }
        >
          <option value="">{SCHEDULE_PAGE.filters.allTypes}</option>
          {SUBJECT_TYPE_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </Div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={schedules}
        isLoading={isLoading}
        emptyText={SCHEDULE_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
        getRowVariant={(row) =>
          row.original.parent_schedule_id ? "muted" : "default"
        }
      />
    </Div>
  );
}

export default function SchedulePage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ScheduleContent />
    </Suspense>
  );
}
