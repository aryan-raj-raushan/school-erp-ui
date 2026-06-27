"use client";

import { Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { useExamSchedules } from "@/hooks/exam/useExamSchedule";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import {
  Div,
  Button,
  Select,
  Badge,
  Spinner,
  P,
  PageHeader,
  PageCol,
  FilterBar,
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
  SCHEDULE_PAGE,
  EXAM_ROUTES,
  SUBJECT_TYPE_OPTIONS,
} from "@/constants/exam.constants";

function ScheduleContent() {
  const router = useRouter();
  const { schedules, pagination, filters, isLoading, updateFilters, remove } =
    useExamSchedules();

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
    }
  }, [currentYear]);

  const { exams } = useExams(
    filters.academic_year_id
      ? {
          academic_year_id: filters.academic_year_id,
          class_id: filters.class_id,
        }
      : {},
  );

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    handleClassChange("");
    updateFilters({
      academic_year_id: val || undefined,
      class_id: undefined,
      section_id: undefined,
      exam_id: undefined,
    });
  }

  function handleClassFilter(val: string) {
    handleClassChange(val);
    updateFilters({ class_id: val || undefined, section_id: undefined, exam_id: undefined });
  }

  function handleSectionFilter(val: string) {
    handleSectionChange(val);
    updateFilters({ section_id: val || undefined });
  }

  return (
    <PageCol>
      <PageHeader
        title={SCHEDULE_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} entries` : ""}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.schedule.create)}>
            <Plus size={16} /> {SCHEDULE_PAGE.buttons.add}
          </Button>
        }
      />

      {/* Filters */}
      <FilterBar>
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
            updateFilters({ exam_id: e.target.value || undefined })
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
            updateFilters({
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
      </FilterBar>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{SCHEDULE_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.subject}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.section}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.type}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.date}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.time}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.marks}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.passing}</TableHeaderCell>
            <TableHeaderCell>{SCHEDULE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={9}>
              <Spinner />
            </TableEmptyRow>
          ) : schedules.length === 0 ? (
            <TableEmptyRow colSpan={9}>
              {SCHEDULE_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            schedules.map((s, i) => (
              <TableRow
                key={s.id}
                className={s.parent_schedule_id ? "bg-muted/20" : ""}
              >
                <TableCell>
                  {s.parent_schedule_id ? (
                    <P color="muted" className="pl-4 text-xs">
                      ↳ {i + 1}
                    </P>
                  ) : (
                    i + 1
                  )}
                </TableCell>
                <TableCell primary>{s.subject_name}</TableCell>
                <TableCell>
                  {s.section_id
                    ? (allSections.find((sec) => sec.id === s.section_id)?.name ?? "—")
                    : "—"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      s.subject_type === "MAIN_EXAM" ? "info" : "warning"
                    }
                  >
                    {s.subject_type.replace(/_/g, " ")}
                  </Badge>
                </TableCell>
                <TableCell>{s.exam_date}</TableCell>
                <TableCell>
                  {s.start_time} – {s.end_time}
                </TableCell>
                <TableCell>{s.exam_marks}</TableCell>
                <TableCell>{s.passing_marks}</TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Edit"
                      onClick={() =>
                        router.push(EXAM_ROUTES.schedule.edit(s.id))
                      }
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      title="Delete"
                      onClick={() => remove(s.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
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
    </PageCol>
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
