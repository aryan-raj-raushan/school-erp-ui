"use client";

import { useState, useEffect } from "react";
import { ExamsService } from "@/services/exam.service";
import { StudentsService } from "@/services/students.service";
import type { Student } from "@/types";

export function useAdmitCardSelectors(examId: string, academicYearId: string) {
  const [classes, setClasses] = useState<{ id: string; name: string }[]>([]);
  const [classId, setClassId] = useState("");
  const [allSections, setAllSections] = useState<{ id: string; name: string; class_id: string }[]>([]);
  const [sectionId, setSectionId] = useState("");
  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [studentsLoading, setStudentsLoading] = useState(false);

  useEffect(() => {
    setClassId("");
    setSectionId("");
    setClasses([]);
    setAllSections([]);
    setAllStudents([]);
    if (!examId || !academicYearId) return;
    setStudentsLoading(true);
    ExamsService.getById(examId)
      .then(async (exam) => {
        const [studentsResults, classesRes] = await Promise.all([
          Promise.all(
            exam.class_ids.map((classId) =>
              StudentsService.list({ class_id: classId, academic_year_id: academicYearId, limit: 500 }),
            ),
          ),
          import("@/services/classes.service").then((m) =>
            m.ClassesService.list({ academic_year_id: academicYearId })
          ),
        ]);
        setAllStudents(studentsResults.flatMap((r) => r.items));
        const classIdSet = new Set(exam.class_ids);
        setClasses(classesRes.items.filter((c) => classIdSet.has(c.id)));
        const classSections = classesRes.sections.filter(
          (s: { class_id: string; id: string; name: string }) => classIdSet.has(s.class_id)
        );
        setAllSections(classSections);
      })
      .catch(() => {})
      .finally(() => setStudentsLoading(false));
  }, [examId, academicYearId]);

  const sections = classId
    ? allSections.filter((s) => s.class_id === classId)
    : allSections;

  const students = allStudents.filter(
    (s) =>
      (!classId || s.class_id === classId) &&
      (!sectionId || s.section_id === sectionId)
  );

  return {
    classes,
    classId,
    setClassId: (id: string) => {
      setClassId(id);
      setSectionId("");
    },
    sections,
    sectionId,
    setSectionId,
    students,
    studentsLoading,
  };
}
