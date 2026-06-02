"use client";

import { useAttendanceReports } from "@/hooks/useAttendanceReports";
import {
  ATTENDANCE_REPORT_PAGE,
  ATTENDANCE_STATUS_BADGE,
} from "@/constants";
import {
  Div,
  H1,
  H2,
  P,
  Button,
  Input,
  Select,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Badge,
  Spinner,
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

export default function StudentAttendanceReportPage() {
  const {
    activeTab,
    setActiveTab,
    sections,
    isLoadingSections,

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

  const tabs: { key: Tab; label: string }[] = [
    { key: "daily", label: ATTENDANCE_REPORT_PAGE.tabs.daily },
    { key: "monthly", label: ATTENDANCE_REPORT_PAGE.tabs.monthly },
    { key: "defaulters", label: ATTENDANCE_REPORT_PAGE.tabs.defaulters },
    { key: "studentHistory", label: ATTENDANCE_REPORT_PAGE.tabs.studentHistory },
  ];

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <H1>{ATTENDANCE_REPORT_PAGE.title}</H1>
        <Div type="row" gap="sm" align="center">
          <Select
            width="sm"
            value={exportSectionId}
            onChange={(e) => setExportSectionId(e.target.value)}
            disabled={isLoadingSections}
          >
            <option value="">All Sections</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </Select>
          <Input type="date" width="sm" value={exportStartDate} onChange={(e) => setExportStartDate(e.target.value)} />
          <Input type="date" width="sm" value={exportEndDate} onChange={(e) => setExportEndDate(e.target.value)} />
          <Button variant="outline" loading={isExporting} onClick={exportAttendance}>
            {ATTENDANCE_REPORT_PAGE.export}
          </Button>
        </Div>
      </Div>

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
              disabled={isLoadingSections}
            >
              <option value="">{ATTENDANCE_REPORT_PAGE.daily.selectSection}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
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
                <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4 min-w-[100px]">
                  <P className="text-xs text-muted-foreground">{ATTENDANCE_REPORT_PAGE.daily.stats.total}</P>
                  <H2>{dailyReport.total}</H2>
                </Div>
                <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4 min-w-[100px]">
                  <P className="text-xs text-muted-foreground">{ATTENDANCE_REPORT_PAGE.daily.stats.present}</P>
                  <H2 className="text-green-600">{dailyReport.present}</H2>
                </Div>
                <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4 min-w-[100px]">
                  <P className="text-xs text-muted-foreground">{ATTENDANCE_REPORT_PAGE.daily.stats.absent}</P>
                  <H2 className="text-red-600">{dailyReport.absent}</H2>
                </Div>
                <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4 min-w-[100px]">
                  <P className="text-xs text-muted-foreground">{ATTENDANCE_REPORT_PAGE.daily.stats.late}</P>
                  <H2 className="text-yellow-600">{dailyReport.late}</H2>
                </Div>
                <Div type="col" gap="xs" className="rounded-xl border border-border bg-card p-4 min-w-[100px]">
                  <P className="text-xs text-muted-foreground">{ATTENDANCE_REPORT_PAGE.daily.stats.percentage}</P>
                  <H2>
                    {dailyReport.total > 0
                      ? Math.round((dailyReport.present / dailyReport.total) * 100)
                      : 0}%
                  </H2>
                </Div>
              </Div>

              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.daily.table.student}</TableHeaderCell>
                    <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.daily.table.status}</TableHeaderCell>
                    <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.daily.table.remarks}</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {dailyReport.records.length === 0 ? (
                    <TableEmptyRow colSpan={3}>{ATTENDANCE_REPORT_PAGE.daily.empty}</TableEmptyRow>
                  ) : (
                    dailyReport.records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell primary>{r.student_id}</TableCell>
                        <TableCell>
                          <Badge variant={ATTENDANCE_STATUS_BADGE[r.status]}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{r.remarks ?? "—"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
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
              disabled={isLoadingSections}
            >
              <option value="">{ATTENDANCE_REPORT_PAGE.monthly.selectSection}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            <Select
              width="sm"
              value={monthlyMonth}
              onChange={(e) => setMonthlyMonth(Number(e.target.value))}
            >
              {MONTHS.map((m) => (
                <option key={m.value} value={m.value}>{m.label}</option>
              ))}
            </Select>
            <Select
              width="sm"
              value={monthlyYear}
              onChange={(e) => setMonthlyYear(Number(e.target.value))}
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </Select>
            <Button onClick={fetchMonthlyReport} loading={isLoadingMonthly}>
              {ATTENDANCE_REPORT_PAGE.monthly.fetch}
            </Button>
          </Div>

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.monthly.table.student}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.monthly.table.totalDays}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.monthly.table.present}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.monthly.table.absent}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.monthly.table.late}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.monthly.table.percentage}</TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {isLoadingMonthly ? (
                <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
              ) : monthlyReport.length === 0 ? (
                <TableEmptyRow colSpan={6}>{ATTENDANCE_REPORT_PAGE.monthly.empty}</TableEmptyRow>
              ) : (
                monthlyReport.map((r, i) => (
                  <TableRow key={r.student_id ?? i}>
                    <TableCell primary>{r.student_name ?? r.student_id}</TableCell>
                    <TableCell>{r.total_days}</TableCell>
                    <TableCell>{r.present}</TableCell>
                    <TableCell>{r.absent}</TableCell>
                    <TableCell>{r.late}</TableCell>
                    <TableCell>
                      <Badge variant={r.percentage >= 75 ? "success" : "danger"}>
                        {Math.round(r.percentage)}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
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
              disabled={isLoadingSections}
            >
              <option value="">{ATTENDANCE_REPORT_PAGE.defaulters.selectSection}</option>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </Select>
            <Div type="row" align="center" gap="sm">
              <P className="text-sm text-muted-foreground whitespace-nowrap">
                {ATTENDANCE_REPORT_PAGE.defaulters.threshold}
              </P>
              <Input
                type="number"
                width="xs"
                value={defaulterThreshold}
                onChange={(e) => setDefaulterThreshold(Number(e.target.value))}
                min={0}
                max={100}
              />
              <P className="text-sm">%</P>
            </Div>
            <Button onClick={fetchDefaulters} loading={isLoadingDefaulters}>
              {ATTENDANCE_REPORT_PAGE.defaulters.fetch}
            </Button>
          </Div>

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.defaulters.table.student}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.defaulters.table.admissionNo}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.defaulters.table.class}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.defaulters.table.present}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.defaulters.table.absent}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.defaulters.table.percentage}</TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {isLoadingDefaulters ? (
                <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
              ) : defaulters.length === 0 ? (
                <TableEmptyRow colSpan={6}>{ATTENDANCE_REPORT_PAGE.defaulters.empty}</TableEmptyRow>
              ) : (
                defaulters.map((d, i) => (
                  <TableRow key={d.student_id ?? i}>
                    <TableCell primary>{d.student_name ?? d.student_id}</TableCell>
                    <TableCell>{d.admission_number ?? "—"}</TableCell>
                    <TableCell>
                      {d.class_name ?? "—"}{d.section_name ? ` / ${d.section_name}` : ""}
                    </TableCell>
                    <TableCell>{d.present}</TableCell>
                    <TableCell>{d.absent}</TableCell>
                    <TableCell>
                      <Badge variant="danger">{Math.round(d.percentage)}%</Badge>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Div>
      )}

      {/* ── Student History ── */}
      {activeTab === "studentHistory" && (
        <Div type="col" gap="md">
          <Div type="row" gap="md" align="center" wrap>
            <Input
              width="md"
              placeholder={ATTENDANCE_REPORT_PAGE.studentHistory.studentId}
              value={historyStudentId}
              onChange={(e) => setHistoryStudentId(e.target.value)}
            />
            <Button onClick={() => fetchStudentHistory(1)} loading={isLoadingHistory}>
              {ATTENDANCE_REPORT_PAGE.studentHistory.fetch}
            </Button>
          </Div>

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.studentHistory.table.date}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.studentHistory.table.status}</TableHeaderCell>
                <TableHeaderCell>{ATTENDANCE_REPORT_PAGE.studentHistory.table.remarks}</TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {isLoadingHistory ? (
                <TableEmptyRow colSpan={3}><Spinner /></TableEmptyRow>
              ) : historyRecords.length === 0 ? (
                <TableEmptyRow colSpan={3}>{ATTENDANCE_REPORT_PAGE.studentHistory.empty}</TableEmptyRow>
              ) : (
                historyRecords.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell primary>
                      {new Date(r.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={ATTENDANCE_STATUS_BADGE[r.status]}>
                        {r.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{r.remarks ?? "—"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {historyPagination && historyPagination.totalPages > 1 && (
            <TablePagination
              total={historyPagination.total}
              page={historyPagination.page}
              totalPages={historyPagination.totalPages}
            />
          )}
        </Div>
      )}
    </Div>
  );
}
