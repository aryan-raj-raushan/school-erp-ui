"use client";

import { useState, useEffect, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import {
  ClassesService,
  SectionsService,
  type CreateClassPayload,
  type CreateSectionPayload,
} from "@/services/classes.service";
import type { Class, Section, PaginationMeta } from "@/types";

export const DEFAULT_SECTION_NAMES = ["A", "B", "C", "D", "E", "F"] as const;

const classSchema = z.object({
  name: z.string().min(1, "Class name required"),
  academic_year_id: z.string().min(1, "Academic year required"),
  description: z.string().optional(),
  sections: z.array(z.string()).min(1, "Select at least one section"),
});

export type ClassFormValues = z.infer<typeof classSchema>;

export function useClasses(academicYearId?: string) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showClassModal, setShowClassModal] = useState(false);

  const classForm = useForm<ClassFormValues>({
    resolver: zodResolver(classSchema) as any,
    defaultValues: {
      academic_year_id: academicYearId ?? "",
      sections: ["A"],
    },
  });

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await ClassesService.list(
        academicYearId ? { academic_year_id: academicYearId } : {},
      );
      setClasses(result.items);
      setPagination(result.pagination);
      if (result.items.length > 0) {
        const sectionRes = await SectionsService.list({});
        setSections(sectionRes.items);
      }
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load classes",
      );
    } finally {
      setIsLoading(false);
    }
  }, [academicYearId]);

  async function createClass(values: ClassFormValues) {
    try {
      const payload: CreateClassPayload = {
        name: values.name,
        academic_year_id: values.academic_year_id,
        ...(values.description && { description: values.description }),
      };
      const cls = await ClassesService.create(payload);

      // Auto-create selected sections
      await Promise.all(
        values.sections.map((sectionName) =>
          SectionsService.create({
            name: sectionName,
            class_id: cls.id,
          } as CreateSectionPayload),
        ),
      );

      toast.success(
        `Class ${cls.name} created with sections ${values.sections.join(", ")}`,
      );
      await fetchClasses();
      setShowClassModal(false);
      classForm.reset({ sections: ["A"] });
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create class",
      );
    }
  }

  async function removeClass(id: string) {
    try {
      await ClassesService.remove(id);
      toast.success("Class deleted");
      await fetchClasses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  async function removeSection(id: string) {
    try {
      await SectionsService.remove(id);
      toast.success("Section deleted");
      await fetchClasses();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to delete");
    }
  }

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Sections for a specific class
  function sectionsForClass(classId: string) {
    return sections.filter((s) => s.class_id === classId);
  }

  return {
    classes,
    sections,
    pagination,
    isLoading,
    showClassModal,
    openClassModal: () => setShowClassModal(true),
    closeClassModal: () => {
      setShowClassModal(false);
      classForm.reset({ sections: ["A"] });
    },
    classForm,
    handleClassSubmit: classForm.handleSubmit(createClass),
    isClassSubmitting: classForm.formState.isSubmitting,
    removeClass,
    removeSection,
    sectionsForClass,
    refetch: fetchClasses,
  };
}
