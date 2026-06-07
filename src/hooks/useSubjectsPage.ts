'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { ClassesService } from '@/services/classes.service';
import { ClassDetailsService, type ClassDetail } from '@/services/class-details.service';
import { TimetableSessionsService } from '@/services/timetable-sessions.service';
import { useRouter } from 'next/navigation';
import { ROUTES } from '@/constants';
import type { Class, PaginationMeta } from '@/types';
import type { TimetableSession } from '@/services/timetable-sessions.service';

export function useSubjectsPage() {
  const router = useRouter();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [sessions, setSessions] = useState<TimetableSession[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetail[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [filterSessionId, setFilterSessionId] = useState('');
  const [filterClassId, setFilterClassId] = useState('');
  const [filterClassDetailId, setFilterClassDetailId] = useState('');

  const fetchStaticData = useCallback(async () => {
    try {
      const [sessRes, clsRes] = await Promise.all([
        TimetableSessionsService.list({ limit: 100 }),
        ClassesService.list({ limit: 100 }),
      ]);
      setSessions(sessRes.items);
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
        timetable_session_id: filterSessionId || undefined,
        class_id: filterClassId || undefined,
        class_detail_id: filterClassDetailId || undefined,
      });
      setSubjects(res.items);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load subjects');
    } finally {
      setIsLoading(false);
    }
  }, [filterSessionId, filterClassId, filterClassDetailId]);

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

  function getClassName(classId?: string | null) {
    return classes.find((c) => c.id === classId)?.name ?? '—';
  }

  return {
    subjects, sessions, classes, classDetails, isLoading,
    filterSessionId, setFilterSessionId,
    filterClassId, setFilterClassId,
    filterClassDetailId, setFilterClassDetailId,
    removeSubject, navigateToNew, navigateToEdit, getClassName,
  };
}
