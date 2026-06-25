"use client";

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
  MiniStat,
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

              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.studentName}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.admissionNumber}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.rollNumber}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.status}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.isLate}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.remarks}
                    </TableHeaderCell>
                    <TableHeaderCell>
                      {ATTENDANCE_REPORT_PAGE.daily.table.markedBy}
                    </TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {dailyReport.records.length === 0 ? (
                    <TableEmptyRow colSpan={7}>
                      {ATTENDANCE_REPORT_PAGE.daily.empty}
                    </TableEmptyRow>
                  ) : (
                    dailyReport.records.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell primary>{r.student_name}</TableCell>
                        <TableCell primary>{r.admission_number}</TableCell>
                        <TableCell primary>{r.roll_number}</TableCell>
                        <TableCell>
                          <Badge variant={ATTENDANCE_STATUS_BADGE[r.status]}>
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell primary>
                          {r.is_late ? "Yes" : "No"}
                        </TableCell>

                        <TableCell>{r.remarks ?? "—"}</TableCell>
                        <TableCell>{r.marked_by_username}</TableCell>
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

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.student}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.admissionNumber}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.rollNumber}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.totalDays}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.present}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.absent}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.monthly.table.percentage}
                </TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {isLoadingMonthly ? (
                <TableEmptyRow colSpan={6}>
                  <Spinner />
                </TableEmptyRow>
              ) : !monthlyReport?.student_summaries?.length ? (
                <TableEmptyRow colSpan={7}>
                  {ATTENDANCE_REPORT_PAGE.monthly.empty}
                </TableEmptyRow>
              ) : (
                monthlyReport?.student_summaries.map((r, i) => (
                  <TableRow key={r.student_id ?? i}>
                    <TableCell primary>
                      {r.student_name ?? r.student_id}
                    </TableCell>
                    <TableCell>{r.admission_number}</TableCell>
                    <TableCell>{r.roll_number}</TableCell>
                    <TableCell>{r.total_days}</TableCell>
                    <TableCell>{r.present}</TableCell>
                    <TableCell>{r.absent}</TableCell>
                    <TableCell>
                      <Badge
                        variant={r.percentage >= 75 ? "success" : "danger"}
                      >
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

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.student}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.admissionNo}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.rollNo}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.class}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.present}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.totalDays}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.absent}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.defaulters.table.percentage}
                </TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {isLoadingDefaulters ? (
                <TableEmptyRow colSpan={6}>
                  <Spinner />
                </TableEmptyRow>
              ) : defaulters.length === 0 ? (
                <TableEmptyRow colSpan={6}>
                  {ATTENDANCE_REPORT_PAGE.defaulters.empty}
                </TableEmptyRow>
              ) : (
                defaulters.map((d, i) => (
                  <TableRow key={d.student_id ?? i}>
                    <TableCell primary>
                      {d.student_name ?? d?.studentName ?? d.student_id}
                    </TableCell>
                    <TableCell>{d.admission_number ?? d?.admissionNo ?? "—"}</TableCell>
                    <TableCell>{d.roll_number ?? d?.rollNo ?? "—"}</TableCell>
                    <TableCell>
                      {d.class_name ?? "—"}
                      {d.section_name ? ` / ${d.section_name}` : ""}
                    </TableCell>
                    <TableCell>{d.total_days}</TableCell>
                    <TableCell>{d.total_present}</TableCell>
                    <TableCell>{d.total_absent}</TableCell>
                    <TableCell>
                      <Badge variant="danger">
                        {Math.round(d.percentage)}%
                      </Badge>
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

          <Table>
            <TableHead>
              <TableHeadRow>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.studentHistory.table.date}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.studentHistory.table.status}
                </TableHeaderCell>
                <TableHeaderCell>
                  {ATTENDANCE_REPORT_PAGE.studentHistory.table.remarks}
                </TableHeaderCell>
              </TableHeadRow>
            </TableHead>
            <TableBody>
              {isLoadingHistory ? (
                <TableEmptyRow colSpan={3}>
                  <Spinner />
                </TableEmptyRow>
              ) : historyRecords.length === 0 ? (
                <TableEmptyRow colSpan={3}>
                  {ATTENDANCE_REPORT_PAGE.studentHistory.empty}
                </TableEmptyRow>
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
    </PageCol>
  );
}
