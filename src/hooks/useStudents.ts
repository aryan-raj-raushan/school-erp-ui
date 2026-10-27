'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { toast } from 'sonner';
import { StudentsService, type StudentFilters } from '@/services/students.service';
import type { Student, PaginationMeta } from '@/types';

export function useStudents(initialFilters: StudentFilters = {}) {
  const [students, setStudents] = useState<Student[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [filters, setFilters] = useState(initialFilters);
  const [searchInput, setSearchInput] = useState(initialFilters.search ?? '');
  const [isLoading, setIsLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchStudents = useCallback(async (overrideFilters?: StudentFilters) => {
    setIsLoading(true);
    try {
      const result = await StudentsService.list(overrideFilters ?? filters);
      setStudents(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load students');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  // Debounced search: non-search filters apply immediately, search debounced 400ms
  function updateFilters(next: Partial<StudentFilters>) {
    if ('search' in next) {
      const val = next.search ?? '';
      setSearchInput(val);
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, search: val || undefined, page: 1 }));
      }, 400);
    } else {
      setFilters((prev) => ({ ...prev, ...next }));
    }
  }

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  return {
    students, pagination, filters, searchInput, isLoading,
    updateFilters,
    refetch: fetchStudents,
  };
}
