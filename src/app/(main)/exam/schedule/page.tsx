"use client";

import { Suspense, useMemo, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Lock, Unlock, CheckSquare, Square } from "lucide-react";
import { useExamSchedules } from "@/hooks/exam/useExamSchedule";
import { useScheduleBulkActions } from "@/hooks/exam/useScheduleBulkActions";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { useExams } from "@/hooks/exam/useExams";
import { useHallDetails } from "@/hooks/exam/useExamHall";
import { useFilterParams } from "@/hooks/useFilterParams";
import { StaffService } from "@/services/staff.service";
import {
  Div,
  P,
  Span,
  Button,
  Select,
  Badge,
  Spinner,
  DataTable,
  Input,
  type ColumnDef,
  PageHeader,
} from "@/components/ui";
import {
  SCHEDULE_PAGE,
  EXAM_ROUTES,
  SUBJECT_TYPE_OPTIONS,
} from "@/constants/exam.constants";
import type { ExamSchedule } from "@/types/exam.types";
import type { Staff } from "@/types";

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

  const { schedules, pagination, filters, isLoading, updateFilters, remove, refetch } =
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

  const bulk = useScheduleBulkActions(refetch);
  const { details: hallRooms } = useHallDetails();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [bulkDate, setBulkDate] = useState("");
  const [bulkStart, setBulkStart] = useState("");
  const [bulkEnd, setBulkEnd] = useState("");
  const [bulkInvigilatorId, setBulkInvigilatorId] = useState("");
  const [bulkHallId, setBulkHallId] = useState("");

  useEffect(() => {
    StaffService.list({ limit: 200 }).then((r) => setStaff(r.items)).catch(() => {});
  }, []);

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

  // Deduplicate exams by exam_name to avoid duplicates when created with multiple classes
  const deduplicatedExams = useMemo(() => {
    const seen = new Set<string>();
    return exams.filter((e) => {
      if (seen.has(e.exam_name)) return false;
      seen.add(e.exam_name);
      return true;
    });
  }, [exams]);

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
        id: "select",
        header: () => (
          <button
            type="button"
            onClick={() => bulk.toggleAll(schedules.filter((s) => !s.locked).map((s) => s.id))}
            className="flex items-center justify-center"
          >
            {bulk.selectedIds.size > 0 && bulk.selectedIds.size === schedules.filter((s) => !s.locked).length ? (
              <CheckSquare size={14} className="text-primary" />
            ) : (
              <Square size={14} className="text-muted-foreground" />
            )}
          </button>
        ),
        cell: ({ row }) =>
          row.original.locked ? (
            <span title="Locked">
              <Lock size={13} className="text-muted-foreground" />
            </span>
          ) : (
            <button type="button" onClick={() => bulk.toggle(row.original.id)} className="flex items-center justify-center">
              {bulk.selectedIds.has(row.original.id) ? (
                <CheckSquare size={14} className="text-primary" />
              ) : (
                <Square size={14} className="text-muted-foreground" />
              )}
            </button>
          ),
        size: 36,
      },
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
    [allSections, router, bulk.selectedIds, bulk.toggle, bulk.toggleAll, schedules]
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
          {deduplicatedExams.map((e) => (
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

      {/* Bulk action bar */}
      {bulk.selectedIds.size > 0 && (
        <Div variant="card" className="p-4">
          <Div type="col" gap="sm">
            <Div type="row" align="center" justify="between">
              <P size="sm" weight="semibold">{bulk.selectedIds.size} selected</P>
              <Button size="sm" variant="outline" onClick={bulk.clear}>Clear</Button>
            </Div>
            <Div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
              <Input type="date" placeholder="Date" value={bulkDate} onChange={(e) => setBulkDate(e.target.value)} />
              <Input type="time" placeholder="Start" value={bulkStart} onChange={(e) => setBulkStart(e.target.value)} />
              <Input type="time" placeholder="End" value={bulkEnd} onChange={(e) => setBulkEnd(e.target.value)} />
              <Select value={bulkInvigilatorId} onChange={(e) => setBulkInvigilatorId(e.target.value)}>
                <option value="">Invigilator</option>
                {staff.map((s) => (
                  <option key={s.id} value={s.id}>{[s.first_name, s.last_name].filter(Boolean).join(" ")}</option>
                ))}
              </Select>
              <Select value={bulkHallId} onChange={(e) => setBulkHallId(e.target.value)}>
                <option value="">Hall</option>
                {hallRooms.map((h) => (
                  <option key={h.id} value={h.id}>{h.room_name}</option>
                ))}
              </Select>
            </Div>
            <Div type="row" gap="sm" wrap>
              <Button
                size="sm"
                loading={bulk.isApplying}
                disabled={!bulkDate && !bulkStart && !bulkEnd && !bulkInvigilatorId && !bulkHallId}
                onClick={() =>
                  bulk.applyBulkUpdate({
                    exam_date: bulkDate || undefined,
                    start_time: bulkStart || undefined,
                    end_time: bulkEnd || undefined,
                    exam_invigilator_id: bulkInvigilatorId || undefined,
                    hall_detail_id: bulkHallId || undefined,
                  })
                }
              >
                Apply Changes
              </Button>
              <Button size="sm" variant="outline" loading={bulk.isApplying} onClick={() => bulk.applyBulkLock(true)}>
                <Lock size={13} /> Lock
              </Button>
              <Button size="sm" variant="outline" loading={bulk.isApplying} onClick={() => bulk.applyBulkLock(false)}>
                <Unlock size={13} /> Unlock
              </Button>
              <Button size="sm" variant="destructive" loading={bulk.isApplying} onClick={bulk.applyBulkDelete}>
                <Trash2 size={13} /> Delete
              </Button>
            </Div>
            {bulk.conflicts.length > 0 && (
              <Div type="col" gap="xs" className="rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3">
                <P size="sm" weight="semibold" className="text-amber-700 dark:text-amber-400">
                  {bulk.conflicts.length} row(s) skipped
                </P>
                <Div type="row" gap="xs" wrap>
                  {bulk.conflicts.map((c) => (
                    <Span key={c.id} className="text-[11px] bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-200 px-2 py-0.5 rounded-full">
                      {c.reason}
                    </Span>
                  ))}
                </Div>
              </Div>
            )}
          </Div>
        </Div>
      )}

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
