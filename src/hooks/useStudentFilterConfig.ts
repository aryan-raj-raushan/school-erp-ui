"use client";

import { useEffect, useMemo, useState } from "react";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import {
  STUDENT_PAGE,
  STUDENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
} from "@/constants/students.constants";
import type { Class, Section } from "@/types";
import type { StudentFilters } from "@/types/students.types";
import type { FilterField } from "@/components/ui";

type PersistedStudentFilters = Pick<
  StudentFilters,
  "academic_year_id" | "class_id" | "section_id" | "status" | "gender"
>;

const PERSISTED_KEYS = [
  "academic_year_id",
  "class_id",
  "section_id",
  "status",
  "gender",
] as const;

function useClassesAndSections(
  academicYearId: string | undefined,
  classId: string | undefined,
) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    if (!academicYearId) return;
    (async () => {
      const { ClassesService } = await import("@/services/classes.service");
      try {
        const r = await ClassesService.list({
          academic_year_id: academicYearId,
          limit: 100,
        });
        setClasses(r.items);
      } catch {
        setClasses([]);
      }
    })();
  }, [academicYearId]);

  useEffect(() => {
    if (!classId) return;
    (async () => {
      const { SectionsService } = await import("@/services/classes.service");
      try {
        const r = await SectionsService.list({ class_id: classId, limit: 100 });
        setSections(r.items);
      } catch {
        setSections([]);
      }
    })();
  }, [classId]);

  return {
    classes: academicYearId ? classes : [],
    sections: classId ? sections : [],
  };
}

/**
 * Filter fields, current values and change/clear handlers for the students
 * list, including cross-visit persistence. Shared by the desktop table and
 * the mobile card list so both behave identically.
 */
export function useStudentFilterConfig(
  filters: StudentFilters,
  updateFilters: (next: Partial<StudentFilters>) => void,
) {
  const { years } = useAcademicYears();
  const { classes, sections } = useClassesAndSections(
    filters.academic_year_id,
    filters.class_id,
  );

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated,
  } = useStorageFilter<PersistedStudentFilters>({
    key: STORAGE_FILTER_KEYS.STUDENTS,
    defaultValue: {},
  });

  useEffect(() => {
    if (!isHydrated) return;
    if (Object.values(storedFilters).some(Boolean)) {
      updateFilters(storedFilters);
    }
    // Apply saved filters exactly once, when storage first hydrates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isHydrated]);

  function onChange(next: Partial<StudentFilters>) {
    updateFilters(next);
    const persisted: Partial<PersistedStudentFilters> = {};
    PERSISTED_KEYS.forEach((key) => {
      if (key in next) persisted[key] = next[key] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function onClear() {
    onChange({
      academic_year_id: undefined,
      class_id: undefined,
      section_id: undefined,
      status: undefined,
      gender: undefined,
      search: undefined,
      page: 1,
    });
    clearStoredFilters();
  }

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: STUDENT_PAGE.filters.search,
      },
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: STUDENT_PAGE.filters.allYears,
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
        resetKeys: ["class_id", "section_id"],
      },
      {
        type: "select",
        key: "class_id",
        label: "Class",
        placeholder: STUDENT_PAGE.filters.allClasses,
        options: classes.map((c) => ({ value: c.id, label: c.name })),
        disabled: !filters.academic_year_id,
        resetKeys: ["section_id"],
      },
      {
        type: "select",
        key: "section_id",
        label: "Section",
        placeholder: STUDENT_PAGE.filters.allSections,
        options: sections.map((s) => ({ value: s.id, label: s.name })),
        disabled: !filters.class_id,
      },
      {
        type: "select",
        key: "status",
        label: "Status",
        placeholder: STUDENT_PAGE.filters.allStatus,
        options: STUDENT_STATUS_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
      {
        type: "select",
        key: "gender",
        label: "Gender",
        placeholder: STUDENT_PAGE.filters.allGender,
        options: GENDER_OPTIONS.map((o) => ({
          value: o.value,
          label: o.label,
        })),
      },
    ],
    [years, classes, sections, filters.academic_year_id, filters.class_id],
  );

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    academic_year_id: filters.academic_year_id,
    class_id: filters.class_id,
    section_id: filters.section_id,
    status: filters.status,
    gender: filters.gender,
  };

  return { filterFields, filterValues, onChange, onClear };
}
