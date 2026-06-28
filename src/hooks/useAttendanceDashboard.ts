'use client';

import { useState, useEffect } from 'react';
import { AttendanceService } from '@/services/attendance.service';
import type { AttendanceDashboardStats } from '@/types';

export function useAttendanceDashboard() {
  const [stats, setStats] = useState<AttendanceDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      try {
        const data = await AttendanceService.getTodayDashboard();
        setStats(data);
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return { stats, isLoading };
}
