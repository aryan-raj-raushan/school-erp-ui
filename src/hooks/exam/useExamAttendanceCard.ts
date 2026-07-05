"use client";

import { useState } from "react";
import { toast } from "sonner";
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
  const [isDownloading, setIsDownloading] = useState(false);
  const canDownload = !!(examId && classId && academicYearId);

  async function downloadAttendanceCard() {
    if (!examId || !classId || !academicYearId) return;
    setIsDownloading(true);
    try {
      const blob = await ExamAttendanceService.downloadAttendanceCardPdf({
        exam_id: examId,
        class_id: classId,
        academic_year_id: academicYearId,
        section_id: sectionId || undefined,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `attendance-card-${examId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to download attendance card");
    } finally {
      setIsDownloading(false);
    }
  }

  return { canDownload, isDownloading, downloadAttendanceCard };
}
