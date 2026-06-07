"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  HomeworkService,
  type CreateHomeworkPayload,
  type SubmissionEntry,
} from "@/services/homework.service";
import { ClassesService } from "@/services/classes.service";
import { StudentsService } from "@/services/students.service";
import { UploadsService } from "@/services/uploads.service";
import { SubjectsService, type Subject } from "@/services/subjects.service";
import { useAcademicYears } from "./useAcademicYears";
import type {
  Homework,
  HomeworkSubmission,
  Student,
  Class,
  Section,
  PaginationMeta,
} from "@/types";

const hwSchema = z.object({
  title: z.string().min(1, "Title required"),
  description: z.string().optional(),
  due_date: z.string().min(1, "Due date required"),
  attachment_url: z.string().optional(),
});

export type HomeworkFormValues = z.infer<typeof hwSchema>;

export function useHomework() {
  const { years, currentYear } = useAcademicYears();
  const [selectedAcademicYearId, setSelectedAcademicYearId] = useState("");

  const [classes, setClasses] = useState<Class[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedClassSectionId, setSelectedClassSectionId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");

  const [homeworkList, setHomeworkList] = useState<Homework[]>([]);
  const [selectedHomework, setSelectedHomework] = useState<Homework | null>(null);
  const [submissions, setSubmissions] = useState<HomeworkSubmission[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [submissionMap, setSubmissionMap] = useState<Record<string, { status: string; remarks: string }>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showSubmissionsModal, setShowSubmissionsModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fileRef = useRef<HTMLInputElement>(null);
  const form = useForm<HomeworkFormValues>({ resolver: zodResolver(hwSchema) });

  useEffect(() => {
    if (currentYear && !selectedAcademicYearId) setSelectedAcademicYearId(currentYear.id);
  }, [currentYear, selectedAcademicYearId]);

  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYearId) return;
    try {
      const res = await ClassesService.list({ academic_year_id: selectedAcademicYearId });
      setClasses(res.items);
      setAllSections(res.sections);
    } catch { /* ignore */ }
  }, [selectedAcademicYearId]);

  useEffect(() => { fetchClasses(); }, [fetchClasses]);

  async function handleClassChange(classId: string) {
    setSelectedClassId(classId);
    setSelectedClassSectionId("");
    setSelectedSubjectId("");
    setSections(classId ? allSections.filter((s) => s.class_id === classId) : []);
    setSubjects([]);
    setHomeworkList([]);
    if (!classId) return;
    try {
      const res = await SubjectsService.list({ class_id: classId, limit: 100 });
      setSubjects(res.items);
    } catch { /* ignore */ }
  }

  function handleSectionChange(sectionId: string) {
    setSelectedClassSectionId(sectionId);
    setSelectedSubjectId("");
    setHomeworkList([]);
  }

  const fetchHomework = useCallback(async () => {
    if (!selectedClassSectionId || !selectedAcademicYearId) return;
    setIsLoading(true);
    try {
      const data = await HomeworkService.list({
        class_section_id: selectedClassSectionId,
        subject_id: selectedSubjectId || undefined,
        academic_year_id: selectedAcademicYearId,
      });
      setHomeworkList(data);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load homework");
    } finally {
      setIsLoading(false);
    }
  }, [selectedClassSectionId, selectedSubjectId, selectedAcademicYearId]);

  useEffect(() => { fetchHomework(); }, [fetchHomework]);

  function openAddModal() {
    setEditingId(null);
    form.reset({ title: "", description: "", due_date: "", attachment_url: "" });
    setShowModal(true);
  }

  function openEditModal(hw: Homework) {
    setEditingId(hw.id);
    form.reset({
      title: hw.title,
      description: hw.description ?? "",
      due_date: hw.due_date,
      attachment_url: hw.attachment_url ?? "",
    });
    setShowModal(true);
  }

  async function uploadAttachment(): Promise<string | undefined> {
    const file = fileRef.current?.files?.[0];
    if (!file) return undefined;
    setIsUploading(true);
    try {
      const result = await UploadsService.uploadDocument(file);
      return result.url;
    } catch {
      toast.error("Failed to upload attachment");
      return undefined;
    } finally {
      setIsUploading(false);
    }
  }

  async function handleSubmit(values: HomeworkFormValues) {
    if (!selectedClassSectionId || !selectedAcademicYearId) {
      toast.error("Select section first");
      return;
    }
    setIsSaving(true);
    try {
      let attachmentUrl = values.attachment_url;
      if (fileRef.current?.files?.length) attachmentUrl = await uploadAttachment();
      const payload: CreateHomeworkPayload = {
        academic_year_id: selectedAcademicYearId,
        class_section_id: selectedClassSectionId,
        subject_id: selectedSubjectId || undefined,
        title: values.title,
        description: values.description,
        due_date: values.due_date,
        attachment_url: attachmentUrl,
      };
      if (editingId) {
        await HomeworkService.update(editingId, payload);
        toast.success("Homework updated");
      } else {
        await HomeworkService.create(payload);
        toast.success("Homework assigned");
      }
      setShowModal(false);
      await fetchHomework();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this homework?")) return;
    try {
      await HomeworkService.remove(id);
      toast.success("Homework deleted");
      await fetchHomework();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function openSubmissions(hw: Homework) {
    setSelectedHomework(hw);
    setShowSubmissionsModal(true);
    try {
      const [subs, studs] = await Promise.all([
        HomeworkService.getSubmissions(hw.id),
        StudentsService.list({ section_id: hw.class_section_id, limit: 100 }),
      ]);
      setSubmissions(subs);
      setStudents(studs.items);
      const map: typeof submissionMap = {};
      studs.items.forEach((s) => {
        const existing = subs.find((sub) => sub.student_id === s.id);
        map[s.id] = { status: existing?.status ?? "PENDING", remarks: existing?.remarks ?? "" };
      });
      setSubmissionMap(map);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to load submissions");
    }
  }

  function setSubmission(studentId: string, field: "status" | "remarks", value: string) {
    setSubmissionMap((prev) => ({ ...prev, [studentId]: { ...prev[studentId], [field]: value } }));
  }

  async function saveSubmissions() {
    if (!selectedHomework) return;
    setIsSaving(true);
    try {
      const entries: SubmissionEntry[] = students.map((s) => ({
        student_id: s.id,
        status: (submissionMap[s.id]?.status ?? "PENDING") as any,
        remarks: submissionMap[s.id]?.remarks || undefined,
      }));
      await HomeworkService.bulkMarkSubmissions(selectedHomework.id, entries);
      toast.success("Submissions saved");
      setShowSubmissionsModal(false);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save submissions");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    classes,
    sections,
    subjects,
    selectedClassId,
    selectedClassSectionId,
    selectedSubjectId,
    setSelectedSubjectId,
    handleClassChange,
    handleSectionChange,
    homeworkList,
    selectedHomework,
    students,
    submissions,
    submissionMap,
    isLoading,
    isSaving,
    isUploading,
    showModal,
    setShowModal,
    showSubmissionsModal,
    setShowSubmissionsModal,
    editingId,
    form,
    fileRef,
    openAddModal,
    openEditModal,
    handleSubmit,
    handleDelete,
    openSubmissions,
    setSubmission,
    saveSubmissions,
    pagination,
  };
}
