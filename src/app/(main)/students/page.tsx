"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Pencil,
  Trash2,
  CreditCard,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useStudents } from "@/hooks/useStudentV2";
import { useStudentFilterConfig } from "@/hooks/useStudentFilterConfig";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import type { StudentFilters, StudentListItem } from "@/types/students.types";
import {
  Div,
  P,
  Badge,
  Spinner,
  DataTable,
  type ColumnDef,
  PageCol,
  PageHeader,
  type PageHeaderConfig,
  FilterToolbar,
  RowActions,
} from "@/components/ui";
import { StudentMobileList } from "@/components/student/StudentMobileList";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  STATUS_BADGE,
} from "@/constants/students.constants";

function StudentsDesktop() {
  const router = useRouter();

  const {
    students,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteStudent,
    toggleEnabled,
  } = useStudents({ page: 1 });

  const { filterFields, filterValues, onChange, onClear } =
    useStudentFilterConfig(filters, updateFilters);

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
          <RowActions
            onView={() => router.push(STUDENT_ROUTES.view(row.original.id))}
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () =>
                  router.push(STUDENT_ROUTES.edit(row.original.id)),
              },
              {
                label: row.original.is_enabled ? "Disable" : "Enable",
                icon: row.original.is_enabled ? (
                  <ToggleRight size={14} className="text-emerald-500" />
                ) : (
                  <ToggleLeft size={14} className="text-muted-foreground" />
                ),
                onClick: () =>
                  toggleEnabled(row.original.id, !row.original.is_enabled),
              },
              {
                label: "Generate ID Card",
                icon: <CreditCard size={14} />,
                onClick: () =>
                  router.push(
                    `${STUDENT_ROUTES.generate}?studentId=${row.original.id}`,
                  ),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete ${
                    row.original.first_name
                  } ${
                    row.original.last_name ?? ""
                  }? This action cannot be undone.`,
                },
                onClick: () => deleteStudent(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [router, deleteStudent, toggleEnabled],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: STUDENT_PAGE.pageHeading.title,
    subtitle: pagination ? `${pagination.total} students` : "",
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
      <PageHeader {...pageHeaderConfig} />

      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) => onChange(next as Partial<StudentFilters>)}
        onClear={onClear}
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

function StudentsContent() {
  const isMobile = useIsMobileReady();

  if (isMobile === undefined) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  return isMobile ? <StudentMobileList /> : <StudentsDesktop />;
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
