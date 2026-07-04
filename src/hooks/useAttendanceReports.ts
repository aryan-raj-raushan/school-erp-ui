"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AttendanceService } from "@/services/attendance.service";
import { ClassesService } from "@/services/classes.service";
import { StudentsService } from "@/services/students.service";
import { AcademicYearsService } from "@/services/academic-years.service";
import type { Student, AcademicYear } from "@/types";
import type {
  DailyAttendanceReport,
  MonthlyAttendanceSummary,
  AttendanceDefaulter,
  AttendanceRecord,
  PaginationMeta,
  Section,
  Class,
  MonthlyAttendanceReport,
  HeatmapEntry,
  LateTrendEntry,
} from "@/types";

type ReportTab = "daily" | "monthly" | "defaulters" | "studentHistory" | "missingPunch" | "heatmap" | "lateTrend";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function firstOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split("T")[0];
}

function currentMonth() {
  return new Date().getMonth() + 1;
}

function currentYear() {
  return new Date().getFullYear();
}

export function useAttendanceReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("daily");

  // Academic Year
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");

  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const [classSection, setClassSection] = useState<Class[]>([]);
  const [isLoadingClassSection, setIsLoadingClassSection] = useState(false);

  // Class/Section — shared across every tab and the export card, so there's
  // a single filter instead of a separate one duplicated everywhere.
  const [selectedClassId, setSelectedClassIdRaw] = useState("");
  const [selectedSectionId, setSelectedSectionId] = useState("");
  const setSelectedClassId = useCallback((classId: string) => {
    setSelectedClassIdRaw(classId);
    setSelectedSectionId("");
  }, []);

  // Daily
  const [dailyDate, setDailyDate] = useState(todayISO());
  const [dailyReport, setDailyReport] = useState<DailyAttendanceReport | null>(
    null,
  );
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);

  // Monthly
  const [monthlyMonth, setMonthlyMonth] = useState(currentMonth());
  const [monthlyYear, setMonthlyYear] = useState(currentYear());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyAttendanceReport | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Defaulters
  const [defaulterMonth, setDefaulterMonth] = useState(currentMonth());
  const [defaulterYear, setDefaulterYear] = useState(currentYear());
  const [defaulterThreshold, setDefaulterThreshold] = useState(75);
  const [defaulters, setDefaulters] = useState<AttendanceDefaulter[]>([]);
  const [isLoadingDefaulters, setIsLoadingDefaulters] = useState(false);

  // Student history
  const [historyStudents, setHistoryStudents] = useState<Student[]>([]);
  const [isLoadingHistoryStudents, setIsLoadingHistoryStudents] = useState(false);
  const [historyStudentId, setHistoryStudentId] = useState("");
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyPagination, setHistoryPagination] =
    useState<PaginationMeta | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Audit
  const [selectedAuditId, setSelectedAuditId] = useState<string | null>(null);

  // Heatmap
  const [heatmapStudents, setHeatmapStudents] = useState<Student[]>([]);
  const [isLoadingHeatmapStudents, setIsLoadingHeatmapStudents] = useState(false);
  const [heatmapStudentId, setHeatmapStudentId] = useState("");
  const [heatmapYear, setHeatmapYear] = useState(currentYear());
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

  // Late trend
  const [lateTrendMonth, setLateTrendMonth] = useState(currentMonth());
  const [lateTrendYear, setLateTrendYear] = useState(currentYear());
  const [lateTrendData, setLateTrendData] = useState<LateTrendEntry[]>([]);
  const [isLoadingLateTrend, setIsLoadingLateTrend] = useState(false);

  // Export
  const [exportStartDate, setExportStartDate] = useState(firstOfMonthISO());
  const [exportEndDate, setExportEndDate] = useState(todayISO());
  const [isExporting, setIsExporting] = useState(false);

  const fetchAcademicYears = useCallback(async () => {
    try {
      const res = await AcademicYearsService.list();
      setAcademicYears(res.items);
      const current = res.items.find((y) => y.is_current);
      if (current) setSelectedAcademicYearId(current.id);
    } catch {
      // non-fatal — page still usable without year filter
    }
  }, []);

  const fetchClasses = useCallback(async () => {
    setIsLoadingClassSection(true);
    try {
      const params = selectedAcademicYearId
        ? { academic_year_id: selectedAcademicYearId }
        : {};
      const res = await ClassesService.list(params);
      setClassSection(res.items);
      setSections(res.sections);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load classes");
    } finally {
      setIsLoadingClassSection(false);
    }
  }, [selectedAcademicYearId]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const fetchSections = useCallback(async () => {
    // sections now loaded in fetchClasses via ClassesService.list()
  }, []);

  async function fetchDailyReport() {
    if (!selectedSectionId) {
      toast.error("Select a section");
      return;
    }
    setIsLoadingDaily(true);
    try {
      const report = await AttendanceService.getDailyReport({
        class_section_id: selectedSectionId,
        date: dailyDate,
      });
      setDailyReport(report);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch daily report",
      );
    } finally {
      setIsLoadingDaily(false);
    }
  }

  async function fetchMonthlyReport() {
    if (!selectedSectionId) {
      toast.error("Select a section");
      return;
    }
    setIsLoadingMonthly(true);
    try {
      const report = await AttendanceService.getMonthlyReport({
        class_section_id: selectedSectionId,
        month: monthlyMonth,
        year: monthlyYear,
      });
      setMonthlyReport(report);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch monthly report",
      );
    } finally {
      setIsLoadingMonthly(false);
    }
  }

  async function fetchDefaulters() {
    if (!selectedSectionId) {
      toast.error("Select a section");
      return;
    }
    setIsLoadingDefaulters(true);
    try {
      const data = await AttendanceService.getDefaulters({
        class_section_id: selectedSectionId,
        month: defaulterMonth,
        year: defaulterYear,
        threshold: defaulterThreshold,
      });
      setDefaulters(data);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch defaulters",
      );
    } finally {
      setIsLoadingDefaulters(false);
    }
  }

  const fetchHistoryStudents = useCallback(async (sectionId: string) => {
    if (!sectionId) {
      setHistoryStudents([]);
      setHistoryStudentId("");
      return;
    }
    setIsLoadingHistoryStudents(true);
    try {
      const result = await StudentsService.list({ section_id: sectionId, limit: 100 });
      setHistoryStudents(result.items);
      setHistoryStudentId("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setIsLoadingHistoryStudents(false);
    }
  }, []);

  const fetchHeatmapStudents = useCallback(async (sectionId: string) => {
    if (!sectionId) {
      setHeatmapStudents([]);
      setHeatmapStudentId("");
      return;
    }
    setIsLoadingHeatmapStudents(true);
    try {
      const result = await StudentsService.list({ section_id: sectionId, limit: 100 });
      setHeatmapStudents(result.items);
      setHeatmapStudentId("");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load students");
    } finally {
      setIsLoadingHeatmapStudents(false);
    }
  }, []);

  async function fetchStudentHistory(page = 1) {
    if (!historyStudentId) {
      toast.error("Enter a student ID");
      return;
    }
    setIsLoadingHistory(true);
    try {
      const result = await AttendanceService.getStudentHistory(
        historyStudentId,
        { page, limit: 20 },
      );
      setHistoryRecords(result.items);
      setHistoryPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to fetch student history",
      );
    } finally {
      setIsLoadingHistory(false);
    }
  }

  async function fetchHeatmap() {
    if (!heatmapStudentId) { toast.error('Select a student'); return; }
    setIsLoadingHeatmap(true);
    try {
      const data = await AttendanceService.getHeatmap(heatmapStudentId, heatmapYear);
      setHeatmapData(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load heatmap');
    } finally {
      setIsLoadingHeatmap(false);
    }
  }

  async function fetchLateTrend() {
    if (!selectedSectionId) { toast.error('Select a section'); return; }
    setIsLoadingLateTrend(true);
    try {
      const data = await AttendanceService.getLateTrend(selectedSectionId, lateTrendMonth, lateTrendYear);
      setLateTrendData(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load late trend');
    } finally {
      setIsLoadingLateTrend(false);
    }
  }

  async function exportAttendance() {
    setIsExporting(true);
    try {
      const buffer = await AttendanceService.exportToFile({
        ...(selectedSectionId && { class_section_id: selectedSectionId }),
        ...(exportStartDate && { start_date: exportStartDate }),
        ...(exportEndDate && { end_date: exportEndDate }),
        format: "xlsx",
      });
      const blob = new Blob([buffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance_${exportStartDate ?? "all"}_to_${exportEndDate ?? "all"}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Attendance exported successfully");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to export attendance");
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => {
    fetchAcademicYears();
  }, [fetchAcademicYears]);

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  useEffect(() => {
    fetchHistoryStudents(selectedSectionId);
  }, [selectedSectionId, fetchHistoryStudents]);

  useEffect(() => {
    fetchHeatmapStudents(selectedSectionId);
  }, [selectedSectionId, fetchHeatmapStudents]);

  return {
    activeTab,
    setActiveTab,
    academicYears,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    classSection,
    sections,
    isLoadingSections,
    isLoadingClassSection,

    // Class/Section — shared across all tabs and export
    selectedClassId,
    setSelectedClassId,
    selectedSectionId,
    setSelectedSectionId,

    // Daily
    dailyDate,
    setDailyDate,
    dailyReport,
    isLoadingDaily,
    fetchDailyReport,

    // Monthly
    monthlyMonth,
    setMonthlyMonth,
    monthlyYear,
    setMonthlyYear,
    monthlyReport,
    isLoadingMonthly,
    fetchMonthlyReport,

    // Defaulters
    defaulterMonth,
    setDefaulterMonth,
    defaulterYear,
    setDefaulterYear,
    defaulterThreshold,
    setDefaulterThreshold,
    defaulters,
    isLoadingDefaulters,
    fetchDefaulters,

    // Student history
    historyStudents,
    isLoadingHistoryStudents,
    historyStudentId,
    setHistoryStudentId,
    historyRecords,
    historyPagination,
    isLoadingHistory,
    fetchStudentHistory,

    // Audit
    selectedAuditId,
    setSelectedAuditId,

    // Heatmap
    heatmapStudents,
    isLoadingHeatmapStudents,
    heatmapStudentId,
    setHeatmapStudentId,
    heatmapYear,
    setHeatmapYear,
    heatmapData,
    isLoadingHeatmap,
    fetchHeatmap,

    // Late Trend
    lateTrendMonth,
    setLateTrendMonth,
    lateTrendYear,
    setLateTrendYear,
    lateTrendData,
    isLoadingLateTrend,
    fetchLateTrend,

    // Export
    exportStartDate,
    setExportStartDate,
    exportEndDate,
    setExportEndDate,
    isExporting,
    exportAttendance,
  };
}
