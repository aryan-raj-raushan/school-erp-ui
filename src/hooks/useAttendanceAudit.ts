'use client';

import { useState, useEffect, useCallback } from 'react';
import { AttendanceService } from '@/services/attendance.service';
import type { AttendanceAuditEntry } from '@/types';

export function useAttendanceAudit(attendanceId: string | null) {
  const [log, setLog] = useState<AttendanceAuditEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchLog = useCallback(async () => {
    if (!attendanceId) { setLog([]); return; }
    setIsLoading(true);
    try {
      const data = await AttendanceService.getAuditLog(attendanceId);
      setLog(data);
    } finally {
      setIsLoading(false);
    }
  }, [attendanceId]);

  useEffect(() => { fetchLog(); }, [fetchLog]);

  return { log, isLoading, refresh: fetchLog };
}
