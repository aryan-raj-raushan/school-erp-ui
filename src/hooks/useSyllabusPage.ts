'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { SyllabusService, type Syllabus } from '@/services/syllabus.service';
import { ClassesService } from '@/services/classes.service';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

export function useSyllabusPage() {
  const router = useRouter();
  const [syllabi, setSyllabi] = useState<Syllabus[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterClassId, setFilterClassId] = useState('');

  const fetchStaticData = useCallback(async () => {
    try {
      const clsRes = await ClassesService.list({ limit: 100 });
      setClasses(clsRes.items);
    } catch { /* ignore */ }
  }, []);

  const fetchSyllabi = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await SyllabusService.list({
        limit: 100,
        class_id: filterClassId || undefined,
      });
      setSyllabi(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load syllabi');
    } finally { setIsLoading(false); }
  }, [filterClassId]);

  useEffect(() => { fetchStaticData(); }, [fetchStaticData]);
  useEffect(() => { fetchSyllabi(); }, [fetchSyllabi]);

  async function removeSyllabus(id: string) {
    try {
      await SyllabusService.remove(id);
      toast.success('Syllabus deleted');
      await fetchSyllabi();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete syllabus');
    }
  }

  function getClassName(classId?: string | null) {
    return classes.find((c) => c.id === classId)?.name ?? '—';
  }

  function navigateToNew() { router.push(ROUTES.syllabusNew); }
  function navigateToEdit(id: string) { router.push(ROUTES.syllabusEdit(id)); }

  return {
    syllabi, classes, isLoading,
    filterClassId, setFilterClassId,
    removeSyllabus, navigateToNew, navigateToEdit,
    getClassName,
  };
}
