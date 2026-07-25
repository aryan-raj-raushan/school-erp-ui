'use client';

import { useState, useEffect } from 'react';
import { ParentPortalService, ParentHomeworkItem } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';

export function useParentHomework() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [items, setItems] = useState<ParentHomeworkItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    ParentPortalService.getHomework()
      .then((res) => {
        if (!cancelled) setItems(res as ParentHomeworkItem[]);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load homework');
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [activeStudentId]);

  return { items, isLoading, error };
}
