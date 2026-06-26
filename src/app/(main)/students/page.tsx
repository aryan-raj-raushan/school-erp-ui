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
import { useFilterParams } from "@/hooks/useFilterParams";
import { ClassesService, SectionsService } from "@/services/classes.service";
import type { Class, Section } from "@/types";
import type {
  StudentFilters,
  StudentStatus,
  Gender,
  StudentListItem,
} from "@/types/students.types";
import {
  Div,
  P,
  Button,
  Input,
  Select,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageCol,
  FilterBar,
} from "@/components/ui";
import { PageHeader } from "@/components/ui/page-header";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  STATUS_BADGE,
  STUDENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
} from "@/constants/students-v2.constants";

function StudentsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    class_id: undefined,
    section_id: undefined,
    status: undefined,
    gender: undefined,
    search: undefined,
    page: undefined,
  });

  const initialFilters: StudentFilters = {
    academic_year_id: urlFilters.academic_year_id,
    class_id: urlFilters.class_id,
    section_id: urlFilters.section_id,
    status: urlFilters.status as StudentStatus | undefined,
    gender: urlFilters.gender as Gender | undefined,
    search: urlFilters.search,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    students,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteStudent,
    toggleEnabled,
  } = useStudents(initialFilters);

  useEffect(() => {
    if (!filters.academic_year_id) {
      setClasses([]);
      setSections([]);
      return;
    }
    ClassesService.list({
      academic_year_id: filters.academic_year_id,
      limit: 100,
    })
      .then((r) => setClasses(r.items))
      .catch(() => {});
  }, [filters.academic_year_id]);

  useEffect(() => {
    if (!filters.class_id) {
      setSections([]);
      return;
    }
    SectionsService.list({ class_id: filters.class_id, limit: 100 })
      .then((r) => setSections(r.items))
      .catch(() => {});
  }, [filters.class_id]);

  function handleFilterChange(next: Partial<StudentFilters>) {
    updateFilters(next);
    const urlNext: Record<string, string | undefined> = {};
    if ("academic_year_id" in next)
      urlNext.academic_year_id = next.academic_year_id;
    if ("class_id" in next) {
      urlNext.class_id = next.class_id;
      urlNext.section_id = undefined;
    }
    if ("section_id" in next) urlNext.section_id = next.section_id;
    if ("status" in next) urlNext.status = next.status;
    if ("gender" in next) urlNext.gender = next.gender;
    if ("search" in next) urlNext.search = next.search;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

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
            <span>
              {row.original.first_name} {row.original.last_name ?? ""}
            </span>
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

  return (
    <PageCol>
      <PageHeader
        title={STUDENT_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} students` : ""}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push(STUDENT_ROUTES.generate)}
            >
              <CreditCard size={16} />
              {STUDENT_PAGE.buttons.generateCards}
            </Button>
            <Button onClick={() => router.push(STUDENT_ROUTES.createNew)}>
              <Plus size={16} />
              {STUDENT_PAGE.buttons.addStudent}
            </Button>
          </>
        }
      />

      <FilterBar>
        <Input
          width="md"
          placeholder={STUDENT_PAGE.filters.search}
          value={filters.search ?? ""}
          onChange={(e) =>
            handleFilterChange({ search: e.target.value || undefined })
          }
        />
        <Select
          width="sm"
          value={filters.academic_year_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
              class_id: undefined,
              section_id: undefined,
            })
          }
        >
          <option value="">{STUDENT_PAGE.filters.allYears}</option>
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
          onChange={(e) =>
            handleFilterChange({
              class_id: e.target.value || undefined,
              section_id: undefined,
            })
          }
          disabled={!filters.academic_year_id}
        >
          <option value="">{STUDENT_PAGE.filters.allClasses}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.section_id ?? ""}
          onChange={(e) =>
            handleFilterChange({ section_id: e.target.value || undefined })
          }
          disabled={!filters.class_id}
        >
          <option value="">{STUDENT_PAGE.filters.allSections}</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            handleFilterChange({
              status: (e.target.value as StudentStatus) || undefined,
            })
          }
        >
          <option value="">{STUDENT_PAGE.filters.allStatus}</option>
          {STUDENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.gender ?? ""}
          onChange={(e) =>
            handleFilterChange({
              gender: (e.target.value as Gender) || undefined,
            })
          }
        >
          <option value="">{STUDENT_PAGE.filters.allGender}</option>
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </FilterBar>

      <DataTable
        columns={columns}
        data={students}
        isLoading={isLoading}
        emptyText={STUDENT_PAGE.table.noEntry}
        pagination={pagination ?? undefined}
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
