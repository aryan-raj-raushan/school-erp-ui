"use client";

import { useStaffAttendance } from "@/hooks/useStaffAttendance";
import { Div, H1, P, Button, Input, Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, Spinner, MiniStat, FilterLabel } from "@/components/ui";

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

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>Staff Attendance</H1>
          <P color="muted">{date}</P>
        </Div>
        {hasStaff && (
          <Button loading={isSaving} onClick={saveAttendance}>
            Save Attendance
          </Button>
        )}
      </Div>

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

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>Staff Member</TableHeaderCell>
            <TableHeaderCell>Employee Code</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Late</TableHeaderCell>
            <TableHeaderCell>Remarks</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
          ) : staff.length === 0 ? (
            <TableEmptyRow colSpan={7}>No staff found</TableEmptyRow>
          ) : (
            staff.map((member, i) => {
              const entry = attendanceMap[member.id] ?? { is_late: false, remarks: "" };
              const isAbsent = entry.status === "ABSENT";
              return (
                <TableRow key={member.id} variant={isAbsent ? "danger" : undefined}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>
                    {member.first_name} {member.last_name ?? ""}
                  </TableCell>
                  <TableCell>{member.employee_code ?? "—"}</TableCell>
                  <TableCell>{member.role?.replace(/_/g, " ")}</TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button
                        size="sm"
                        variant={entry.status === "PRESENT" ? "success" : "outline"}
                        onClick={() => setStatus(member.id, "PRESENT")}
                      >
                        P
                      </Button>
                      <Button
                        size="sm"
                        variant={entry.status === "ABSENT" ? "destructive" : "outline"}
                        onClick={() => setStatus(member.id, "ABSENT")}
                      >
                        A
                      </Button>
                    </Div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="checkbox"
                      checked={entry.is_late ?? false}
                      onChange={(e) => setLate(member.id, e.target.checked)}
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Optional remarks"
                      value={entry.remarks ?? ""}
                      onChange={(e) => setRemarks(member.id, e.target.value)}
                    />
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {hasStaff && (
        <Div type="row" justify="end">
          <Button loading={isSaving} onClick={saveAttendance}>
            Save Attendance
          </Button>
        </Div>
      )}
    </Div>
  );
}
