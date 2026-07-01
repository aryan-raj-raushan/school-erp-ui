'use client';

import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';
import { ClassSubjectTeacherService } from '@/services/class-subject-teacher.service';
import { ClassesService } from '@/services/classes.service';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { StaffService } from '@/services/staff.service';
import { useAcademicYears } from './useAcademicYears';
import type { Class, Staff } from '@/types';

export function useClassSubjectTeacherMap() {
  const { years, currentYear } = useAcademicYears();

  const [academicYearId, setAcademicYearId] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [teachers, setTeachers] = useState<Staff[]>([]);
  const [teacherBySubject, setTeacherBySubject] = useState<Record<string, string>>({});
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentYear && !academicYearId) setAcademicYearId(currentYear.id);
  }, [currentYear, academicYearId]);

  const loadStaticData = useCallback(async () => {
    try {
      const [clsRes, subRes, teacherRes, classTeacherRes] = await Promise.all([
        ClassesService.list({ limit: 100 }),
        SubjectsService.list({ limit: 100 }),
        StaffService.list({ role: 'TEACHER', status: 'ACTIVE', limit: 100 }),
        StaffService.list({ role: 'CLASS_TEACHER', status: 'ACTIVE', limit: 100 }),
      ]);
      setClasses(clsRes.items);
      setSubjects(subRes.items);
      const merged = [...teacherRes.items, ...classTeacherRes.items];
      const uniqueById = Array.from(new Map(merged.map((t) => [t.id, t])).values());
      uniqueById.sort((a, b) => a.first_name.localeCompare(b.first_name));
      setTeachers(uniqueById);
    } catch {
      toast.error('Failed to load form data');
    }
  }, []);

  useEffect(() => { loadStaticData(); }, [loadStaticData]);

  const loadMapping = useCallback(async () => {
    if (!academicYearId || !classId) { setTeacherBySubject({}); return; }
    setIsLoadingData(true);
    try {
      const mappings = await ClassSubjectTeacherService.list({ academic_year_id: academicYearId, class_id: classId });
      const map: Record<string, string> = {};
      mappings.forEach((m) => { map[m.subject_id] = m.teacher_id; });
      setTeacherBySubject(map);
    } catch {
      toast.error('Failed to load subject-teacher mapping');
    } finally {
      setIsLoadingData(false);
    }
  }, [academicYearId, classId]);

  useEffect(() => { loadMapping(); }, [loadMapping]);

  function setTeacherForSubject(subjectId: string, teacherId: string) {
    setTeacherBySubject((prev) => {
      const next = { ...prev };
      if (teacherId) next[subjectId] = teacherId;
      else delete next[subjectId];
      return next;
    });
  }

  async function saveMapping() {
    if (!academicYearId || !classId) return;
    setIsSaving(true);
    try {
      const mappings = Object.entries(teacherBySubject).map(([subject_id, teacher_id]) => ({ subject_id, teacher_id }));
      await ClassSubjectTeacherService.replaceForClass({ academic_year_id: academicYearId, class_id: classId, mappings });
      toast.success('Subject-teacher mapping saved');
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save mapping');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years, academicYearId, setAcademicYearId,
    classes, classId, setClassId,
    subjects, teachers, teacherBySubject, setTeacherForSubject,
    isLoadingData, isSaving, saveMapping,
  };
}
