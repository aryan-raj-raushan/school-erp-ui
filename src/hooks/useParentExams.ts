'use client';

import { useState, useEffect } from 'react';
import { ParentPortalService, ParentExamScheduleEntry, ParentReportCard } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';

export function useParentExamSchedule() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [items, setItems] = useState<ParentExamScheduleEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    ParentPortalService.getExamSchedule()
      .then((res) => {
        if (!cancelled) setItems(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load exam schedule');
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

export function useParentReportCards() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [items, setItems] = useState<ParentReportCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    ParentPortalService.getReportCards()
      .then((res) => {
        if (!cancelled) setItems(res);
      })
      .catch((err) => {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load report cards');
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
