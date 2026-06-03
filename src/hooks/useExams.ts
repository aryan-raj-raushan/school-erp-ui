'use client';

import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ExamsService,
  ExamPolicyService,
  ExamTimetableService,
  ExamStudentsService,
  ExamRoomsService,
  ExamSeatingService,
  AdmitCardsService,
  ExamMarksService,
  type CreateExamPayload,
  type CreateExamPolicyPayload,
  type CreateTimetablePayload,
} from '@/services/exams.service';
import { ClassesService, SectionsService } from '@/services/classes.service';
import { StudentsService } from '@/services/students.service';
import { useAcademicYears } from './useAcademicYears';
import type {
  Exam,
  ExamPolicy,
  ExamTimetableEntry,
  ExamStudent,
  ExamRoom,
  ExamSeat,
  AdmitCard,
  ExamMark,
  Class,
  Section,
  Student,
} from '@/types';

// ─── Schemas ──────────────────────────────────────────────────────────────────

const examSchema = z.object({
  name: z.string().min(1, 'Name required'),
  description: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

const policySchema = z.object({
  name: z.string().min(1, 'Name required'),
  passing_marks: z.string().optional(),
  total_marks: z.string().optional(),
  marking_system: z.string().optional(),
  grace_marks: z.string().optional(),
});

const timetableSchema = z.object({
  exam_id: z.string().min(1, 'Exam required'),
  class_section_id: z.string().min(1, 'Section required'),
  subject_id: z.string().min(1, 'Subject required'),
  date: z.string().min(1, 'Date required'),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  room_number: z.string().optional(),
});

const roomSchema = z.object({
  room_name: z.string().min(1, 'Room name required'),
  capacity: z.string().min(1, 'Capacity required'),
});

export type ExamFormValues = z.infer<typeof examSchema>;
export type PolicyFormValues = z.infer<typeof policySchema>;
export type TimetableFormValues = z.infer<typeof timetableSchema>;
export type RoomFormValues = z.infer<typeof roomSchema>;

// ─── useExams ─────────────────────────────────────────────────────────────────

export function useExams() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [policies, setPolicies] = useState<ExamPolicy[]>([]);
  const [rooms, setRooms] = useState<ExamRoom[]>([]);
  const [examStudents, setExamStudents] = useState<ExamStudent[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingExam, setEditingExam] = useState<Exam | null>(null);
  const [showPolicyModal, setShowPolicyModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const addForm = useForm<ExamFormValues>({ resolver: zodResolver(examSchema) });
  const editForm = useForm<ExamFormValues>({ resolver: zodResolver(examSchema) });
  const policyForm = useForm<PolicyFormValues>({ resolver: zodResolver(policySchema) });
  const roomForm = useForm<RoomFormValues>({ resolver: zodResolver(roomSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, selectedAcademicYearId]);

  const fetchExams = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    setIsLoading(true);
    try {
      const data = await ExamsService.list(selectedAcademicYearId);
      setExams(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load exams');
    } finally {
      setIsLoading(false);
    }
  }, [selectedAcademicYearId]);

  const fetchPoliciesAndRooms = useCallback(async () => {
    if (!selectedExamId) { setPolicies([]); setRooms([]); return; }
    try {
      const [p, r, s] = await Promise.all([
        ExamPolicyService.list(selectedExamId),
        ExamRoomsService.list(selectedExamId),
        ExamStudentsService.list(selectedExamId),
      ]);
      setPolicies(p);
      setRooms(r);
      setExamStudents(s);
    } catch {
      // ignore
    }
  }, [selectedExamId]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  useEffect(() => { fetchPoliciesAndRooms(); }, [fetchPoliciesAndRooms]);

  function handleSelectExam(id: string) {
    setSelectedExamId(id);
  }

  function openEditModal(exam: Exam) {
    setEditingExam(exam);
    editForm.reset({
      name: exam.name,
      description: exam.description ?? '',
      start_date: exam.start_date ?? '',
      end_date: exam.end_date ?? '',
    });
    setShowEditModal(true);
  }

  async function handleCreate(values: ExamFormValues) {
    if (!selectedAcademicYearId) return;
    setIsSaving(true);
    try {
      await ExamsService.create({ ...values, academic_year_id: selectedAcademicYearId } as CreateExamPayload);
      toast.success('Exam created');
      addForm.reset();
      setShowAddModal(false);
      await fetchExams();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to create exam');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleEdit(values: ExamFormValues) {
    if (!editingExam) return;
    setIsSaving(true);
    try {
      await ExamsService.update(editingExam.id, values);
      toast.success('Exam updated');
      setShowEditModal(false);
      await fetchExams();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to update exam');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this exam?')) return;
    try {
      await ExamsService.remove(id);
      toast.success('Exam deleted');
      if (selectedExamId === id) setSelectedExamId('');
      await fetchExams();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete exam');
    }
  }

  async function handleAddPolicy(values: PolicyFormValues) {
    if (!selectedExamId) return;
    setIsSaving(true);
    try {
      await ExamPolicyService.create({
        exam_id: selectedExamId,
        name: values.name,
        ...(values.total_marks ? { total_marks: Number(values.total_marks) } : {}),
        ...(values.passing_marks ? { passing_marks: Number(values.passing_marks) } : {}),
        ...(values.grace_marks ? { grace_marks: Number(values.grace_marks) } : {}),
        ...(values.marking_system ? { marking_system: values.marking_system as 'MARKS' | 'GRADES' | 'PERCENTAGE' } : {}),
      });
      toast.success('Policy added');
      policyForm.reset();
      setShowPolicyModal(false);
      await fetchPoliciesAndRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add policy');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeletePolicy(id: string) {
    try {
      await ExamPolicyService.remove(id);
      toast.success('Policy deleted');
      await fetchPoliciesAndRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete policy');
    }
  }

  async function handleAddRoom(values: RoomFormValues) {
    if (!selectedExamId) return;
    setIsSaving(true);
    try {
      await ExamRoomsService.create({ exam_id: selectedExamId, room_name: values.room_name, capacity: Number(values.capacity) });
      toast.success('Room added');
      roomForm.reset();
      setShowRoomModal(false);
      await fetchPoliciesAndRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to add room');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteRoom(id: string) {
    try {
      await ExamRoomsService.remove(id);
      toast.success('Room removed');
      await fetchPoliciesAndRooms();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove room');
    }
  }

  const selectedExam = exams.find((e) => e.id === selectedExamId) ?? null;

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    selectedExam,
    handleSelectExam,
    policies,
    rooms,
    examStudents,
    isLoading,
    isSaving,
    showAddModal, setShowAddModal,
    showEditModal, setShowEditModal,
    showPolicyModal, setShowPolicyModal,
    showRoomModal, setShowRoomModal,
    showRegisterModal, setShowRegisterModal,
    addForm,
    editForm,
    policyForm,
    roomForm,
    handleCreate,
    handleEdit,
    handleDelete,
    openEditModal,
    handleAddPolicy,
    handleDeletePolicy,
    handleAddRoom,
    handleDeleteRoom,
  };
}

// ─── useExamTimetable ─────────────────────────────────────────────────────────

export function useExamTimetable() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [timetable, setTimetable] = useState<ExamTimetableEntry[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingEntry, setEditingEntry] = useState<ExamTimetableEntry | null>(null);

  const form = useForm<TimetableFormValues>({ resolver: zodResolver(timetableSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, selectedAcademicYearId]);

  const fetchExams = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const [examList, classList] = await Promise.all([
        ExamsService.list(selectedAcademicYearId),
        ClassesService.list({ academic_year_id: selectedAcademicYearId }),
      ]);
      setExams(examList);
      setClasses(classList.items);
    } catch {
      // ignore
    }
  }, [selectedAcademicYearId]);

  const fetchTimetable = useCallback(async () => {
    if (!selectedExamId) { setTimetable([]); return; }
    setIsLoading(true);
    try {
      const data = await ExamTimetableService.list(selectedExamId);
      setTimetable(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load timetable');
    } finally {
      setIsLoading(false);
    }
  }, [selectedExamId]);

  useEffect(() => { fetchExams(); }, [fetchExams]);
  useEffect(() => { fetchTimetable(); }, [fetchTimetable]);

  async function handleClassChange(classId: string) {
    setSections([]);
    setSubjects([]);
    if (!classId) return;
    try {
      const [secRes, subRes] = await Promise.all([
        SectionsService.list({ class_id: classId }),
        (await import('@/services/classes.service')).ClassesService.listSubjects(classId),
      ]);
      setSections(secRes.items);
      setSubjects(subRes);
    } catch {
      // ignore
    }
  }

  function openAddModal() {
    setEditingEntry(null);
    form.reset({ exam_id: selectedExamId });
    setShowModal(true);
  }

  function openEditEntry(entry: ExamTimetableEntry) {
    setEditingEntry(entry);
    form.reset({
      exam_id: entry.exam_id,
      class_section_id: entry.class_section_id,
      subject_id: entry.subject_id,
      date: entry.date,
      start_time: entry.start_time ?? '',
      end_time: entry.end_time ?? '',
      room_number: entry.room_number ?? '',
    });
    setShowModal(true);
  }

  async function handleSubmit(values: TimetableFormValues) {
    setIsSaving(true);
    try {
      if (editingEntry) {
        await ExamTimetableService.update(editingEntry.id, values);
        toast.success('Entry updated');
      } else {
        await ExamTimetableService.create(values as CreateTimetablePayload);
        toast.success('Entry added');
      }
      setShowModal(false);
      await fetchTimetable();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to save entry');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    try {
      await ExamTimetableService.remove(id);
      toast.success('Entry removed');
      await fetchTimetable();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to remove entry');
    }
  }

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    setSelectedExamId,
    timetable,
    classes,
    sections,
    subjects,
    isLoading,
    isSaving,
    showModal,
    setShowModal,
    editingEntry,
    form,
    handleClassChange,
    openAddModal,
    openEditEntry,
    handleSubmit,
    handleDelete,
  };
}

// ─── useAdmitCards ────────────────────────────────────────────────────────────

export function useAdmitCards() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [admitCards, setAdmitCards] = useState<AdmitCard[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [examStudents, setExamStudents] = useState<ExamStudent[]>([]);
  const [previewHtml, setPreviewHtml] = useState('');
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [currentYear, selectedAcademicYearId]);

  const fetchExamsAndClasses = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const [examList, classList] = await Promise.all([
        ExamsService.list(selectedAcademicYearId),
        ClassesService.list({ academic_year_id: selectedAcademicYearId }),
      ]);
      setExams(examList);
      setClasses(classList.items);
    } catch {
      // ignore
    }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchExamsAndClasses(); }, [fetchExamsAndClasses]);

  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedSectionId('');
    setAdmitCards([]);
    setSections([]);
    if (!classId) return;
    try {
      const res = await SectionsService.list({ class_id: classId });
      setSections(res.items);
    } catch {
      // ignore
    }
  }

  async function handleSectionChange(sectionId: string) {
    setSelectedSectionId(sectionId);
    setAdmitCards([]);
    if (!sectionId || !selectedExamId) return;
    setIsLoading(true);
    try {
      const [cards, studs, examStuds] = await Promise.all([
        AdmitCardsService.getClass(selectedExamId, sectionId),
        StudentsService.list({ section_id: sectionId, limit: 100 }),
        ExamStudentsService.list(selectedExamId),
      ]);
      setAdmitCards(cards);
      setStudents(studs.items);
      setExamStudents(examStuds);
    } catch {
      setAdmitCards([]);
    } finally {
      setIsLoading(false);
    }
  }

  async function generateForClass() {
    if (!selectedExamId || !selectedSectionId) return;
    setIsGenerating(true);
    try {
      const registered = examStudents.filter((es) =>
        students.some((s) => s.id === es.student_id)
      );
      const studentIds = registered.map((es) => es.student_id);
      if (studentIds.length === 0) {
        toast.error('No registered students in this section');
        return;
      }
      await AdmitCardsService.generateClass(selectedExamId, studentIds);
      toast.success(`Generated ${studentIds.length} hall tickets`);
      await handleSectionChange(selectedSectionId);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to generate');
    } finally {
      setIsGenerating(false);
    }
  }

  async function previewCard(studentId: string) {
    if (!selectedExamId) return;
    try {
      const html = await AdmitCardsService.preview(selectedExamId, studentId);
      setPreviewHtml(html);
      setShowPreviewModal(true);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load preview');
    }
  }

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    setSelectedExamId,
    classes,
    sections,
    selectedClassId,
    selectedSectionId,
    admitCards,
    students,
    examStudents,
    previewHtml,
    showPreviewModal,
    setShowPreviewModal,
    isLoading,
    isGenerating,
    handleClassChange,
    handleSectionChange,
    generateForClass,
    previewCard,
  };
}

// ─── useExamMarks ─────────────────────────────────────────────────────────────

export function useExamMarks() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState('');
  const [exams, setExams] = useState<Exam[]>([]);
  const [selectedExamId, setSelectedExamId] = useState('');
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<{ id: string; name: string }[]>([]);
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSectionId, setSelectedSectionId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [totalMarks, setTotalMarks] = useState(100);
  const [students, setStudents] = useState<Student[]>([]);
  const [existingMarks, setExistingMarks] = useState<ExamMark[]>([]);
  const [marksMap, setMarksMap] = useState<Record<string, { obtained: string; grade: string; absent: boolean }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) setSelectedAcademicYearId(currentYear.id);
  }, [currentYear, selectedAcademicYearId]);

  const fetchExamsAndClasses = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const [el, cl] = await Promise.all([
        ExamsService.list(selectedAcademicYearId),
        ClassesService.list({ academic_year_id: selectedAcademicYearId }),
      ]);
      setExams(el);
      setClasses(cl.items);
    } catch {
      // ignore
    }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchExamsAndClasses(); }, [fetchExamsAndClasses]);

  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedSectionId('');
    setSelectedSubjectId('');
    setSections([]);
    setSubjects([]);
    if (!classId) return;
    try {
      const [secRes, subRes] = await Promise.all([
        SectionsService.list({ class_id: classId }),
        (await import('@/services/classes.service')).ClassesService.listSubjects(classId),
      ]);
      setSections(secRes.items);
      setSubjects(subRes);
    } catch {
      // ignore
    }
  }

  const loadStudentsAndMarks = useCallback(async () => {
    if (!selectedSectionId || !selectedExamId || !selectedSubjectId) return;
    setIsLoading(true);
    try {
      const [studs, marks] = await Promise.all([
        StudentsService.list({ section_id: selectedSectionId, limit: 100 }),
        ExamMarksService.list(selectedExamId, selectedSectionId, selectedSubjectId),
      ]);
      setStudents(studs.items);
      setExistingMarks(marks);
      const map: typeof marksMap = {};
      studs.items.forEach((s) => {
        const existing = marks.find((m) => m.student_id === s.id);
        map[s.id] = {
          obtained: existing?.marks_obtained != null ? String(existing.marks_obtained) : '',
          grade: existing?.grade ?? '',
          absent: existing?.is_absent ?? false,
        };
      });
      setMarksMap(map);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to load marks');
    } finally {
      setIsLoading(false);
    }
  }, [selectedSectionId, selectedExamId, selectedSubjectId]);

  useEffect(() => { loadStudentsAndMarks(); }, [loadStudentsAndMarks]);

  function setMark(studentId: string, field: 'obtained' | 'grade' | 'absent', value: string | boolean) {
    setMarksMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  async function submitMarks() {
    if (!selectedExamId || !selectedSubjectId || !selectedSectionId) return;
    setIsSaving(true);
    try {
      const entries = students.map((s) => {
        const m = marksMap[s.id];
        return {
          student_id: s.id,
          marks_obtained: m.absent ? undefined : m.obtained ? Number(m.obtained) : undefined,
          grade: m.grade || undefined,
          is_absent: m.absent,
        };
      });
      await ExamMarksService.submitBulk({
        exam_id: selectedExamId,
        subject_id: selectedSubjectId,
        class_section_id: selectedSectionId,
        total_marks: totalMarks,
        entries,
      });
      toast.success('Marks submitted');
      await loadStudentsAndMarks();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Failed to submit marks');
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    exams,
    selectedExamId,
    setSelectedExamId,
    classes,
    sections,
    subjects,
    selectedClassId,
    selectedSectionId,
    setSelectedSectionId,
    selectedSubjectId,
    setSelectedSubjectId,
    totalMarks,
    setTotalMarks,
    students,
    marksMap,
    isLoading,
    isSaving,
    handleClassChange,
    setMark,
    submitMarks,
  };
}
