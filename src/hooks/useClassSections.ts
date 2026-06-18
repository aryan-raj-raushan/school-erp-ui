'use client';

import { useState, useEffect } from 'react';
import { ClassesService, SectionsService } from '@/services/classes.service';
import type { Class, Section } from '@/types';

export function useClassSections(academicYearId: string, classId: string) {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  useEffect(() => {
    setClasses([]);
    if (!academicYearId) return;
    ClassesService.list({ academic_year_id: academicYearId, limit: 100 })
      .then((r) => setClasses(r.items))
      .catch(() => {});
  }, [academicYearId]);

  useEffect(() => {
    setSections([]);
    if (!classId) return;
    SectionsService.list({ class_id: classId, limit: 100 })
      .then((r) => setSections(r.items))
      .catch(() => {});
  }, [classId]);

  return { classes, sections };
}
