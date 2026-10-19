"use client";

import { useState } from "react";
import { SittingPlanService } from "@/services/exam.service";

interface RoomPdfParams {
  hallDetailId: string;
  examId: string;
  academicYearId: string;
  roomName?: string;
}

/** Downloads the sitting-plan PDF of one room; the service toasts on failure. */
export function useRoomPdfDownload() {
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  async function downloadRoomPdf({ hallDetailId, examId, academicYearId, roomName }: RoomPdfParams) {
    setIsDownloadingPdf(true);
    try {
      await SittingPlanService.downloadRoomPdf({
        hall_detail_id: hallDetailId,
        exam_ids: [examId],
        academic_year_id: academicYearId,
        room_name: roomName,
      });
    } catch {
      // toast shown by service on error
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  return { isDownloadingPdf, downloadRoomPdf };
}
