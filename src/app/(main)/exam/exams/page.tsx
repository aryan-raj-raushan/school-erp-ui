"use client";

import { Suspense, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Send, SendHorizonal } from "lucide-react";
import { useExams } from "@/hooks/exam/useExams";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import type { Exam } from "@/types/exam.types";
import type { ExamFilters } from "@/types/exam.types";
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
  RowActions,
} from "@/components/ui";
import {
  EXAMS_PAGE,
  EXAM_ROUTES,
  EXAM_TERM_OPTIONS,
} from "@/constants/exam.constants";

type PersistedExamFilters = Pick<
  ExamFilters,
  "academic_year_id" | "class_id" | "exam_term"
> & { is_published?: string };

function ExamsContent() {
  const router = useRouter();
  const {
    exams,
    pagination,
    filters,
    isLoading,
    updateFilters,
    remove,
    togglePublish,
  } = useExams();

  const {
    years,
    classes,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedExamFilters>({
    key: STORAGE_FILTER_KEYS.EXAMS,
    defaultValue: {},
  });

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  function handleFilterChange(next: Record<string, string | undefined>) {
    const mapped: Partial<ExamFilters> = {};

    if ("academic_year_id" in next) {
      const val = next.academic_year_id;
      setSelectedAcademicYearId(val ?? "");
      mapped.academic_year_id = val || undefined;
      if (next.class_id === undefined) {
        handleClassChange("");
        mapped.class_id = undefined;
      }
    }

    if ("class_id" in next) {
      const val = next.class_id;
      handleClassChange(val ?? "");
      mapped.class_id = val || undefined;
    }

    if ("exam_term" in next) {
      mapped.exam_term = (next.exam_term as ExamFilters["exam_term"]) || undefined;
    }

    if ("is_published" in next) {
      mapped.is_published =
        next.is_published === ""
          ? undefined
          : next.is_published === "true";
    }

    updateFilters(mapped);

    const persisted: Partial<PersistedExamFilters> = {};
    (["academic_year_id", "class_id", "exam_term", "is_published"] as const).forEach(
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
      exam_term: undefined,
      is_published: undefined,
      page: 1,
    });
    clearStoredFilters();
  }

  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      const mapped: Partial<ExamFilters> = {};
      if (storedFilters.academic_year_id) {
        setSelectedAcademicYearId(storedFilters.academic_year_id);
        mapped.academic_year_id = storedFilters.academic_year_id;
      }
      if (storedFilters.class_id) {
        handleClassChange(storedFilters.class_id);
        mapped.class_id = storedFilters.class_id;
      }
      if (storedFilters.exam_term) mapped.exam_term = storedFilters.exam_term;
      if (storedFilters.is_published !== undefined) {
        mapped.is_published =
          storedFilters.is_published === ""
            ? undefined
            : storedFilters.is_published === "true";
      }
      updateFilters(mapped);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: EXAMS_PAGE.filters.allYears,
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
        resetKeys: ["class_id"],
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: EXAMS_PAGE.filters.allClasses,
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !selectedAcademicYearId,
      },
      {
        type: "select",
        key: "exam_term",
        label: "Term",
        placeholder: EXAMS_PAGE.filters.allTerms,
        options: EXAM_TERM_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
      {
        type: "select",
        key: "is_published",
        label: "Published",
        placeholder: EXAMS_PAGE.filters.allStatus,
        options: [
          { value: "true", label: "Published" },
          { value: "false", label: "Draft" },
        ],
      },
    ],
    [years, classes, selectedAcademicYearId],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId || undefined,
    class_id: selectedClassId || undefined,
    exam_term: filters.exam_term,
    is_published:
      filters.is_published === undefined
        ? undefined
        : String(filters.is_published),
  };

  const columns = useMemo<ColumnDef<Exam>[]>(
    () => [
      {
        id: "index",
        header: EXAMS_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "exam_name",
        header: EXAMS_PAGE.table.examName,
        meta: { primary: true },
        cell: ({ row }) => row.original.exam_name,
      },
      {
        id: "exam_term",
        header: EXAMS_PAGE.table.term,
        cell: ({ row }) => <Badge variant="info">{row.original.exam_term}</Badge>,
      },
      {
        id: "classes",
        header: "Classes",
        cell: ({ row }) => (
          <Div type="row" gap="xs" wrap>
            {(row.original.class_ids ?? []).map((classId) => (
              <Badge key={classId} variant="default">
                {classNameById[classId] ?? classId.slice(0, 6)}
              </Badge>
            ))}
          </Div>
        ),
      },
      {
        id: "start_date",
        header: EXAMS_PAGE.table.startDate,
        cell: ({ row }) => row.original.start_date,
      },
      {
        id: "end_date",
        header: EXAMS_PAGE.table.endDate,
        cell: ({ row }) => row.original.end_date,
      },
      {
        id: "is_published",
        header: EXAMS_PAGE.table.published,
        cell: ({ row }) => (
          <Badge variant={row.original.is_published ? "success" : "warning"}>
            {row.original.is_published ? "Published" : "Draft"}
          </Badge>
        ),
      },
      {
        id: "is_enabled",
        header: EXAMS_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? "success" : "default"}>
            {row.original.is_enabled ? "Active" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: EXAMS_PAGE.table.actions,
        cell: ({ row }) => {
          const exam = row.original;
          return (
            <RowActions
              onView={() => router.push(EXAM_ROUTES.exams.view(exam.id))}
              actions={[
                {
                  label: "Edit",
                  icon: <Pencil size={14} />,
                  onClick: () => router.push(EXAM_ROUTES.exams.edit(exam.id)),
                },
                {
                  label: exam.is_published ? "Unpublish" : "Publish",
                  icon: exam.is_published ? (
                    <Send size={14} className="text-amber-500" />
                  ) : (
                    <SendHorizonal size={14} className="text-emerald-500" />
                  ),
                  onClick: () => togglePublish(exam.id, !exam.is_published),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={14} />,
                  variant: "destructive",
                  confirm: {
                    title: "Delete Exam",
                    description: EXAMS_PAGE.confirmDelete,
                    confirmLabel: "Delete",
                  },
                  onClick: () => remove(exam.id),
                },
              ]}
            />
          );
        },
      },
    ],
    [router, classNameById, togglePublish, remove],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: EXAMS_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} exams` : "",
    actions: [
      {
        label: EXAMS_PAGE.buttons.add,
        icon: <Plus size={14} />,
        onClick: () => router.push(EXAM_ROUTES.exams.create),
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
        sheetTitle="Filter Exams"
      />

      <DataTable
        columns={columns}
        data={exams}
        isLoading={isLoading}
        emptyText={EXAMS_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
        fillViewport
      />
    </PageCol>
  );
}

export default function ExamsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ExamsContent />
    </Suspense>
  );
}
