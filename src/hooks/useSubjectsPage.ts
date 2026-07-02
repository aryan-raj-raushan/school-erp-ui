'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';

export function useSubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await SubjectsService.list({ limit: 100 });
      setSubjects(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);

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

  return {
    subjects, isLoading,
    removeSubject, navigateToNew, navigateToEdit,
  };
}
