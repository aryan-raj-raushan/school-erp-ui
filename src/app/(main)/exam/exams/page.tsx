"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Send, SendHorizonal } from "lucide-react";
import { useExams } from "@/hooks/exam/useExams";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import type { Exam } from "@/types/exam.types";
import type { ExamFilters } from "@/types/exam.types";
import {
  Div,
  Button,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageHeader,
  PageCol,
  FilterBar,
} from "@/components/ui";
import {
  EXAMS_PAGE,
  EXAM_ROUTES,
  EXAM_TERM_OPTIONS,
} from "@/constants/exam.constants";

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

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    handleClassChange("");
    updateFilters({ academic_year_id: val || undefined, class_id: undefined });
  }

  function handleClassFilter(val: string) {
    handleClassChange(val);
    updateFilters({ class_id: val || undefined });
  }

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
            {row.original.class_ids.map((classId) => (
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
            <Div type="row" gap="xs">
              <Button
                size="icon-sm"
                variant="ghost"
                title="Edit"
                onClick={() => router.push(EXAM_ROUTES.exams.edit(exam.id))}
              >
                <Pencil size={14} />
              </Button>
              <Button
                size="icon-sm"
                variant="ghost"
                title={exam.is_published ? "Unpublish" : "Publish"}
                onClick={() => togglePublish(exam.id, !exam.is_published)}
              >
                {exam.is_published ? (
                  <Send size={14} className="text-amber-500" />
                ) : (
                  <SendHorizonal size={14} className="text-emerald-500" />
                )}
              </Button>
              <Button
                size="icon-sm"
                variant="destructive"
                title="Delete"
                onClick={() => remove(exam.id)}
              >
                <Trash2 size={14} />
              </Button>
            </Div>
          );
        },
      },
    ],
    [router, classNameById, togglePublish, remove],
  );

  return (
    <PageCol>
      <PageHeader
        title={EXAMS_PAGE.pageHeading.title}
        subtitle={exams.length ? `${exams.length} exam${exams.length > 1 ? "s" : ""}` : ""}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.exams.create)}>
            <Plus size={16} /> {EXAMS_PAGE.buttons.add}
          </Button>
        }
      />

      <FilterBar>
        <Select
          width="sm"
          value={selectedAcademicYearId}
          onChange={(e) => handleYearChange(e.target.value)}
        >
          <option value="">{EXAMS_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={selectedClassId}
          onChange={(e) => handleClassFilter(e.target.value)}
          disabled={!selectedAcademicYearId}
        >
          <option value="">{EXAMS_PAGE.filters.allClasses}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.exam_term ?? ""}
          onChange={(e) =>
            updateFilters({
              exam_term:
                (e.target.value as ExamFilters["exam_term"]) || undefined,
            })
          }
        >
          <option value="">{EXAMS_PAGE.filters.allTerms}</option>
          {EXAM_TERM_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={
            filters.is_published === undefined
              ? ""
              : String(filters.is_published)
          }
          onChange={(e) =>
            updateFilters({
              is_published:
                e.target.value === ""
                  ? undefined
                  : e.target.value === "true",
            })
          }
        >
          <option value="">{EXAMS_PAGE.filters.allStatus}</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={exams}
        isLoading={isLoading}
        emptyText={EXAMS_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
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
