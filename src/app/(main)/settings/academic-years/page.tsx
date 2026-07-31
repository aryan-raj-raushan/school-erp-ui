"use client";

import { useMemo } from "react";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { ACADEMIC_YEARS_PAGE } from "@/constants";
import {
  Div,
  Button,
  PageHeader,
  PageCol,
  DataTable,
  Badge,
  Spinner,
  Icon,
  type ColumnDef,
  PageHeaderConfig,
} from "@/components/ui";
import { Pencil } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

type AcademicYearRow = {
  id: string;
  name: string;
  session_code?: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
  is_enabled: boolean;
};

export default function AcademicYearsPage() {
  const isMobile = useIsMobile();
  const { years, isLoading, setCurrent, navigateToNew, navigateToEdit } =
    useAcademicYears();

  const columns = useMemo<ColumnDef<AcademicYearRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ACADEMIC_YEARS_PAGE.table.name,
        meta: { primary: true },
      },
      {
        accessorKey: "session_code",
        header: ACADEMIC_YEARS_PAGE.table.sessionCode,
        cell: ({ row }) => row.original.session_code ?? "—",
      },
      {
        id: "start_date",
        header: ACADEMIC_YEARS_PAGE.table.startDate,
        cell: ({ row }) =>
          new Date(row.original.start_date).toLocaleDateString(),
      },
      {
        id: "end_date",
        header: ACADEMIC_YEARS_PAGE.table.endDate,
        cell: ({ row }) => new Date(row.original.end_date).toLocaleDateString(),
      },
      {
        id: "status",
        header: ACADEMIC_YEARS_PAGE.table.status,
        cell: ({ row }) => (
          <Div type="col" gap="xs">
            {row.original.is_current && (
              <Badge variant="success">
                {ACADEMIC_YEARS_PAGE.status.current}
              </Badge>
            )}
            <Badge variant={row.original.is_enabled ? "success" : "default"}>
              {row.original.is_enabled
                ? ACADEMIC_YEARS_PAGE.status.enabled
                : ACADEMIC_YEARS_PAGE.status.disabled}
            </Badge>
          </Div>
        ),
      },
      {
        id: "actions",
        header: ACADEMIC_YEARS_PAGE.table.actions,
        cell: ({ row }) => (
          <Div type="row" gap="xs">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => navigateToEdit(row.original.id)}
            >
              <Icon icon={Pencil} type="sm" />
            </Button>
            {!row.original.is_current && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => setCurrent(row.original.id)}
              >
                {ACADEMIC_YEARS_PAGE.setCurrentButton}
              </Button>
            )}
          </Div>
        ),
      },
    ],
    [navigateToEdit, setCurrent],
  );

  const pageHeaderConfig: PageHeaderConfig = {
    title: ACADEMIC_YEARS_PAGE.title,
    subtitle: ACADEMIC_YEARS_PAGE.description,
    actions: [
      {
        label: isMobile ? "Add year" :  ACADEMIC_YEARS_PAGE.addButton,

        onClick: () => navigateToNew(),
      },
    ],
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      <DataTable
        columns={columns}
        data={years.map((year) => ({
          ...year,
          session_code: year.session_code ?? undefined,
        }))}
        isLoading={isLoading}
        emptyText={ACADEMIC_YEARS_PAGE.empty}
      />
    </PageCol>
  );
}
