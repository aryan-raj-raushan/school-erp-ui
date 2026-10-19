'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { toast } from 'sonner';
import { StudentsService, type GuardianRow } from '@/services/students-v2.service';

export interface GuardianFilters {
  search?: string;
  relation?: string;
  is_primary?: string;
  can_pickup?: string;
}

/**
 * Guardians are created together with their student, so this hook only
 * lists, filters and removes them.
 */
export function useParents(initialFilters: GuardianFilters = {}) {
  const [parents, setParents] = useState<GuardianRow[]>([]);
  const [filters, setFilters] = useState<GuardianFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);

  const fetchParents = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await StudentsService.listAllGuardians({ search: filters.search });
      setParents(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load guardians');
    } finally {
      setIsLoading(false);
    }
  }, [filters.search]);

  useEffect(() => {
    // Fetch-on-filter-change: state updates happen after the request resolves.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchParents();
  }, [fetchParents]);

  async function deleteParent(id: string) {
    try {
      await StudentsService.removeGuardian(id);
      toast.success('Guardian removed');
      setParents((prev) => prev.filter((p) => p.id !== id));
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove');
    }
  }

  function updateFilters(next: Partial<GuardianFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  // Relation/primary/pickup filters apply client-side — the list endpoint only supports `search`
  const filteredParents = useMemo(
    () =>
      parents.filter((p) => {
        if (filters.relation && p.relation !== filters.relation) return false;
        if (filters.is_primary && String(p.is_primary) !== filters.is_primary) return false;
        if (filters.can_pickup && String(p.can_pickup) !== filters.can_pickup) return false;
        return true;
      }),
    [parents, filters.relation, filters.is_primary, filters.can_pickup],
  );

  return {
    parents: filteredParents,
    total: filteredParents.length,
    filters,
    isLoading,
    deleteParent,
    updateFilters,
    refetch: fetchParents,
  };
}
