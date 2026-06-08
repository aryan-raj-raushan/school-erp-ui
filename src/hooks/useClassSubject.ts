"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  ClassSubjectsService,
  type CreateSubjectPayload,
  type UpdateSubjectPayload,
} from "@/services/class-subject.service";
import type { Subject, PaginationMeta } from "@/types";

const classSubjectSchema = z.object({
  name: z.string().min(1, "Name is required"),
  class_id: z.string().min(1, "Class is required"),
  code: z.string().optional(),
  description: z.string().optional(),
  is_elective: z.boolean().optional(),
  is_active: z.boolean().optional(),
});

export type ClassSubjectFormValues = z.infer<typeof classSubjectSchema>;

export interface ClassSubjectFilters {
  class_id?: string;
  academic_year_id?: string;
}

export function useClassSubjects(defaultFilters: ClassSubjectFilters = {}) {
  const [classSubjects, setClassSubjects] = useState<Subject[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState<Subject | null>(null);

  const form = useForm<ClassSubjectFormValues>({
    resolver: zodResolver(classSubjectSchema) as any,
    defaultValues: {
      class_id: defaultFilters.class_id ?? "",
      name: "",
      code: "",
      description: "",
      is_elective: false,
      is_active: true,
    },
  });

  const fetchClassSubjects = useCallback(
    async (filters: ClassSubjectFilters = defaultFilters) => {
      setIsLoading(true);
      try {
        const result = await ClassSubjectsService.list(filters);
        setClassSubjects(result.items);
        setPagination(result.pagination);
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : "Failed to load subjects");
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultFilters.class_id],
  );

  async function saveSubject(values: ClassSubjectFormValues) {
    try {
      if (editingRecord) {
        await ClassSubjectsService.update(editingRecord.id, values as UpdateSubjectPayload);
        toast.success("Subject updated");
      } else {
        await ClassSubjectsService.create(values as CreateSubjectPayload);
        toast.success("Subject created");
      }
      await fetchClassSubjects();
      setShowModal(false);
      setEditingRecord(null);
      form.reset({ class_id: defaultFilters.class_id ?? "", name: "", code: "", description: "", is_elective: false, is_active: true });
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to save subject");
    }
  }

  function openEditModal(subject: Subject) {
    setEditingRecord(subject);
    form.reset({
      class_id: subject.class_id ?? "",
      name: subject.name,
      code: subject.code ?? "",
      description: subject.description ?? "",
    });
    setShowModal(true);
  }

  async function removeSubject(id: string) {
    try {
      await ClassSubjectsService.remove(id);
      toast.success("Subject removed");
      await fetchClassSubjects();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to remove subject");
    }
  }

  useEffect(() => {
    fetchClassSubjects();
  }, [fetchClassSubjects]);

  return {
    classSubjects,
    pagination,
    isLoading,
    showModal,
    editingRecord,
    openModal: () => { setEditingRecord(null); setShowModal(true); },
    openEditModal,
    closeModal: () => {
      setShowModal(false);
      setEditingRecord(null);
      form.reset({ class_id: defaultFilters.class_id ?? "", name: "", code: "", description: "", is_elective: false, is_active: true });
    },
    form,
    handleSubmit: form.handleSubmit(saveSubject),
    isSubmitting: form.formState.isSubmitting,
    removeSubject,
    refetch: fetchClassSubjects,
  };
}
