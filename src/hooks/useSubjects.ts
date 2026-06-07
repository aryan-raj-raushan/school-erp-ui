'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { ROUTES } from '@/constants';
import type { PaginationMeta } from '@/types';

export function useSubjects(filters: { timetable_session_id?: string; class_id?: string; class_detail_id?: string } = {}) {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await SubjectsService.list({ limit: 100, ...filters });
      setSubjects(result.items);
      setPagination(result.pagination);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.timetable_session_id, filters.class_id, filters.class_detail_id]);

  async function removeSubject(id: string) {
    try {
      await SubjectsService.remove(id);
      toast.success('Subject deleted');
      await fetchSubjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete subject');
    }
  }

  function navigateToNew() { router.push(ROUTES.subjectNew); }
  function navigateToEdit(id: string) { router.push(ROUTES.subjectEdit(id)); }

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

  return { subjects, pagination, isLoading, removeSubject, navigateToNew, navigateToEdit, refetch: fetchSubjects };
}
