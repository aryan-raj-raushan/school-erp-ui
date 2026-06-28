"use client";

import { useMemo } from "react";
import { useStaffAttendance } from "@/hooks/useStaffAttendance";
import { Div, P, Button, Input, PageHeader, PageCol, Spinner, MiniStat, FilterLabel, DataTable, type ColumnDef } from "@/components/ui";

type StaffAttendanceRow = {
  id: string;
  first_name: string;
  last_name?: string;
  employee_code?: string;
  role?: string;
};

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

  const hasStaff = staff.length > 0;
  const attendancePct = hasStaff ? Math.round((presentCount / staff.length) * 100) : 0;
  const isLoading = isLoadingStaff || isLoadingAttendance;

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
            <Input
              type="checkbox"
              checked={entry.is_late ?? false}
              onChange={(e) => setLate(row.original.id, e.target.checked)}
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
            />
          );
        },
      },
    ],
    [attendanceMap, setStatus, setLate, setRemarks]
  );

  return (
    <PageCol>
      <PageHeader
        title="Staff Attendance"
        subtitle={date}
        actions={
          hasStaff ? (
            <Button loading={isSaving} onClick={saveAttendance}>
              Save Attendance
            </Button>
          ) : undefined
        }
      />

      {/* Date filter */}
      <Div variant="card" padding="p-4">
        <Div type="row" gap="md" align="end">
          <Div type="col" gap="xs">
            <FilterLabel>Date</FilterLabel>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </Div>
        </Div>
      </Div>

      {/* Stats + quick actions */}
      {hasStaff && (
        <Div type="row" justify="between" align="center">
          <Div type="row" gap="sm">
            <MiniStat label="Total" value={staff.length} />
            <MiniStat label="Present" value={presentCount} color="green" />
            <MiniStat label="Absent" value={absentCount} color="red" />
            <MiniStat
              label="Attendance"
              value={`${attendancePct}%`}
              color={attendancePct >= 75 ? "green" : "red"}
            />
          </Div>
          <Div type="row" gap="sm">
            <Button size="sm" variant="outline" onClick={() => markAll("PRESENT")}>
              Mark All Present
            </Button>
            <Button size="sm" variant="outline" onClick={() => markAll("ABSENT")}>
              Mark All Absent
            </Button>
          </Div>
        </Div>
      )}

      {/* Staff attendance table */}
      {isLoading ? (
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      ) : staff.length === 0 ? (
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
          <Button loading={isSaving} onClick={saveAttendance}>
            Save Attendance
          </Button>
        </Div>
      )}
    </PageCol>
  );
}
