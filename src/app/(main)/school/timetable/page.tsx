"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useTimetablePage } from "@/hooks/useTimetablePage";
import { useViewTimetable } from "@/hooks/useViewTimetable";
import { SCHOOL_TIMETABLE_PAGE, DAY_LABELS } from "@/constants";
import type { TimetableSummary } from "@/services/timetable.service";
import {
  Div,
  Button,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  DataTable,
  type ColumnDef,
  FilterToolbar,
  type FilterField,
  RowActions,
  Badge,
  Spinner,
} from "@/components/ui";
import {
  Plus,
  Pencil,
  Trash2,
  Send,
  Undo2,
  Printer,
} from "lucide-react";

function ViewTimetableContent({ id }: { id: string }) {
  const {
    timetable,
    isLoading,
    periods,
    days,
    getCell,
    getPeriodTime,
    handlePrint,
    goToEdit,
    handleBack,
    togglePublish,
  } = useViewTimetable(id);

  if (isLoading) {
    return (
      <Div type="col" align="center" justify="center" className="py-20">
        <Spinner />
      </Div>
    );
  }

  if (!timetable) return null;

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={timetable.name}
        subtitle={timetable.class_name ?? undefined}
        actions={
          <Div type="row" gap="sm">
            <Button variant="outline" onClick={handleBack}>
              Back
            </Button>
            <Button variant="outline" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-1" />
              Print
            </Button>
            <Button onClick={goToEdit}>
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
            <Button
              variant={timetable.is_complete ? "outline" : "success"}
              onClick={togglePublish}
            >
              {timetable.is_complete ? (
                <>
                  <Undo2 className="w-4 h-4 mr-1" />
                  Move to Draft
                </>
              ) : (
                <>
                  <Send className="w-4 h-4 mr-1" />
                  Publish
                </>
              )}
            </Button>
          </Div>
        }
      />

      <Div type="row" gap="md" align="center">
        <Badge variant={timetable.is_complete ? "success" : "default"}>
          {timetable.is_complete ? "Published" : "Draft"}
        </Badge>
        <span className="text-sm text-muted-foreground">
          {timetable.max_periods} periods
        </span>
        {timetable.class_teacher_name && (
          <span className="text-sm text-muted-foreground">
            Class Teacher: {timetable.class_teacher_name}
          </span>
        )}
      </Div>

      <div className="overflow-x-auto print:overflow-visible">
        <table className="min-w-full text-sm border-collapse border border-border">
          <thead>
            <tr className="bg-muted">
              <th className="border border-border px-3 py-2 text-left font-medium w-20">
                Day
              </th>
              {periods.map((p) => {
                const pt = getPeriodTime(p);
                return (
                  <th
                    key={p}
                    className="border border-border px-2 py-2 text-center font-medium min-w-[120px]"
                  >
                    <div>
                      {pt?.is_break ? (
                        <Badge variant="warning">Break</Badge>
                      ) : (
                        `P${p}`
                      )}
                    </div>
                    {pt?.start_time && (
                      <div className="text-xs text-muted-foreground font-normal">
                        {pt.start_time}
                        {pt.end_time ? `–${pt.end_time}` : ""}
                      </div>
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="border border-border px-3 py-2 font-medium bg-muted/30">
                  {DAY_LABELS[day]}
                </td>
                {periods.map((p) => {
                  const isBreak = getPeriodTime(p)?.is_break ?? false;
                  const cell = getCell(day, p);
                  return (
                    <td
                      key={p}
                      className={`border border-border px-2 py-2 text-center align-top ${
                        isBreak ? "bg-muted/30" : ""
                      }`}
                    >
                      {isBreak ? (
                        <span className="text-muted-foreground text-xs">
                          Break
                        </span>
                      ) : cell ? (
                        <Div type="col" gap="xs" align="center">
                          {cell.subject_name && (
                            <span className="font-medium text-sm">
                              {cell.subject_name}
                            </span>
                          )}
                          {cell.teacher_name && (
                            <span className="text-xs text-muted-foreground">
                              {cell.teacher_name}
                            </span>
                          )}
                        </Div>
                      ) : (
                        <span className="text-muted-foreground text-xs">—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td
                colSpan={periods.length + 1}
                className="border border-border px-3 py-2 bg-muted/30"
              >
                <span className="text-sm font-medium">Class Teacher: </span>
                <span className="text-sm">
                  {timetable.class_teacher_name ?? "—"}
                </span>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </Div>
  );
}

function TimetablePageContent() {
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");
  const {
    years,
    timetables,
    classes,
    isLoading,
    filterAcademicYearId,
    setFilterAcademicYearId,
    filterClassId,
    setFilterClassId,
    removeTimetable,
    togglePublish,
    goToNew,
    goToView,
    goToEdit,
    goToEmployee,
    goToSession,
  } = useTimetablePage();

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: "All Years",
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: "All Classes",
        options: classes.map((c) => ({ value: c.id, label: c.name })),
      },
    ],
    [years, classes],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: filterAcademicYearId || undefined,
    class_id: filterClassId || undefined,
  };

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) setFilterAcademicYearId(next.academic_year_id ?? "");
    if ("class_id" in next) setFilterClassId(next.class_id ?? "");
  }

  function handleClearFilters() {
    handleFilterChange({ academic_year_id: undefined, class_id: undefined });
  }

  const columns = useMemo<ColumnDef<TimetableSummary>[]>(
    () => [
      {
        accessorKey: "name",
        header: SCHOOL_TIMETABLE_PAGE.table.name,
        meta: { primary: true },
      },
      {
        accessorKey: "class_name",
        header: SCHOOL_TIMETABLE_PAGE.table.class,
        cell: ({ row }) => row.original.class_name ?? "—",
      },
      {
        accessorKey: "max_periods",
        header: SCHOOL_TIMETABLE_PAGE.table.maxPeriods,
      },
      {
        accessorKey: "is_complete",
        header: SCHOOL_TIMETABLE_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={row.original.is_complete ? "success" : "default"}>
            {row.original.is_complete ? "Published" : "Draft"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: SCHOOL_TIMETABLE_PAGE.table.actions,
        cell: ({ row }) => (
          <RowActions
            onView={() => goToView(row.original.id)}
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () => goToEdit(row.original.id),
              },
              {
                label: row.original.is_complete ? "Move to Draft" : "Publish",
                icon: row.original.is_complete ? (
                  <Undo2 size={14} />
                ) : (
                  <Send size={14} />
                ),
                onClick: () => togglePublish(row.original),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete "${row.original.name}"? This action cannot be undone.`,
                },
                onClick: () => removeTimetable(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [goToView, goToEdit, togglePublish, removeTimetable],
  );

  if (detailId) {
    return <ViewTimetableContent id={detailId} />;
  }

  const pageHeaderConfig: PageHeaderConfig = {
    title: SCHOOL_TIMETABLE_PAGE.title,
    actions: [
      {
        label: SCHOOL_TIMETABLE_PAGE.addButton,
        icon: <Plus size={14} />,
        onClick: goToNew,
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
        sheetTitle="Filter Timetables"
      />

      <DataTable
        columns={columns}
        data={timetables}
        isLoading={isLoading}
        emptyText={SCHOOL_TIMETABLE_PAGE.empty}
        fillViewport
      />
    </PageCol>
  );
}

export default function TimetablePage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      }
    >
      <TimetablePageContent />
    </Suspense>
  );
}
