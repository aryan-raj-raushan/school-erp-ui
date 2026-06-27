"use client";

import { useMemo } from "react";
import { useAttendanceReports } from "@/hooks/useAttendanceReports";
import { ATTENDANCE_REPORT_PAGE, ATTENDANCE_STATUS_BADGE } from "@/constants";
import {
  Div,
  H2,
  P,
  Button,
  Input,
  Select,
  PageHeader,
  PageCol,
  Badge,
  Spinner,
  MiniStat,
  DataTable,
  type ColumnDef,
} from "@/components/ui";

const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

const YEARS = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

type Tab = "daily" | "monthly" | "defaulters" | "studentHistory";

type DailyReportRow = {
  id: string;
  student_name: string;
  admission_number: string;
  roll_number: string;
  status: string;
  is_late: boolean;
  remarks?: string;
  marked_by_username: string;
};

type MonthlyReportRow = {
  student_id?: string;
  student_name?: string;
  admission_number: string;
  roll_number: string;
  total_days: number;
  present: number;
  absent: number;
  percentage: number;
};

type DefaulterRow = {
  student_id?: string;
  student_name?: string;
  studentName?: string;
  admission_number?: string;
  admissionNo?: string;
  roll_number?: string;
  rollNo?: string;
  class_name?: string;
  section_name?: string;
  total_days: number;
  total_present: number;
  total_absent: number;
  percentage: number;
};

type HistoryRow = {
  id: string;
  date: string;
  status: string;
  remarks?: string;
};

export default function StudentAttendanceReportPage() {
  const {
    activeTab,
    setActiveTab,
    classSection,
    sections,
    isLoadingSections,
    isLoadingClassSection,

    dailySectionId,
    setDailySectionId,
    dailyDate,
    setDailyDate,
    dailyReport,
    isLoadingDaily,
    fetchDailyReport,

    monthlySectionId,
    setMonthlySectionId,
    monthlyMonth,
    setMonthlyMonth,
    monthlyYear,
    setMonthlyYear,
    monthlyReport,
    isLoadingMonthly,
    fetchMonthlyReport,

    defaulterSectionId,
    setDefaulterSectionId,
    defaulterThreshold,
    setDefaulterThreshold,
    defaulters,
    isLoadingDefaulters,
    fetchDefaulters,

    historySectionId,
    setHistorySectionId,
    historyStudents,
    isLoadingHistoryStudents,
    historyStudentId,
    setHistoryStudentId,
    historyRecords,
    historyPagination,
    isLoadingHistory,
    fetchStudentHistory,

    exportSectionId,
    setExportSectionId,
    exportStartDate,
    setExportStartDate,
    exportEndDate,
    setExportEndDate,
    isExporting,
    exportAttendance,
  } = useAttendanceReports();

  const sectionOptions = sections.map((s) => ({
    id: s.id,
    label: `${classSection.find((c) => c.id === s.class_id)?.name ?? ''} - Section ${s.name}`,
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "daily", label: ATTENDANCE_REPORT_PAGE.tabs.daily },
    { key: "monthly", label: ATTENDANCE_REPORT_PAGE.tabs.monthly },
    { key: "defaulters", label: ATTENDANCE_REPORT_PAGE.tabs.defaulters },
    {
      key: "studentHistory",
      label: ATTENDANCE_REPORT_PAGE.tabs.studentHistory,
    },
  ];

  // Daily report columns
  const dailyColumns = useMemo<ColumnDef<DailyReportRow>[]>(
    () => [
      {
        accessorKey: "student_name",
        header: ATTENDANCE_REPORT_PAGE.daily.table.studentName,
        meta: { primary: true },
      },
      {
        accessorKey: "admission_number",
        header: ATTENDANCE_REPORT_PAGE.daily.table.admissionNumber,
      },
      {
        accessorKey: "roll_number",
        header: ATTENDANCE_REPORT_PAGE.daily.table.rollNumber,
      },
      {
        accessorKey: "status",
        header: ATTENDANCE_REPORT_PAGE.daily.table.status,
        cell: ({ row }) => (
          <Badge variant={ATTENDANCE_STATUS_BADGE[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "is_late",
        header: ATTENDANCE_REPORT_PAGE.daily.table.isLate,
        cell: ({ row }) => (row.original.is_late ? "Yes" : "No"),
      },
      {
        accessorKey: "remarks",
        header: ATTENDANCE_REPORT_PAGE.daily.table.remarks,
        cell: ({ row }) => row.original.remarks ?? "—",
      },
      {
        accessorKey: "marked_by_username",
        header: ATTENDANCE_REPORT_PAGE.daily.table.markedBy,
      },
    ],
    []
  );

  // Monthly report columns
  const monthlyColumns = useMemo<ColumnDef<MonthlyReportRow>[]>(
    () => [
      {
        accessorKey: "student_name",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.student,
        meta: { primary: true },
        cell: ({ row }) => row.original.student_name ?? row.original.student_id,
      },
      {
        accessorKey: "admission_number",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.admissionNumber,
      },
      {
        accessorKey: "roll_number",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.rollNumber,
      },
      {
        accessorKey: "total_days",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.totalDays,
      },
      {
        accessorKey: "present",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.present,
      },
      {
        accessorKey: "absent",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.absent,
      },
      {
        accessorKey: "percentage",
        header: ATTENDANCE_REPORT_PAGE.monthly.table.percentage,
        cell: ({ row }) => (
          <Badge variant={row.original.percentage >= 75 ? "success" : "danger"}>
            {Math.round(row.original.percentage)}%
          </Badge>
        ),
      },
    ],
    []
  );

  // Defaulter columns
  const defaulterColumns = useMemo<ColumnDef<DefaulterRow>[]>(
    () => [
      {
        accessorKey: "student_name",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.student,
        meta: { primary: true },
        cell: ({ row }) =>
          row.original.student_name ?? row.original.studentName ?? row.original.student_id,
      },
      {
        accessorKey: "admission_number",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.admissionNo,
        cell: ({ row }) => row.original.admission_number ?? row.original.admissionNo ?? "—",
      },
      {
        accessorKey: "roll_number",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.rollNo,
        cell: ({ row }) => row.original.roll_number ?? row.original.rollNo ?? "—",
      },
      {
        id: "class",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.class,
        cell: ({ row }) =>
          `${row.original.class_name ?? "—"}${
            row.original.section_name ? ` / ${row.original.section_name}` : ""
          }`,
      },
      {
        accessorKey: "total_present",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.present,
      },
      {
        accessorKey: "total_days",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.totalDays,
      },
      {
        accessorKey: "total_absent",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.absent,
      },
      {
        accessorKey: "percentage",
        header: ATTENDANCE_REPORT_PAGE.defaulters.table.percentage,
        cell: ({ row }) => (
          <Badge variant="danger">{Math.round(row.original.percentage)}%</Badge>
        ),
      },
    ],
    []
  );

  // History columns
  const historyColumns = useMemo<ColumnDef<HistoryRow>[]>(
    () => [
      {
        accessorKey: "date",
        header: ATTENDANCE_REPORT_PAGE.studentHistory.table.date,
        cell: ({ row }) => new Date(row.original.date).toLocaleDateString(),
      },
      {
        accessorKey: "status",
        header: ATTENDANCE_REPORT_PAGE.studentHistory.table.status,
        cell: ({ row }) => (
          <Badge variant={ATTENDANCE_STATUS_BADGE[row.original.status]}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "remarks",
        header: ATTENDANCE_REPORT_PAGE.studentHistory.table.remarks,
        cell: ({ row }) => row.original.remarks ?? "—",
      },
    ],
    []
  );

  return (
    <PageCol>
      <PageHeader
        title={ATTENDANCE_REPORT_PAGE.title}
        actions={
          <>
            <Select
              width="sm"
              value={exportSectionId}
              onChange={(e) => setExportSectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">All Sections</option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              width="sm"
              value={exportStartDate}
              onChange={(e) => setExportStartDate(e.target.value)}
            />
            <Input
              type="date"
              width="sm"
              value={exportEndDate}
              onChange={(e) => setExportEndDate(e.target.value)}
            />
            <Button
              variant="outline"
              loading={isExporting}
              onClick={exportAttendance}
            >
              {ATTENDANCE_REPORT_PAGE.export}
            </Button>
          </>
        }
      />

      {/* Tabs */}
      <Div type="row" gap="sm">
        {tabs.map((tab) => (
          <Button
            key={tab.key}
            variant={activeTab === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </Button>
        ))}
      </Div>

      {/* ── Daily Report ── */}
      {activeTab === "daily" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Select
              width="md"
              value={dailySectionId}
              onChange={(e) => setDailySectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">
                {ATTENDANCE_REPORT_PAGE.daily.selectSection}
              </option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Input
              type="date"
              width="sm"
              value={dailyDate}
              onChange={(e) => setDailyDate(e.target.value)}
            />
            <Button onClick={fetchDailyReport} loading={isLoadingDaily}>
              {ATTENDANCE_REPORT_PAGE.daily.fetch}
            </Button>
          </Div>

          {dailyReport && (
            <Div type="col" gap="md">
              <Div type="row" gap="md">
                <MiniStat
                  label={ATTENDANCE_REPORT_PAGE.daily.stats.total}
                  value={dailyReport.stats.total}
                />
                <MiniStat
                  label={ATTENDANCE_REPORT_PAGE.daily.stats.present}
                  value={dailyReport.stats.present}
                  color="green"
                />
                <MiniStat
                  label={ATTENDANCE_REPORT_PAGE.daily.stats.absent}
                  value={dailyReport.stats.absent}
                  color="red"
                />
                <MiniStat
                  label={ATTENDANCE_REPORT_PAGE.daily.stats.late}
                  value={dailyReport.stats.late}
                  color="yellow"
                />
                <MiniStat
                  label={ATTENDANCE_REPORT_PAGE.daily.stats.percentage}
                  value={`${dailyReport.stats.total > 0 ? Math.round((dailyReport.stats.present / dailyReport.stats.total) * 100) : 0}%`}
                  color={
                    dailyReport.stats.total > 0 &&
                    Math.round(
                      (dailyReport.stats.present / dailyReport.stats.total) *
                        100,
                    ) >= 75
                      ? "green"
                      : "red"
                  }
                />
              </Div>

              <DataTable
                columns={dailyColumns}
                data={dailyReport.records.map(r => ({
                  ...r,
                  remarks: r.remarks ?? undefined,
                  marked_by_username: r.marked_by_username || "—",
                }))}
                emptyText={ATTENDANCE_REPORT_PAGE.daily.empty}
              />
            </Div>
          )}
        </Div>
      )}

      {/* ── Monthly Summary ── */}
      {activeTab === "monthly" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Select
              width="md"
              value={monthlySectionId}
              onChange={(e) => setMonthlySectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">
                {ATTENDANCE_REPORT_PAGE.monthly.selectSection}
              </option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Select
              width="sm"
              value={monthlyMonth}
              onChange={(e) => setMonthlyMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
            <Select
              width="sm"
              value={monthlyYear}
              onChange={(e) => setMonthlyYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </Select>
            <Button onClick={fetchMonthlyReport} loading={isLoadingMonthly}>
              {ATTENDANCE_REPORT_PAGE.monthly.fetch}
            </Button>
          </Div>

          {isLoadingMonthly ? (
            <Div type="row" justify="center" className="py-20">
              <Spinner size="lg" />
            </Div>
          ) : !monthlyReport?.student_summaries?.length ? (
            <Div
              type="col"
              gap="sm"
              align="center"
              className="rounded-xl border border-dashed border-border py-16 text-center"
            >
              <P color="muted">{ATTENDANCE_REPORT_PAGE.monthly.empty}</P>
            </Div>
          ) : (
            <DataTable
              columns={monthlyColumns}
              data={monthlyReport.student_summaries}
              emptyText={ATTENDANCE_REPORT_PAGE.monthly.empty}
            />
          )}
        </Div>
      )}

      {/* ── Defaulters ── */}
      {activeTab === "defaulters" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Select
              width="md"
              value={defaulterSectionId}
              onChange={(e) => setDefaulterSectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">
                {ATTENDANCE_REPORT_PAGE.defaulters.selectSection}
              </option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Div type="row" align="center" gap="sm">
              <P noWrap>{ATTENDANCE_REPORT_PAGE.defaulters.threshold}</P>
              <Input
                type="number"
                width="xs"
                value={defaulterThreshold}
                onChange={(e) => setDefaulterThreshold(Number(e.target.value))}
                min={0}
                max={100}
              />
              <P color="default">%</P>
            </Div>
            <Button onClick={fetchDefaulters} loading={isLoadingDefaulters}>
              {ATTENDANCE_REPORT_PAGE.defaulters.fetch}
            </Button>
          </Div>

          {isLoadingDefaulters ? (
            <Div type="row" justify="center" className="py-20">
              <Spinner size="lg" />
            </Div>
          ) : defaulters.length === 0 ? (
            <Div
              type="col"
              gap="sm"
              align="center"
              className="rounded-xl border border-dashed border-border py-16 text-center"
            >
              <P color="muted">{ATTENDANCE_REPORT_PAGE.defaulters.empty}</P>
            </Div>
          ) : (
            <DataTable
              columns={defaulterColumns}
              data={defaulters.map(d => ({
                ...d,
                total_present: Number(d.total_present) || 0,
                total_absent: Number(d.total_absent) || 0,
              }))}
              emptyText={ATTENDANCE_REPORT_PAGE.defaulters.empty}
            />
          )}
        </Div>
      )}

      {/* ── Student History ── */}
      {activeTab === "studentHistory" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Select
              width="md"
              value={historySectionId}
              onChange={(e) => setHistorySectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">Select Section</option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.label}
                </option>
              ))}
            </Select>
            <Select
              width="md"
              value={historyStudentId}
              onChange={(e) => setHistoryStudentId(e.target.value)}
              disabled={!historySectionId || isLoadingHistoryStudents}
            >
              <option value="">
                {isLoadingHistoryStudents ? "Loading students…" : "Select Student"}
              </option>
              {historyStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name ?? ""} {s.admission_number ? `(${s.admission_number})` : ""}
                </option>
              ))}
            </Select>
            <Button
              onClick={() => fetchStudentHistory(1)}
              loading={isLoadingHistory}
            >
              {ATTENDANCE_REPORT_PAGE.studentHistory.fetch}
            </Button>
          </Div>

          {isLoadingHistory ? (
            <Div type="row" justify="center" className="py-20">
              <Spinner size="lg" />
            </Div>
          ) : historyRecords.length === 0 ? (
            <Div
              type="col"
              gap="sm"
              align="center"
              className="rounded-xl border border-dashed border-border py-16 text-center"
            >
              <P color="muted">{ATTENDANCE_REPORT_PAGE.studentHistory.empty}</P>
            </Div>
          ) : (
            <>
              <DataTable
                columns={historyColumns}
                data={historyRecords.map(r => ({
                  ...r,
                  remarks: r.remarks ?? undefined,
                }))}
                emptyText={ATTENDANCE_REPORT_PAGE.studentHistory.empty}
              />

              {historyPagination && historyPagination.totalPages > 1 && (
                <Div type="row" justify="between" align="center">
                  <P size="sm" color="muted">
                    Page {historyPagination.page} of {historyPagination.totalPages} ({historyPagination.total} records)
                  </P>
                  <Div type="row" gap="sm">
                    {Array.from({ length: historyPagination.totalPages }, (_, i) => (
                      <Button
                        key={i + 1}
                        variant={historyPagination.page === i + 1 ? "default" : "outline"}
                        size="sm"
                        onClick={() => fetchStudentHistory(i + 1)}
                      >
                        {i + 1}
                      </Button>
                    ))}
                  </Div>
                </Div>
              )}
            </>
          )}
        </Div>
      )}
    </PageCol>
  );
}
