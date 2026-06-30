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


  // Daily
  const [dailyClassId, setDailyClassId] = useState("");
  const [dailySectionId, setDailySectionId] = useState("");
  const [dailyDate, setDailyDate] = useState(todayISO());
  const [dailyReport, setDailyReport] = useState<DailyAttendanceReport | null>(
    null,
  );
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);

  // Monthly
  const [monthlyClassId, setMonthlyClassId] = useState("");
  const [monthlySectionId, setMonthlySectionId] = useState("");
  const [monthlyMonth, setMonthlyMonth] = useState(currentMonth());
  const [monthlyYear, setMonthlyYear] = useState(currentYear());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyAttendanceReport | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Defaulters
  const [defaulterClassId, setDefaulterClassId] = useState("");
  const [defaulterSectionId, setDefaulterSectionId] = useState("");
  const [defaulterThreshold, setDefaulterThreshold] = useState(75);
  const [defaulters, setDefaulters] = useState<AttendanceDefaulter[]>([]);
  const [isLoadingDefaulters, setIsLoadingDefaulters] = useState(false);

  // Student history
  const [historyClassId, setHistoryClassId] = useState("");
  const [historySectionId, setHistorySectionId] = useState("");
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
  const [heatmapClassId, setHeatmapClassId] = useState("");
  const [heatmapSectionId, setHeatmapSectionId] = useState("");
  const [heatmapStudents, setHeatmapStudents] = useState<Student[]>([]);
  const [isLoadingHeatmapStudents, setIsLoadingHeatmapStudents] = useState(false);
  const [heatmapStudentId, setHeatmapStudentId] = useState("");
  const [heatmapYear, setHeatmapYear] = useState(currentYear());
  const [heatmapData, setHeatmapData] = useState<HeatmapEntry[]>([]);
  const [isLoadingHeatmap, setIsLoadingHeatmap] = useState(false);

  // Late trend
  const [lateTrendClassId, setLateTrendClassId] = useState("");
  const [lateTrendSectionId, setLateTrendSectionId] = useState("");
  const [lateTrendMonth, setLateTrendMonth] = useState(currentMonth());
  const [lateTrendYear, setLateTrendYear] = useState(currentYear());
  const [lateTrendData, setLateTrendData] = useState<LateTrendEntry[]>([]);
  const [isLoadingLateTrend, setIsLoadingLateTrend] = useState(false);

  // Export
  const [exportClassId, setExportClassId] = useState("");
  const [exportSectionId, setExportSectionId] = useState("");
  const [exportStartDate, setExportStartDate] = useState(firstOfMonthISO);
  const [exportEndDate, setExportEndDate] = useState(todayISO);
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
    if (!dailySectionId) {
      toast.error("Select a section");
      return;
    }
    setIsLoadingDaily(true);
    try {
      const report = await AttendanceService.getDailyReport({
        class_section_id: dailySectionId,
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
    if (!monthlySectionId) {
      toast.error("Select a section");
      return;
    }
    setIsLoadingMonthly(true);
    try {
      const report = await AttendanceService.getMonthlyReport({
        class_section_id: monthlySectionId,
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
    setIsLoadingDefaulters(true);
    try {
      const data = await AttendanceService.getDefaulters({
        ...(defaulterSectionId && { class_section_id: defaulterSectionId }),
        ...(selectedAcademicYearId && { academic_year_id: selectedAcademicYearId }),
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
    if (!lateTrendSectionId) { toast.error('Select a section'); return; }
    setIsLoadingLateTrend(true);
    try {
      const data = await AttendanceService.getLateTrend(lateTrendSectionId, lateTrendMonth, lateTrendYear);
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
        ...(exportSectionId && { class_section_id: exportSectionId }),
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
    fetchHistoryStudents(historySectionId);
  }, [historySectionId, fetchHistoryStudents]);

  useEffect(() => {
    fetchHeatmapStudents(heatmapSectionId);
  }, [heatmapSectionId, fetchHeatmapStudents]);

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

    // Daily
    dailyClassId,
    setDailyClassId,
    dailySectionId,
    setDailySectionId,
    dailyDate,
    setDailyDate,
    dailyReport,
    isLoadingDaily,
    fetchDailyReport,

    // Monthly
    monthlyClassId,
    setMonthlyClassId,
    monthlySectionId,
    setMonthlySectionId,
    monthlyMonth,
    setMonthlyMonth,
    monthlyYear,
    setMonthlyYear,
    monthlyReport,
    isLoadingMonthly,
    fetchMonthlyReport,

    // Defaulters
    defaulterClassId,
    setDefaulterClassId,
    defaulterSectionId,
    setDefaulterSectionId,
    defaulterThreshold,
    setDefaulterThreshold,
    defaulters,
    isLoadingDefaulters,
    fetchDefaulters,

    // Student history
    historyClassId,
    setHistoryClassId,
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

    // Audit
    selectedAuditId,
    setSelectedAuditId,

    // Heatmap
    heatmapClassId,
    setHeatmapClassId,
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

    // Late Trend
    lateTrendClassId,
    setLateTrendClassId,
    lateTrendSectionId,
    setLateTrendSectionId,
    lateTrendMonth,
    setLateTrendMonth,
    lateTrendYear,
    setLateTrendYear,
    lateTrendData,
    isLoadingLateTrend,
    fetchLateTrend,

    // Export
    exportClassId,
    setExportClassId,
    exportSectionId,
    setExportSectionId,
    exportStartDate,
    setExportStartDate,
    exportEndDate,
    setExportEndDate,
    isExporting,
    exportAttendance,
  };
}
