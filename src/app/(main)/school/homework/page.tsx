"use client";

import { useEffect, useMemo } from "react";
import { Plus, Pencil, Trash2, ListChecks } from "lucide-react";
import { useHomework } from "@/hooks/useHomework";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import {
  HOMEWORK_PAGE,
  HOMEWORK_STATUS_BADGE,
} from "@/constants";
import type { Homework } from "@/types";
import {
  Div,
  Button,
  Input,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  DataTable,
  type ColumnDef,
  FilterToolbar,
  type FilterField,
  RowActions,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  Badge,
  ResponsiveSelect,
  ResponsiveModalContainer,
} from "@/components/ui";

type PersistedHomeworkFilters = {
  academic_year_id?: string;
  class_id?: string;
  subject_id?: string;
};

export default function HomeworkPage() {
  const {
    years,
    classes,
    subjects,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSubjectId,
    setSelectedSubjectId,
    handleClassChange,
    homeworkList,
    isLoading,
    handleDelete,
    goToNew,
    goToEdit,
    students,
    submissionMap,
    showSubmissionsModal,
    setShowSubmissionsModal,
    isSaving,
    openSubmissions,
    setSubmission,
    saveSubmissions,
  } = useHomework();

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedHomeworkFilters>({
    key: STORAGE_FILTER_KEYS.HOMEWORK,
    defaultValue: {},
  });

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) setSelectedAcademicYearId(next.academic_year_id ?? "");
    if ("class_id" in next) handleClassChange(next.class_id ?? "");
    if ("subject_id" in next) setSelectedSubjectId(next.subject_id ?? "");

    const persisted: Partial<PersistedHomeworkFilters> = {};
    (["academic_year_id", "class_id", "subject_id"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field];
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      academic_year_id: undefined,
      class_id: undefined,
      subject_id: undefined,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      if (storedFilters.academic_year_id) setSelectedAcademicYearId(storedFilters.academic_year_id);
      if (storedFilters.class_id) handleClassChange(storedFilters.class_id);
      if (storedFilters.subject_id) setSelectedSubjectId(storedFilters.subject_id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: "Select year",
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: "Select Class",
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        resetKeys: ["subject_id"],
      },
      {
        type: "select",
        key: "subject_id",
        label: "Subject",
        placeholder: "All subjects",
        options: subjects.map((s) => ({ value: s.id, label: s.name })),
        disabled: !selectedClassId,
      },
    ],
    [years, classes, subjects, selectedClassId],
  );

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId || undefined,
    class_id: selectedClassId || undefined,
    subject_id: selectedSubjectId || undefined,
  };

  const columns = useMemo<ColumnDef<Homework>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "title",
        header: HOMEWORK_PAGE.table.title,
        meta: { primary: true },
      },
      {
        accessorKey: "subject_name",
        header: HOMEWORK_PAGE.table.subject,
        cell: ({ row }) => row.original.subject_name ?? "—",
      },
      {
        accessorKey: "homework_date",
        header: HOMEWORK_PAGE.table.homeworkDate,
        cell: ({ row }) => row.original.homework_date ?? "—",
      },
      {
        accessorKey: "due_date",
        header: HOMEWORK_PAGE.table.dueDate,
      },
      {
        accessorKey: "status",
        header: HOMEWORK_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={HOMEWORK_STATUS_BADGE[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "created_by_name",
        header: HOMEWORK_PAGE.table.createdBy,
        cell: ({ row }) => row.original.created_by_name ?? "—",
      },
      {
        id: "actions",
        header: HOMEWORK_PAGE.table.actions,
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: "View Submissions",
                icon: <ListChecks size={14} />,
                onClick: () => openSubmissions(row.original),
              },
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () => goToEdit(row.original),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete "${row.original.title}"? This action cannot be undone.`,
                },
                onClick: () => handleDelete(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [openSubmissions, goToEdit, handleDelete],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: HOMEWORK_PAGE.title,
    actions: [
      {
        label: HOMEWORK_PAGE.addButton,
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
        sheetTitle="Filter Homework"
      />

      <DataTable
        columns={columns}
        data={homeworkList}
        isLoading={isLoading}
        emptyText={!selectedClassId ? HOMEWORK_PAGE.empty : "No homework assigned yet."}
        fillViewport
      />

      {showSubmissionsModal && (
        <ResponsiveModalContainer
          isOpen={showSubmissionsModal}
          title={HOMEWORK_PAGE.submissions.title}
          onClose={() => setShowSubmissionsModal(false)}
        >
          <Div className="px-4 py-4">
            <Div type="col" gap="md">
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>
                      {HOMEWORK_PAGE.submissions.table.student}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {HOMEWORK_PAGE.submissions.table.status}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {HOMEWORK_PAGE.submissions.table.remarks}
                    </TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {students.length === 0 ? (
                    <TableEmptyRow colSpan={3}>
                      {HOMEWORK_PAGE.submissions.empty}
                    </TableEmptyRow>
                  ) : (
                    students.map((s) => (
                      <TableRow key={s.id}>
                        <TableCell primary>
                          {s.first_name} {s.last_name ?? ""}
                        </TableCell>
                        <TableCell>
                          <ResponsiveSelect
                            value={submissionMap[s.id]?.status ?? "PENDING"}
                            onChange={(e) =>
                              setSubmission(s.id, "status", e.target.value)
                            }
                            options={[
                              { value: "PENDING", label: "Pending" },
                              { value: "SUBMITTED", label: "Submitted" },
                              { value: "GRADED", label: "Graded" },
                              { value: "LATE", label: "Late" },
                            ]}
                          />
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Remarks"
                            value={submissionMap[s.id]?.remarks ?? ""}
                            onChange={(e) =>
                              setSubmission(s.id, "remarks", e.target.value)
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
              <Div type="row" justify="end" gap="sm">
                <Button
                  variant="outline"
                  onClick={() => setShowSubmissionsModal(false)}
                >
                  Cancel
                </Button>
                <Button loading={isSaving} onClick={saveSubmissions}>
                  {HOMEWORK_PAGE.submissions.save}
                </Button>
              </Div>
            </Div>
          </Div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
