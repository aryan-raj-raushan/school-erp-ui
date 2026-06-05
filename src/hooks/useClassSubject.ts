"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";

import {
  ClassSubjectsService,
  type CreateClassSubjectPayload,
} from "@/services/class-subject.service";
import { SectionsService } from "@/services/classes.service";
import type { Section, Subject, PaginationMeta } from "@/types";
import type { ClassSectionSubject, ClassSectionSubjectsResponse } from "@/types/setting/class-subject.types";

const classSubjectSchema = z.object({
  class_section_id: z.string().min(1, "Section is required"),
  subject_id: z.string().min(1, "Subject is required"),
  academic_year_id: z.string().min(1, "Academic year is required"),
  is_teaching_subject: z.boolean().optional(),
});

export type ClassSubjectFormValues = z.infer<typeof classSubjectSchema>;

export interface ClassSubjectFilters {
  class_section_id?: string;
  academic_year_id?: string;
}

export function useClassSubjects(defaultFilters: ClassSubjectFilters = {}) {
  const [classSubjects, setClassSubjects] = useState<ClassSectionSubjectsResponse>();
  const [sections, setSections] = useState<Section[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const form = useForm<ClassSubjectFormValues>({
    resolver: zodResolver(classSubjectSchema) as any,
    defaultValues: {
      class_section_id: defaultFilters.class_section_id ?? "",
      academic_year_id: defaultFilters.academic_year_id ?? "",
      subject_id: "",
      is_teaching_subject: true,
    },
  });

  const fetchClassSubjects = useCallback(
    async (filters: ClassSubjectFilters = defaultFilters) => {
      setIsLoading(true);
      try {
        const result = await ClassSubjectsService.list(filters);
        setClassSubjects(result);
        setPagination(result.pagination);
      } catch (err: unknown) {
        toast.error(
          err instanceof Error ? err.message : "Failed to load class subjects",
        );
      } finally {
        setIsLoading(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [defaultFilters.class_section_id, defaultFilters.academic_year_id],
  );

  const fetchSections = useCallback(async () => {
    try {
      const result = await SectionsService.list({});
      setSections(result.items);
    } catch {
      // silently fail — sections are supplementary
    }
  }, []);

  async function assignSubject(values: ClassSubjectFormValues) {
    try {
      const payload: CreateClassSubjectPayload = {
        class_section_id: values.class_section_id,
        subject_id: values.subject_id,
        academic_year_id: values.academic_year_id,
        is_teaching_subject: values.is_teaching_subject ?? true,
      };
      await ClassSubjectsService.create(payload);
      toast.success("Subject assigned to class successfully");
      await fetchClassSubjects();
      setShowModal(false);
      form.reset({
        class_section_id: defaultFilters.class_section_id ?? "",
        academic_year_id: defaultFilters.academic_year_id ?? "",
        subject_id: "",
        is_teaching_subject: true,
      });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to assign subject",
      );
    }
  }

  async function removeClassSubject(id: string) {
    try {
      await ClassSubjectsService.remove(id);
      toast.success("Subject removed from class");
      await fetchClassSubjects();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to remove subject",
      );
    }
  }

  useEffect(() => {
    fetchClassSubjects();
    fetchSections();
  }, [fetchClassSubjects, fetchSections]);

  return {
    classSubjects,
    sections,
    pagination,
    isLoading,
    showModal,
    openModal: () => setShowModal(true),
    closeModal: () => {
      setShowModal(false);
      form.reset({
        class_section_id: defaultFilters.class_section_id ?? "",
        academic_year_id: defaultFilters.academic_year_id ?? "",
        subject_id: "",
        is_teaching_subject: true,
      });
    },
    form,
    handleSubmit: form.handleSubmit(assignSubject),
    isSubmitting: form.formState.isSubmitting,
    removeClassSubject,
    refetch: fetchClassSubjects,
  };
}
