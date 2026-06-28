"use client";

import { useState, useEffect } from "react";
import { ExamsService } from "@/services/exam.service";
import { StudentsService } from "@/services/students.service";
import type { Student } from "@/types";

export function useAdmitCardSelectors(examId: string, academicYearId: string) {
  const [sections, setSections] = useState<{ id: string; name: string }[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    setSectionId("");
    setSections([]);
    setAllStudents([]);
    if (!examId || !academicYearId) return;
    setStudentsLoading(true);
    ExamsService.getById(examId)
      .then(async (exam) => {
        const [studentsRes, classesRes] = await Promise.all([
          StudentsService.list({
            class_id: exam.class_id,
            academic_year_id: academicYearId,
            limit: 500,
          }),
          import("@/services/classes.service").then((m) =>
            m.ClassesService.list({ academic_year_id: academicYearId })
          ),
        ]);
        setAllStudents(studentsRes.items);
        const classSections = classesRes.sections.filter(
          (s: { class_id: string; id: string; name: string }) => s.class_id === exam.class_id
        );
        setSections(classSections);
      })
      .catch(() => {})
      .finally(() => setStudentsLoading(false));
  }, [examId, academicYearId]);

  const students = sectionId
    ? allStudents.filter((s) => s.section_id === sectionId)
    : allStudents;

  return { sections, sectionId, setSectionId, students, studentsLoading };
}
