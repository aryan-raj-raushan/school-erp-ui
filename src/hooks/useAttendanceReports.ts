"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { AttendanceService } from "@/services/attendance.service";
import { ClassesService, SectionsService } from "@/services/classes.service";
import type {
  DailyAttendanceReport,
  MonthlyAttendanceSummary,
  AttendanceDefaulter,
  AttendanceRecord,
  PaginationMeta,
  Section,
  Class,
  MonthlyAttendanceReport,
} from "@/types";

type ReportTab = "daily" | "monthly" | "defaulters" | "studentHistory";

function todayISO() {
  return new Date().toISOString().split("T")[0];
}

function currentMonth() {
  return new Date().getMonth() + 1;
}

function currentYear() {
  return new Date().getFullYear();
}

export function useAttendanceReports() {
  const [activeTab, setActiveTab] = useState<ReportTab>("daily");
  const [sections, setSections] = useState<Section[]>([]);
  const [isLoadingSections, setIsLoadingSections] = useState(false);

  const [classSection, setClassSection]= useState<Class[]>([]);
  const [isLoadingClassSection, setIsLoadingClassSection] = useState(false);


  // Daily
  const [dailySectionId, setDailySectionId] = useState("");
  const [dailyDate, setDailyDate] = useState(todayISO());
  const [dailyReport, setDailyReport] = useState<DailyAttendanceReport | null>(
    null,
  );
  const [isLoadingDaily, setIsLoadingDaily] = useState(false);

  // Monthly
  const [monthlySectionId, setMonthlySectionId] = useState("");
  const [monthlyMonth, setMonthlyMonth] = useState(currentMonth());
  const [monthlyYear, setMonthlyYear] = useState(currentYear());
  const [monthlyReport, setMonthlyReport] = useState<MonthlyAttendanceReport | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Defaulters
  const [defaulterSectionId, setDefaulterSectionId] = useState("");
  const [defaulterThreshold, setDefaulterThreshold] = useState(75);
  const [defaulters, setDefaulters] = useState<AttendanceDefaulter[]>([]);
  const [isLoadingDefaulters, setIsLoadingDefaulters] = useState(false);

  // Student history
  const [historyStudentId, setHistoryStudentId] = useState("");
  const [historyRecords, setHistoryRecords] = useState<AttendanceRecord[]>([]);
  const [historyPagination, setHistoryPagination] =
    useState<PaginationMeta | null>(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Export
  const [exportSectionId, setExportSectionId] = useState("");
  const [exportStartDate, setExportStartDate] = useState("");
  const [exportEndDate, setExportEndDate] = useState("");
  const [isExporting, setIsExporting] = useState(false);

  const fetchClasses = useCallback(async () => {
      setIsLoadingClassSection(true);
      try {
        const res = await ClassesService.list();
        setClassSection(res.items);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load classes",
        );
      } finally {
        setIsLoadingClassSection(false);
      }
    }, []);

  const fetchSections = useCallback(async () => {
    setIsLoadingSections(true);
    try {
      const res = await SectionsService.list({});
      setSections(res.items);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load sections",
      );
    } finally {
      setIsLoadingSections(false);
    }
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

  async function exportAttendance() {
    setIsExporting(true);
    try {
      const job = await AttendanceService.enqueueExport({
        ...(exportSectionId && { class_section_id: exportSectionId }),
        ...(exportStartDate && { start_date: exportStartDate }),
        ...(exportEndDate && { end_date: exportEndDate }),
        format: "xlsx",
      });
      toast.success(`Export job started — ID: ${job.jobId}`);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to start export",
      );
    } finally {
      setIsExporting(false);
    }
  }

  useEffect(() => {
    fetchSections();
  }, [fetchSections]);

    useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  return {
    activeTab,
    setActiveTab,
    classSection,
    sections,
    isLoadingSections,
    isLoadingClassSection,

    // Daily
    dailySectionId,
    setDailySectionId,
    dailyDate,
    setDailyDate,
    dailyReport,
    isLoadingDaily,
    fetchDailyReport,

    // Monthly
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
    defaulterSectionId,
    setDefaulterSectionId,
    defaulterThreshold,
    setDefaulterThreshold,
    defaulters,
    isLoadingDefaulters,
    fetchDefaulters,

    // Student history
    historyStudentId,
    setHistoryStudentId,
    historyRecords,
    historyPagination,
    isLoadingHistory,
    fetchStudentHistory,

    // Export
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
