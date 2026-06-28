'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { StaffAttendanceService, type StaffAttendanceRecord, type StaffMember } from '@/services/staff-attendance.service';

export type StaffReportTab = 'daily' | 'history';

export interface StaffDailyReport {
  staff: StaffMember[];
  records: StaffAttendanceRecord[];
  date: string;
}

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function useStaffAttendanceReports() {
  const [tab, setTab] = useState<StaffReportTab>('daily');
  const [date, setDate] = useState(todayISO());
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [records, setRecords] = useState<StaffAttendanceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  useEffect(() => {
    if (tab === 'daily') loadDailyReport();
  }, [tab, loadDailyReport]);

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

  return {
    tab,
    setTab,
    date,
    setDate,
    staff,
    records,
    isLoading,
    getStaffName,
    getRecordForStaff,
    presentCount,
    absentCount,
    lateCount,
    totalStaff,
  };
}
