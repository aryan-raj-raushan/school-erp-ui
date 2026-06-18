'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import {
  StaffAttendanceService,
  type StaffMember,
  type StaffAttendanceRecord,
} from '@/services/staff-attendance.service';

type AttendanceMap = Record<string, { status?: 'PRESENT' | 'ABSENT'; is_late: boolean; remarks: string; existingId?: string }>;

function todayISO() {
  return new Date().toISOString().split('T')[0];
}

export function useStaffAttendance() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<AttendanceMap>({});
  const [date, setDate] = useState(todayISO());
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingAttendance, setIsLoadingAttendance] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const fetchStaff = useCallback(async () => {
    setIsLoadingStaff(true);
    try {
      const data = await StaffAttendanceService.getStaff();
      setStaff(data);
    } catch {
      toast.error('Failed to load staff');
    } finally {
      setIsLoadingStaff(false);
    }
  }, []);

  const fetchAttendance = useCallback(async () => {
    setIsLoadingAttendance(true);
    try {
      const records = await StaffAttendanceService.getByDate(date);
      setAttendanceMap((prev) => {
        const next = { ...prev };
        records.forEach((r: StaffAttendanceRecord) => {
          next[r.staff_id] = {
            status: r.status as 'PRESENT' | 'ABSENT',
            is_late: r.is_late,
            remarks: r.remarks ?? '',
            existingId: r.id,
          };
        });
        return next;
      });
    } catch {
      toast.error('Failed to load attendance');
    } finally {
      setIsLoadingAttendance(false);
    }
  }, [date]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  useEffect(() => {
    setAttendanceMap({});
    fetchAttendance();
  }, [date, fetchAttendance]);

  function setStatus(staffId: string, status: 'PRESENT' | 'ABSENT') {
    setAttendanceMap((prev) => ({ ...prev, [staffId]: { ...prev[staffId], status, is_late: prev[staffId]?.is_late ?? false, remarks: prev[staffId]?.remarks ?? '' } }));
  }

  function setLate(staffId: string, is_late: boolean) {
    setAttendanceMap((prev) => ({ ...prev, [staffId]: { ...prev[staffId], is_late, remarks: prev[staffId]?.remarks ?? '' } }));
  }

  function setRemarks(staffId: string, remarks: string) {
    setAttendanceMap((prev) => ({ ...prev, [staffId]: { ...prev[staffId], remarks, is_late: prev[staffId]?.is_late ?? false } }));
  }

  function markAll(status: 'PRESENT' | 'ABSENT') {
    setAttendanceMap((prev) => {
      const next = { ...prev };
      staff.forEach((s) => {
        next[s.id] = { ...next[s.id], status, is_late: next[s.id]?.is_late ?? false, remarks: next[s.id]?.remarks ?? '' };
      });
      return next;
    });
  }

  async function saveAttendance() {
    const unmarked = staff.filter((s) => !attendanceMap[s.id]?.status);
    if (unmarked.length > 0) {
      toast.error(`${unmarked.length} staff not marked`);
      return;
    }
    setIsSaving(true);
    try {
      const entries = staff.map((s) => ({
        staff_id: s.id,
        status: attendanceMap[s.id].status!,
        is_late: attendanceMap[s.id].is_late ?? false,
        ...(attendanceMap[s.id].remarks ? { remarks: attendanceMap[s.id].remarks } : {}),
      }));
      await StaffAttendanceService.mark(date, entries);
      toast.success('Staff attendance saved');
      await fetchAttendance();
    } catch {
      toast.error('Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  }

  const presentCount = staff.filter((s) => attendanceMap[s.id]?.status === 'PRESENT').length;
  const absentCount = staff.filter((s) => attendanceMap[s.id]?.status === 'ABSENT').length;

  return {
    staff, attendanceMap, date, setDate,
    isLoadingStaff, isLoadingAttendance, isSaving,
    setStatus, setLate, setRemarks, markAll, saveAttendance,
    presentCount, absentCount,
  };
}
