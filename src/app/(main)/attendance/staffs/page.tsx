"use client";

import { useEffect, useMemo } from "react";
import { useStaffAttendance } from "@/hooks/useStaffAttendance";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { StaffAttendanceStats } from "@/components/staff/staff-attendance-stats";
import {
  Div,
  P,
  Button,
  Input,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  DataTable,
  FilterToolbar,
  type FilterField,
  DatePicker,
  Switch,
  type ColumnDef,
} from "@/components/ui";
import { formatDate } from "@/lib/utils";

type StaffAttendanceRow = {
  id: string;
  first_name: string;
  last_name?: string;
  employee_code?: string;
  role?: string;
};

type PersistedStaffAttendanceFilters = Pick<{ date?: string }, "date">;

export default function StaffAttendancePage() {
  const {
    staff,
    attendanceMap,
    date,
    setDate,
    isLoadingStaff,
    isLoadingAttendance,
    isSaving,
    setStatus,
    setLate,
    setRemarks,
    markAll,
    saveAttendance,
    presentCount,
    absentCount,
  } = useStaffAttendance();

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedStaffAttendanceFilters>({
    key: STORAGE_FILTER_KEYS.ATTENDANCE,
    defaultValue: {},
  });

  // One-time: once storage has hydrated, apply a previously saved date.
  useEffect(() => {
    if (!isStorageHydrated) return;
    if (storedFilters.date) setDate(storedFilters.date);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  function handleDateChange(value: string) {
    setDate(value);
    persistFilters({ date: value });
  }

  function handleClearFilters() {
    const today = new Date().toISOString().split("T")[0];
    setDate(today);
    clearStoredFilters();
  }

  const hasStaff = staff.length > 0;
  const lateCount = staff.filter((s) => attendanceMap[s.id]?.is_late).length;
  const attendancePct = hasStaff ? Math.round((presentCount / staff.length) * 100) : 0;
  const isLoading = isLoadingStaff || isLoadingAttendance;

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "custom",
        key: "date",
        label: "Date",
        chipLabel: date ? formatDate(date) : undefined,
        render: () => (
          <DatePicker value={date} onChange={handleDateChange} size="compact" className="w-40" />
        ),
      },
    ],
    [date],
  );

  const filterValues: Record<string, string | undefined> = { date };

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Staff Attendance",
    subtitle: date ? formatDate(date) : undefined
  };

  const columns = useMemo<ColumnDef<StaffAttendanceRow>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "first_name",
        header: "Staff Member",
        meta: { primary: true },
        cell: ({ row }) =>
          `${row.original.first_name} ${row.original.last_name ?? ""}`,
      },
      {
        accessorKey: "employee_code",
        header: "Employee Code",
        cell: ({ row }) => row.original.employee_code ?? "—",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => row.original.role?.replace(/_/g, " "),
      },
      {
        id: "status",
        header: "Status",
        cell: ({ row }) => {
          const entry = attendanceMap[row.original.id] ?? {};
          return (
            <Div type="row" gap="xs">
              <Button
                size="sm"
                variant={
                  entry.status === "PRESENT" ? "success" : "outline"
                }
                onClick={() => setStatus(row.original.id, "PRESENT")}
              >
                P
              </Button>
              <Button
                size="sm"
                variant={
                  entry.status === "ABSENT" ? "destructive" : "outline"
                }
                onClick={() => setStatus(row.original.id, "ABSENT")}
              >
                A
              </Button>
            </Div>
          );
        },
      },
      {
        id: "isLate",
        header: "Late",
        cell: ({ row }) => {
          const entry = attendanceMap[row.original.id] ?? {};
          return (
            <Switch
              checked={entry.is_late ?? false}
              onCheckedChange={(checked) => setLate(row.original.id, checked)}
            />
          );
        },
      },
      {
        id: "remarks",
        header: "Remarks",
        cell: ({ row }) => {
          const entry = attendanceMap[row.original.id] ?? {};
          return (
            <Input
              placeholder="Optional remarks"
              value={entry.remarks ?? ""}
              onChange={(e) => setRemarks(row.original.id, e.target.value)}
              className="h-8 max-w-xs border-transparent bg-muted/40 text-xs placeholder:text-muted-foreground/70 hover:bg-muted/60 focus:border-input focus:bg-background"
            />
          );
        },
      },
    ],
    [attendanceMap, setStatus, setLate, setRemarks]
  );

  return (
    <PageCol>
      <PageHeader sticky {...pageHeaderConfig} />

      {/* Filters */}
        <FilterToolbar
          fields={filterFields}
          values={filterValues}
          onChange={(next) => {
            if ("date" in next) handleDateChange(next.date ?? "");
          }}
          onClear={handleClearFilters}
          sheetTitle="Filter Attendance"
        />

      {/* Stats + quick actions */}
      {hasStaff && (
        <StaffAttendanceStats
          total={staff.length}
          presentCount={presentCount}
          absentCount={absentCount}
          lateCount={lateCount}
          attendancePct={attendancePct}
          onMarkAllPresent={() => markAll("PRESENT")}
          onMarkAllAbsent={() => markAll("ABSENT")}
          onSaveAttendance={saveAttendance}
          isSaving={isSaving}
        />
      )}

      {/* Staff attendance table */}
      {staff.length === 0 && !isLoading ? (
        <Div
          type="col"
          gap="sm"
          align="center"
          className="rounded-xl border border-dashed border-border py-16 text-center"
        >
          <P color="muted">No staff found</P>
        </Div>
      ) : (
        <DataTable
          columns={columns}
          data={staff.map(s => ({
            ...s,
            last_name: s.last_name ?? undefined,
            employee_code: s.employee_code ?? undefined,
            role: s.role ?? undefined,
          }))}
          isLoading={isLoading}
          emptyText="No staff found"
        />
      )}

      {hasStaff && (
        <Div type="row" justify="end">
          <Button loading={isSaving} onClick={saveAttendance} variant={"success"}>
            Save Attendance
          </Button>
        </Div>
      )}
    </PageCol>
  );
}
