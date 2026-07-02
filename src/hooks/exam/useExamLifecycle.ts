"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ExamsService } from "@/services/exam.service";
import type { Exam, ExamStatus, CopyExamPayload } from "@/types/exam.types";
import { EXAM_STATUS_TRANSITIONS } from "@/types/exam.types";

export function useExamLifecycle(exam: Exam | null, onChanged: (exam: Exam) => void) {
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isCopying, setIsCopying] = useState(false);

  const allowedNextStatuses = exam ? EXAM_STATUS_TRANSITIONS[exam.status] ?? [] : [];

  async function changeStatus(status: ExamStatus) {
    if (!exam) return;
    setIsChangingStatus(true);
    try {
      const updated = await ExamsService.changeStatus(exam.id, status);
      toast.success(`Exam moved to ${status.replace(/_/g, " ").toLowerCase()}`);
      onChanged(updated);
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to change exam status");
    } finally {
      setIsChangingStatus(false);
    }
  }

  async function copyExam(payload: CopyExamPayload): Promise<Exam | null> {
    if (!exam) return null;
    setIsCopying(true);
    try {
      const copied = await ExamsService.copy(exam.id, payload);
      toast.success(`Exam copied — "${copied.exam_name}" created as draft`);
      return copied;
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to copy exam");
      return null;
    } finally {
      setIsCopying(false);
    }
  }

  return { allowedNextStatuses, isChangingStatus, changeStatus, isCopying, copyExam };
}
