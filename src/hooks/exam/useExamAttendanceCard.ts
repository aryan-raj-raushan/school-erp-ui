"use client";

import { useMemo } from "react";
import { ExamAttendanceService } from "@/services/exam.service";

interface UseExamAttendanceCardParams {
  examId?: string;
  classId?: string;
  academicYearId?: string;
  sectionId?: string;
}

export function useExamAttendanceCard({
  examId,
  classId,
  academicYearId,
  sectionId,
}: UseExamAttendanceCardParams) {
  const attendanceCardUrl = useMemo(() => {
    if (!examId || !classId || !academicYearId) {
      return null;
    }

    return ExamAttendanceService.getAttendanceCardPdfUrl({
      exam_id: examId,
      class_id: classId,
      academic_year_id: academicYearId,
      section_id: sectionId || undefined,
    });
  }, [examId, classId, academicYearId, sectionId]);

  return { attendanceCardUrl };
}