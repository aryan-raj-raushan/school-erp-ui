'use client';

import { useState, useEffect } from 'react';
import { ParentPortalService, ParentProfile } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';

export function useParentProfile() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [profile, setProfile] = useState<ParentProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    ParentPortalService.getProfile()
      .then((res) => { if (!cancelled) setProfile(res); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load profile'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeStudentId]);

  return { profile, isLoading, error };
}
