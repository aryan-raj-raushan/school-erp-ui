"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";

import { ClassesService } from "@/services/classes.service";
import { useAcademicYears } from "./useAcademicYears";

import type { Class, Section } from "@/types";

interface UseAcademicClassSectionOptions {
  autoSelectCurrentYear?: boolean;
  resetOnAcademicYearChange?: boolean;
}

export function useAcademicClassSection(
  options: UseAcademicClassSectionOptions = {},
) {
  const {
    autoSelectCurrentYear = true,
    resetOnAcademicYearChange = true,
  } = options;

  const { years, currentYear } = useAcademicYears();

  const [classes, setClasses] = useState<Class[]>([]);
  const [allSections, setAllSections] = useState<Section[]>([]);

  const [selectedAcademicYearId, setSelectedAcademicYearId] =
    useState<string>("");

  const [selectedClassId, setSelectedClassId] = useState<string>("");

  const [selectedSectionId, setSelectedSectionId] =
    useState<string>("");

  const [isLoadingClasses, setIsLoadingClasses] = useState(false);

  // Set default academic year
  useEffect(() => {
    if (
      autoSelectCurrentYear &&
      currentYear &&
      !selectedAcademicYearId
    ) {
      setSelectedAcademicYearId(currentYear.id);
    }
  }, [
    autoSelectCurrentYear,
    currentYear,
    selectedAcademicYearId,
  ]);

  const fetchClasses = useCallback(async () => {
    if (!selectedAcademicYearId) {
      setClasses([]);
      setAllSections([]);
      return;
    }

    setIsLoadingClasses(true);

    try {
      const res = await ClassesService.list({
        academic_year_id: selectedAcademicYearId,
      });

      setClasses(res.items);
      setAllSections(res.sections);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : "Failed to load classes",
      );
    } finally {
      setIsLoadingClasses(false);
    }
  }, [selectedAcademicYearId]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  // Reset dependent selections when academic year changes
  useEffect(() => {
    if (!resetOnAcademicYearChange) return;

    setSelectedClassId("");
    setSelectedSectionId("");
  }, [selectedAcademicYearId, resetOnAcademicYearChange]);

  const sections = useMemo(
    () =>
      selectedClassId
        ? allSections.filter(
            (section) => section.class_id === selectedClassId,
          )
        : [],
    [allSections, selectedClassId],
  );

  const handleClassChange = useCallback((classId: string) => {
    setSelectedClassId(classId);
    setSelectedSectionId("");
  }, []);

  const handleSectionChange = useCallback((sectionId: string) => {
    setSelectedSectionId(sectionId);
  }, []);

  const selectedClass = useMemo(
    () => classes.find((c) => c.id === selectedClassId),
    [classes, selectedClassId],
  );

  const selectedSection = useMemo(
    () => sections.find((s) => s.id === selectedSectionId),
    [sections, selectedSectionId],
  );

  console.log("Years: ", years);

  return {
    years,

    classes,
    sections,

    selectedClass,
    selectedSection,

    selectedAcademicYearId,
    setSelectedAcademicYearId,

    selectedClassId,
    selectedSectionId,

    handleClassChange,
    handleSectionChange,

    isLoadingClasses,
  };
}