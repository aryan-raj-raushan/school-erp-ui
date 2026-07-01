'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { HomeworkService, type SubmissionEntry } from '@/services/homework.service';
import { ClassesService } from '@/services/classes.service';
import { SubjectsService, type Subject } from '@/services/subjects.service';
import { StudentsService } from '@/services/students.service';
import { useAcademicYears } from './useAcademicYears';
import { ROUTES } from '@/constants';
import type { Homework, HomeworkSubmission, Student, Class } from '@/types';

export function useHomework() {
  const router = useRouter();
  const { years, currentYear } = useAcademicYears();

  const [classes, setClasses] = useState<Class[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [submissionMap, setSubmissionMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) setSelectedAcademicYearId(currentYear.id);
  }, [currentYear, selectedAcademicYearId]);

  const loadInitialData = useCallback(async () => {
    try {
      const [clsRes, subRes] = await Promise.all([
        ClassesService.list({ limit: 100 }),
        SubjectsService.list({ limit: 100 }),
      ]);
      setClasses(clsRes.items);
      setSubjects(subRes.items);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => { loadInitialData(); }, [loadInitialData]);

  function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedSubjectId('');
    setHomeworkList([]);
  }

  const fetchHomework = useCallback(async () => {
    if (!selectedClassId || !selectedAcademicYearId) return;
    setIsLoading(true);
    try {
      const data = await HomeworkService.list({
        class_id: selectedClassId,
        subject_id: selectedSubjectId || undefined,
        academic_year_id: selectedAcademicYearId,
      });
      setHomeworkList(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load homework');
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassId, selectedSubjectId, selectedAcademicYearId]);

  useEffect(() => { fetchHomework(); }, [fetchHomework]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this homework?')) return;
    try {
      await HomeworkService.remove(id);
      toast.success('Homework deleted');
      await fetchHomework();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete');
    }
  }

  function goToNew() { router.push(ROUTES.homeworkNew); }
  function goToEdit(hw: Homework) { router.push(ROUTES.homeworkEdit(hw.id)); }

  async function openSubmissions(hw: Homework) {
    setSelectedHomework(hw);
    setShowSubmissionsModal(true);
    try {
      const [subs, studs] = await Promise.all([
        HomeworkService.getSubmissions(hw.id),
        StudentsService.list({ class_id: hw.class_id ?? undefined, limit: 100 }),
      ]);
      setSubmissions(subs);
      setStudents(studs.items);
      const map: typeof submissionMap = {};
      studs.items.forEach((s) => {
        const existing = subs.find((sub) => sub.student_id === s.id);
        map[s.id] = { status: existing?.status ?? 'PENDING', remarks: existing?.remarks ?? '' };
      });
      setSubmissionMap(map);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load submissions');
    }
  }

  function setSubmission(studentId: string, field: 'status' | 'remarks', value: string) {
    setSubmissionMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  async function saveSubmissions() {
    if (!selectedHomework) return;
    setIsSaving(true);
    try {
      const entries: SubmissionEntry[] = students.map((s) => ({
        student_id: s.id,
        status: (submissionMap[s.id]?.status ?? 'PENDING') as any,
        remarks: submissionMap[s.id]?.remarks || undefined,
      }));
      await HomeworkService.bulkMarkSubmissions(selectedHomework.id, entries);
      toast.success('Submissions saved');
      setShowSubmissionsModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save submissions');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years, currentYear,
    classes, subjects,
    selectedAcademicYearId, setSelectedAcademicYearId,
    selectedClassId,
    selectedSubjectId, setSelectedSubjectId,
    handleClassChange,
    homeworkList,
    isLoading,
    handleDelete,
    goToNew,
    goToEdit,
    students, submissions, submissionMap,
    selectedHomework,
    showSubmissionsModal, setShowSubmissionsModal,
    isSaving,
    openSubmissions,
    setSubmission,
    saveSubmissions,
  };
}
