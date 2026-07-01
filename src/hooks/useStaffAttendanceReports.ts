'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { StaffAttendanceService, type StaffAttendanceRecord, type StaffMember } from '@/services/staff-attendance.service';

export type StaffReportTab = 'daily' | 'monthly' | 'history';

export interface StaffDailyReport {
  staff: StaffMember[];
  records: StaffAttendanceRecord[];
  date: string;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

function firstOfMonthISO() {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().split('T')[0];
}

function currentMonth() {
  return new Date().getMonth() + 1;
}

function currentYear() {
  return new Date().getFullYear();
}

export function useStaffAttendanceReports() {
  const [tab, setTab] = useState<StaffReportTab>('daily');
  const [date, setDate] = useState(todayISO());
  const [month, setMonth] = useState(currentMonth());
  const [year, setYear] = useState(currentYear());
  const [roleFilter, setRoleFilter] = useState('');
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [monthlyRecords, setMonthlyRecords] = useState<StaffAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportStartDate, setExportStartDate] = useState(firstOfMonthISO());
  const [exportEndDate, setExportEndDate] = useState(todayISO());

  const loadStaff = useCallback(async () => {
    try {
      const data = await StaffAttendanceService.getStaff();
      setStaff(data);
    } catch {
      toast.error('Failed to load staff list');
    }
  }, []);

  const loadDailyReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StaffAttendanceService.getByDate(date);
      setRecords(data);
    } catch {
      toast.error('Failed to load daily attendance report');
    } finally {
      setIsLoading(false);
    }
  }, [date]);

  const loadMonthlyReport = useCallback(async () => {
    setIsLoading(true);
    try {
      const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
      const endDate = new Date(year, month, 0).toISOString().split('T')[0];
      const data = await StaffAttendanceService.getDateRange(startDate, endDate);
      setMonthlyRecords(data);
    } catch {
      toast.error('Failed to load monthly report');
    } finally {
      setIsLoading(false);
    }
  }, [month, year]);

  const exportAttendance = useCallback(async () => {
    setIsExporting(true);
    try {
      const buffer = await StaffAttendanceService.exportToFile({
        start_date: exportStartDate,
        end_date: exportEndDate,
        role: roleFilter || undefined,
        format: 'xlsx',
      });
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `staff_attendance_${exportStartDate}_to_${exportEndDate}.xlsx`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success('Staff attendance exported successfully');
    } catch {
      toast.error('Failed to export attendance');
    } finally {
      setIsExporting(false);
    }
  }, [exportStartDate, exportEndDate, roleFilter]);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    if (tab === 'daily') loadDailyReport();
    if (tab === 'monthly') loadMonthlyReport();
  }, [tab, loadDailyReport, loadMonthlyReport]);

  const getStaffName = useCallback(
    (staffId: string) => {
      const s = staff.find((m) => m.id === staffId);
      return s ? `${s.first_name} ${s.last_name ?? ''}`.trim() : staffId;
    },
    [staff],
  );

  const getRecordForStaff = useCallback(
    (staffId: string): StaffAttendanceRecord | undefined => records.find((r) => r.staff_id === staffId),
    [records],
  );

  const presentCount = records.filter((r) => r.status === 'PRESENT' || r.status === 'LATE').length;
  const absentCount = records.filter((r) => r.status === 'ABSENT').length;
  const lateCount = records.filter((r) => r.is_late).length;
  const totalStaff = staff.length;

  const getFilteredStaff = () => {
    if (!roleFilter) return staff;
    return staff.filter((s) => s.role === roleFilter);
  };

  const roles = Array.from(new Set(staff.map((s) => s.role).filter(Boolean)));

  return {
    tab,
    setTab,
    date,
    setDate,
    month,
    setMonth,
    year,
    setYear,
    roleFilter,
    setRoleFilter,
    roles,
    staff,
    records,
    monthlyRecords,
    isLoading,
    isExporting,
    exportStartDate,
    setExportStartDate,
    exportEndDate,
    setExportEndDate,
    getStaffName,
    getRecordForStaff,
    getFilteredStaff,
    presentCount,
    absentCount,
    lateCount,
    totalStaff,
    exportAttendance,
    loadMonthlyReport,
  };
}
