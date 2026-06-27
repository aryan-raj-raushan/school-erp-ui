'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { ClassesService } from '@/services/classes.service';
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import type { Class } from '@/types';

export function useSubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterClassId, setFilterClassId] = useState('');
  const [filterClassDetailId, setFilterClassDetailId] = useState('');

  const fetchStaticData = useCallback(async () => {
    try {
      const clsRes = await ClassesService.list({ limit: 100 });
      setClasses(clsRes.items);
    } catch { /* ignore */ }
  }, []);

  const fetchClassDetails = useCallback(async (classId: string) => {
    if (!classId) { setClassDetails([]); return; }
    try {
      const res = await ClassDetailsService.list({ class_id: classId, limit: 100 });
      setClassDetails(res.items);
    } catch { /* ignore */ }
  }, []);

  const fetchSubjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await SubjectsService.list({
        limit: 100,
        class_id: filterClassId || undefined,
        class_detail_id: filterClassDetailId || undefined,
      });
      setSubjects(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, [filterClassId, filterClassDetailId]);

  useEffect(() => { fetchStaticData(); }, [fetchStaticData]);
  useEffect(() => { fetchSubjects(); }, [fetchSubjects]);
  useEffect(() => { fetchClassDetails(filterClassId); setFilterClassDetailId(''); }, [filterClassId, fetchClassDetails]);

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

  function getClassNames(classIds: string[]): string {
    if (!classIds.length) return '—';
    return classIds.map((id) => classes.find((c) => c.id === id)?.name ?? id).join(', ');
  }

  return {
    subjects, classes, classDetails, isLoading,
    filterClassId, setFilterClassId,
    filterClassDetailId, setFilterClassDetailId,
    removeSubject, navigateToNew, navigateToEdit, getClassNames,
  };
}
