"use client";

import { Suspense, useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useStudents } from "@/hooks/useStudentV2";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import type { Class, Section } from "@/types";
import type { StudentFilters, StudentListItem } from "@/types/students.types";
import {
  Div,
  P,
  Button,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageCol,
  PageHeader,
  type PageHeaderConfig,
  FilterToolbar,
  type FilterField,
} from "@/components/ui";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  STATUS_BADGE,
  STUDENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
} from "@/constants/students.constants";

function useClassesAndSections(academicYearId: string | undefined, classId: string | undefined) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (!academicYearId) {
      setClasses([]);
      setSections([]);
      return;
    }
    (async () => {
      const { ClassesService } = await import("@/services/classes.service");
      try {
        const r = await ClassesService.list({
          academic_year_id: academicYearId,
          limit: 100,
        });
        setClasses(r.items);
      } catch {}
    })();
  }, [academicYearId]);

  useEffect(() => {
    if (!classId) {
      setSections([]);
      return;
    }
    (async () => {
      const { SectionsService } = await import("@/services/classes.service");
      try {
        const r = await SectionsService.list({ class_id: classId, limit: 100 });
        setSections(r.items);
      } catch {}
    })();
  }, [classId]);

  return { classes, sections };
}

function StudentsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();

  type PersistedStudentFilters = Pick<
    StudentFilters,
    "academic_year_id" | "class_id" | "section_id" | "status" | "gender"
  >;

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedStudentFilters>({
    key: STORAGE_FILTER_KEYS.STUDENTS,
    defaultValue: {},
  });

  const {
    students,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteStudent,
    toggleEnabled,
  } = useStudents({ page: 1 });

  const { classes, sections } = useClassesAndSections(
    filters.academic_year_id,
    filters.class_id,
  );

  function handleFilterChange(next: Partial<StudentFilters>) {
    updateFilters(next);

    const persisted: Partial<PersistedStudentFilters> = {};
    (
      ["academic_year_id", "class_id", "section_id", "status", "gender"] as const
    ).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      academic_year_id: undefined,
      class_id: undefined,
      section_id: undefined,
      status: undefined,
      gender: undefined,
      search: undefined,
      page: 1,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      updateFilters(storedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: STUDENT_PAGE.filters.search,
      },
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: STUDENT_PAGE.filters.allYears,
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
        resetKeys: ["class_id", "section_id"],
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: STUDENT_PAGE.filters.allClasses,
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !filters.academic_year_id,
        resetKeys: ["section_id"],
      },
      {
        type: "select",
        key: "section_id",
        label: "Section",
        placeholder: STUDENT_PAGE.filters.allSections,
        options: sections.map((s) => ({ value: s.id, label: s.name })),
        disabled: !filters.class_id,
      },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: STUDENT_PAGE.filters.allStatus,
        options: STUDENT_STATUS_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      },
      {
        type: "select",
        key: "gender",
        label: "Gender",
        placeholder: STUDENT_PAGE.filters.allGender,
        options: GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
      },
    ],
    [years, classes, sections, filters.academic_year_id, filters.class_id],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    academic_year_id: filters.academic_year_id,
    class_id: filters.class_id,
    section_id: filters.section_id,
    status: filters.status,
    gender: filters.gender,
  };

  const columns = useMemo<ColumnDef<StudentListItem>[]>(
    () => [
      {
        id: "index",
        header: STUDENT_PAGE.table.sno,
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "system_number",
        header: STUDENT_PAGE.table.systemNo,
        cell: ({ row }) => (
          <P color="muted" className="font-mono text-xs">
            #{row.original.system_number}
          </P>
        ),
      },
      {
        accessorKey: "first_name",
        header: STUDENT_PAGE.table.studentName,
        meta: { primary: true },
        cell: ({ row }) => (
          <Div type="row" align="center" gap="sm">
            {row.original.profile_image ? (
              <img
                src={row.original.profile_image}
                alt={row.original.first_name}
                className="h-7 w-7 rounded-full object-cover shrink-0"
              />
            ) : (
              <Div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                <P color="muted" className="text-xs font-semibold">
                  {row.original.first_name[0]}
                  {row.original.last_name?.[0] ?? ""}
                </P>
              </Div>
            )}
            <P>
              {row.original.first_name} {row.original.last_name ?? ""}
            </P>
          </Div>
        ),
      },
      {
        accessorKey: "class_name",
        header: STUDENT_PAGE.table.class,
        cell: ({ row }) => row.original.class_name ?? "—",
      },
      {
        accessorKey: "section_name",
        header: STUDENT_PAGE.table.section,
        cell: ({ row }) => row.original.section_name ?? "—",
      },
      {
        accessorKey: "admission_number",
        header: STUDENT_PAGE.table.admissionNo,
        cell: ({ row }) => row.original.admission_number ?? "—",
      },
      {
        accessorKey: "roll_number",
        header: STUDENT_PAGE.table.rollNo,
        cell: ({ row }) => row.original.roll_number ?? "—",
      },
      {
        accessorKey: "gender",
        header: STUDENT_PAGE.table.gender,
        cell: ({ row }) =>
          row.original.gender
            ? row.original.gender.charAt(0) +
              row.original.gender.slice(1).toLowerCase()
            : "—",
      },
      {
        accessorKey: "phone_number",
        header: STUDENT_PAGE.table.phone,
        cell: ({ row }) => row.original.phone_number ?? "—",
      },
      {
        accessorKey: "status",
        header: STUDENT_PAGE.table.status,
        cell: ({ row }) => (
          <Badge variant={STATUS_BADGE[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: STUDENT_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button
              size="icon-sm"
              variant="ghost"
              title="View"
              onClick={() => router.push(STUDENT_ROUTES.view(row.original.id))}
            >
              <Eye size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title="Edit"
              onClick={() => router.push(STUDENT_ROUTES.edit(row.original.id))}
            >
              <Pencil size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title={row.original.is_enabled ? "Disable" : "Enable"}
              onClick={() =>
                toggleEnabled(row.original.id, !row.original.is_enabled)
              }
            >
              {row.original.is_enabled ? (
                <ToggleRight size={14} className="text-emerald-500" />
              ) : (
                <ToggleLeft
                  size={14}
                  className="text-muted-foreground"
                />
              )}
            </Button>
            <Button
              size="icon-sm"
              variant="ghost"
              title="Generate ID Card"
              onClick={() =>
                router.push(
                  `${STUDENT_ROUTES.generate}?studentId=${row.original.id}`,
                )
              }
            >
              <CreditCard size={14} />
            </Button>
            <Button
              size="icon-sm"
              variant="destructive"
              title="Delete"
              onClick={() => deleteStudent(row.original.id)}
            >
              <Trash2 size={14} />
            </Button>
          </Div>
        ),
      },
    ],
    [router, deleteStudent, toggleEnabled],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: STUDENT_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} students` : "",
    backButton: true,
    actions: [
      {
        label: STUDENT_PAGE.buttons.addStudent,
        icon: <Plus size={14} />,
        onClick: () => router.push(STUDENT_ROUTES.createNew),
      },
    ],
  };

  return (
    <PageCol>
      {/* <div className="bg-red-100"> */}
      <PageHeader {...pageHeaderConfig} />
      {/* </div> */}

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) => handleFilterChange(next as Partial<StudentFilters>)}
        onClear={handleClearFilters}
        sheetTitle="Filter Students"
      />

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        emptyText={STUDENT_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
        fillViewport
      />
    </PageCol>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}
