'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SchoolsService, type SchoolFilters, type CreateSchoolPayload } from '@/services/schools.service';
import type { PaginationMeta, School } from '@/types';

export function useSchools(initialFilters: SchoolFilters = {}) {
  const [schools, setSchools] = useState<School[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState<SchoolFilters>(initialFilters);
  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const fetchSchools = useCallback(async (overrideFilters?: SchoolFilters) => {
    setIsLoading(true);
    try {
      const result = await SchoolsService.list(overrideFilters ?? filters);
      setSchools(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load schools');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  async function createSchool(payload: CreateSchoolPayload): Promise<School> {
    setIsCreating(true);
    try {
      const school = await SchoolsService.create(payload);
      toast.success(`${school.name} created`);
      await fetchSchools();
      return school;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Failed to create school';
      toast.error(message);
      throw err;
    } finally {
      setIsCreating(false);
    }
  }

  function updateFilters(next: Partial<SchoolFilters>) {
    setFilters((prev) => ({ ...prev, ...next }));
  }

  useEffect(() => { fetchSchools(); }, [fetchSchools]);

  return { schools, pagination, filters, isLoading, isCreating, fetchSchools, createSchool, updateFilters };
}
