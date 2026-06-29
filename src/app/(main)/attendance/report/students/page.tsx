"use client";

import { useMemo } from "react";
import { useAttendanceReports } from "@/hooks/useAttendanceReports";
import { useAttendanceAudit } from "@/hooks/useAttendanceAudit";
import { useMissingPunches } from "@/hooks/useMissingPunches";
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
  Modal,
  ModalBody,
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

type Tab = "daily" | "monthly" | "defaulters" | "studentHistory" | "missingPunch" | "heatmap" | "lateTrend";

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

const today = new Date().toISOString().split("T")[0];

export default function StudentAttendanceReportPage() {
  const {
    activeTab,
    setActiveTab,
    academicYears,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
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
    selectedAuditId,
    setSelectedAuditId,

    heatmapSectionId,
    setHeatmapSectionId,
    heatmapStudents,
    isLoadingHeatmapStudents,
    heatmapStudentId,
    setHeatmapStudentId,
    heatmapYear,
    setHeatmapYear,
    heatmapData,
    isLoadingHeatmap,
    fetchHeatmap,

    lateTrendSectionId,
    setLateTrendSectionId,
    lateTrendMonth,
    setLateTrendMonth,
    lateTrendYear,
    setLateTrendYear,
    lateTrendData,
    isLoadingLateTrend,
    fetchLateTrend,
  } = useAttendanceReports();

  const { log: auditLog, isLoading: isLoadingAudit } = useAttendanceAudit(selectedAuditId);
  const { date: mpDate, setDate: setMpDate, records: missingPunches, isLoading: isLoadingMp, fetch: fetchMp, resolve: resolvePunch, resolvingId } = useMissingPunches();

  const sectionOptions = sections.map((s) => ({
    id: s.id,
    label: `${classSection.find((c) => c.id === s.class_id)?.name ?? ''} - Section ${s.name}`,
  }));

  const tabs: { key: Tab; label: string }[] = [
    { key: "daily", label: ATTENDANCE_REPORT_PAGE.tabs.daily },
    { key: "monthly", label: ATTENDANCE_REPORT_PAGE.tabs.monthly },
    { key: "defaulters", label: ATTENDANCE_REPORT_PAGE.tabs.defaulters },
    { key: "studentHistory", label: ATTENDANCE_REPORT_PAGE.tabs.studentHistory },
    { key: "missingPunch", label: "Missing Punch" },
    { key: "heatmap", label: "Heatmap" },
    { key: "lateTrend", label: "Late Trend" },
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
          <Badge variant={ATTENDANCE_STATUS_BADGE[row.original.status as keyof typeof ATTENDANCE_STATUS_BADGE]}>
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
      {
        id: "audit",
        header: "Audit",
        size: 72,
        cell: ({ row }) => (
          <Button size="xs" variant="ghost" onClick={() => setSelectedAuditId(row.original.id)}>
            History
          </Button>
        ),
      },
    ],
    [setSelectedAuditId]
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
          <Badge variant={ATTENDANCE_STATUS_BADGE[row.original.status as keyof typeof ATTENDANCE_STATUS_BADGE]}>
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
              max={today}
              onChange={(e) => {
                const val = e.target.value;
                setExportStartDate(val);
                // if start moved past end, pull end forward
                if (val > exportEndDate) setExportEndDate(val);
              }}
            />
            <Input
              type="date"
              width="sm"
              value={exportEndDate}
              min={exportStartDate}
              max={today}
              onChange={(e) => {
                const val = e.target.value;
                setExportEndDate(val);
                // if end moved before start, pull start back
                if (val < exportStartDate) setExportStartDate(val);
              }}
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

      {/* Academic Year selector */}
      <Div variant="card" padding="p-3" type="row" align="center" gap="sm">
        <P size="sm" color="muted" noWrap>Academic Year</P>
        <Select
          width="sm"
          value={selectedAcademicYearId}
          onChange={(e) => setSelectedAcademicYearId(e.target.value)}
        >
          <option value="">All years</option>
          {academicYears.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}{y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>
      </Div>

      {/* Tabs */}
      <Div type="row" gap="sm" wrap>
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
      {/* ── Missing Punch ── */}
      {activeTab === "missingPunch" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Input
              type="date"
              width="sm"
              value={mpDate}
              onChange={(e) => setMpDate(e.target.value)}
            />
            <Button onClick={fetchMp} loading={isLoadingMp}>
              Fetch
            </Button>
          </Div>
          {isLoadingMp ? (
            <Div type="row" justify="center" className="py-20">
              <Spinner size="lg" />
            </Div>
          ) : missingPunches.length === 0 ? (
            <Div
              type="col"
              align="center"
              className="rounded-xl border border-dashed border-border py-16 text-center"
            >
              <P color="muted">No missing punches for this date.</P>
            </Div>
          ) : (
            <DataTable
              columns={[
                { accessorKey: 'student_name', header: 'Student', meta: { primary: true } },
                {
                  accessorKey: 'admission_number',
                  header: 'Admission No.',
                  cell: ({ row }) => row.original.admission_number ?? '—',
                },
                {
                  accessorKey: 'entry_tap',
                  header: 'Entry Time',
                  cell: ({ row }) => new Date(row.original.entry_tap).toLocaleTimeString(),
                },
                {
                  id: 'resolve',
                  header: 'Resolve',
                  cell: ({ row }) => (
                    <Div type="row" gap="xs">
                      <Button
                        size="xs"
                        variant="success"
                        loading={resolvingId === row.original.punch_id}
                        onClick={() => resolvePunch(row.original.punch_id, 'PRESENT')}
                      >
                        Present
                      </Button>
                      <Button
                        size="xs"
                        variant="secondary"
                        loading={resolvingId === row.original.punch_id}
                        onClick={() => resolvePunch(row.original.punch_id, 'HALF_DAY')}
                      >
                        Half Day
                      </Button>
                    </Div>
                  ),
                },
              ]}
              data={missingPunches}
              emptyText="No missing punches"
            />
          )}
        </Div>
      )}

      {/* ── Heatmap ── */}
      {activeTab === "heatmap" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Select
              width="md"
              value={heatmapSectionId}
              onChange={(e) => setHeatmapSectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">Select Section</option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
            <Select
              width="md"
              value={heatmapStudentId}
              onChange={(e) => setHeatmapStudentId(e.target.value)}
              disabled={!heatmapSectionId || isLoadingHeatmapStudents}
            >
              <option value="">
                {isLoadingHeatmapStudents ? "Loading students…" : "Select Student"}
              </option>
              {heatmapStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.first_name} {s.last_name ?? ""} {s.admission_number ? `(${s.admission_number})` : ""}
                </option>
              ))}
            </Select>
            <Select
              width="sm"
              value={heatmapYear}
              onChange={(e) => setHeatmapYear(Number(e.target.value))}
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Button onClick={fetchHeatmap} loading={isLoadingHeatmap}>Load Heatmap</Button>
          </Div>
          {isLoadingHeatmap ? (
            <Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>
          ) : heatmapData.length === 0 ? (
            <P color="muted">Select a section and student, then load the heatmap.</P>
          ) : (
            <Div type="col" gap="sm">
              <Div type="row" gap="md" align="center">
                <Div type="row" gap="xs" align="center">
                  <Div className="w-4 h-4 rounded-sm bg-green-500" />
                  <P size="xs" color="muted">Present</P>
                </Div>
                <Div type="row" gap="xs" align="center">
                  <Div className="w-4 h-4 rounded-sm bg-red-500" />
                  <P size="xs" color="muted">Absent</P>
                </Div>
                <Div type="row" gap="xs" align="center">
                  <Div className="w-4 h-4 rounded-sm bg-yellow-500" />
                  <P size="xs" color="muted">Late</P>
                </Div>
                <Div type="row" gap="xs" align="center">
                  <Div className="w-4 h-4 rounded-sm bg-gray-300" />
                  <P size="xs" color="muted">Other</P>
                </Div>
              </Div>
              <Div type="row" wrap gap="xs">
                {heatmapData.map((entry) => (
                  <Div
                    key={entry.date}
                    title={`${entry.date}: ${entry.status}`}
                    className={`w-4 h-4 rounded-sm ${entry.status === 'PRESENT' ? 'bg-green-500' : entry.status === 'ABSENT' ? 'bg-red-500' : entry.status === 'LATE' ? 'bg-yellow-500' : 'bg-gray-300'}`}
                  />
                ))}
              </Div>
            </Div>
          )}
        </Div>
      )}

      {/* ── Late Trend ── */}
      {activeTab === "lateTrend" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Select
              width="md"
              value={lateTrendSectionId}
              onChange={(e) => setLateTrendSectionId(e.target.value)}
              disabled={isLoadingClassSection}
            >
              <option value="">Select Section</option>
              {sectionOptions.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </Select>
            <Select
              width="sm"
              value={lateTrendMonth}
              onChange={(e) => setLateTrendMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </Select>
            <Select
              width="sm"
              value={lateTrendYear}
              onChange={(e) => setLateTrendYear(Number(e.target.value))}
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </Select>
            <Button onClick={fetchLateTrend} loading={isLoadingLateTrend}>Load Trend</Button>
          </Div>
          {isLoadingLateTrend ? (
            <Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>
          ) : lateTrendData.length === 0 ? (
            <P color="muted">Select a section and load the late trend data.</P>
          ) : (
            <DataTable
              columns={[
                { accessorKey: 'date', header: 'Date' },
                { accessorKey: 'late_count', header: 'Late Count' },
              ]}
              data={lateTrendData}
              emptyText="No late arrivals in this period"
            />
          )}
        </Div>
      )}

      {selectedAuditId && (
        <Modal title="Attendance Change History" onClose={() => setSelectedAuditId(null)}>
          <ModalBody>
            {isLoadingAudit ? (
              <Div type="row" justify="center" padding="p-8">
                <Spinner />
              </Div>
            ) : auditLog.length === 0 ? (
              <P color="muted">No changes recorded for this record.</P>
            ) : (
              <Div type="col" gap="sm">
                {auditLog.map((entry) => (
                  <Div key={entry.id} variant="inset" padding="p-3" type="col" gap="xs">
                    <Div type="row" justify="between" align="center">
                      <P size="xs" color="muted">{new Date(entry.changed_at).toLocaleString()}</P>
                      {entry.ip_address && <P size="xs" color="muted">IP: {entry.ip_address}</P>}
                    </Div>
                    <Div type="row" gap="sm" align="center">
                      {entry.old_status && <Badge variant={ATTENDANCE_STATUS_BADGE[entry.old_status as keyof typeof ATTENDANCE_STATUS_BADGE] ?? 'default'}>{entry.old_status}</Badge>}
                      <P size="xs" color="muted">→</P>
                      {entry.new_status && <Badge variant={ATTENDANCE_STATUS_BADGE[entry.new_status as keyof typeof ATTENDANCE_STATUS_BADGE] ?? 'default'}>{entry.new_status}</Badge>}
                    </Div>
                    {(entry.old_remarks || entry.new_remarks) && (
                      <P size="xs" color="muted">
                        Remarks: {entry.old_remarks ?? '—'} → {entry.new_remarks ?? '—'}
                      </P>
                    )}
                    <P size="xs" color="muted">Changed by: {entry.changed_by}</P>
                  </Div>
                ))}
              </Div>
            )}
          </ModalBody>
        </Modal>
      )}
    </PageCol>
  );
}
