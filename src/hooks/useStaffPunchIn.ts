'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Geolocation } from '@capacitor/geolocation';
import { StaffAttendanceService, type PunchInLocation, type StaffAttendanceRecord } from '@/services/staff-attendance.service';
import { isNativeApp } from '@/lib/platform';
import { errorMessage } from '@/lib/api-error';
import { useAuthStore } from '@/store/auth.store';
import { AuthContext } from '@/types';

const STAFF_ROLES = ['SCHOOL_ADMIN', 'PRINCIPAL', 'VICE_PRINCIPAL', 'TEACHER', 'CLASS_TEACHER', 'ACCOUNTANT', 'LIBRARIAN', 'OTHER'];
const LOCATION_TIMEOUT_MS = 15000;

async function currentLocation(): Promise<PunchInLocation> {
  if (isNativeApp()) {
    const permission = await Geolocation.requestPermissions({ permissions: ['location'] });
    if (permission.location === 'denied') {
      throw new Error('Location permission is off — allow location for this app to punch in');
    }
    const position = await Geolocation.getCurrentPosition({ enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS });
    return { latitude: position.coords.latitude, longitude: position.coords.longitude, accuracy: position.coords.accuracy };
  }
  if (!navigator.geolocation) throw new Error('This browser cannot share your location');
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        }),
      (error) =>
        reject(
          new Error(
            error.code === error.PERMISSION_DENIED
              ? 'Location permission is blocked — allow location in your browser to punch in'
              : 'Could not get your location — move to an open area and try again',
          ),
        ),
      { enableHighAccuracy: true, timeout: LOCATION_TIMEOUT_MS },
    );
  });
}

export function useStaffPunchIn() {
  const context = useAuthStore((s) => s.context);
  const role = useAuthStore((s) => s.user?.role);
  const canPunch = context === AuthContext.SCHOOL && !!role && STAFF_ROLES.includes(role);

  const [today, setToday] = useState<StaffAttendanceRecord | null>(null);
  const [isLoading, setIsLoading] = useState(canPunch);
  const [isPunching, setIsPunching] = useState(false);

  useEffect(() => {
    if (!canPunch) return;
    let active = true;
    StaffAttendanceService.getMyToday()
      .then((record) => active && setToday(record))
      .catch(() => undefined)
      .finally(() => active && setIsLoading(false));
    return () => {
      active = false;
    };
  }, [canPunch]);

  async function punchIn() {
    setIsPunching(true);
    try {
      const location = await currentLocation();
      const record = await StaffAttendanceService.punchIn(location);
      setToday(record);
      toast.success(record.is_late ? 'Punched in — marked late' : 'Punched in — have a good day!');
    } catch (err) {
      toast.error(errorMessage(err, 'Could not punch in'));
    } finally {
      setIsPunching(false);
    }
  }

  return { canPunch, today, isLoading, isPunching, punchIn };
}
