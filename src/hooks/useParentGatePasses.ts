'use client';

import { useState, useEffect } from 'react';
import { ParentPortalService, ParentGatePass, ParentMovement } from '@/services/parent-portal.service';
import { useParentStore } from '@/store/parent.store';

export function useParentGatePasses() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [items, setItems] = useState<ParentGatePass[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    ParentPortalService.getGatePasses()
      .then((res) => { if (!cancelled) setItems(res); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load gate passes'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeStudentId]);

  return { items, isLoading, error };
}

export function useParentMovements() {
  const activeStudentId = useParentStore((s) => s.activeStudentId);
  const [items, setItems] = useState<ParentMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activeStudentId) return;
    let cancelled = false;
    setIsLoading(true);
    ParentPortalService.getMovements()
      .then((res) => { if (!cancelled) setItems(res); })
      .catch((err) => { if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load movements'); })
      .finally(() => { if (!cancelled) setIsLoading(false); });
    return () => { cancelled = true; };
  }, [activeStudentId]);

  return { items, isLoading, error };
}
