"use client";

import { useState } from "react";
import { toast } from "sonner";
import { StudentsService } from "@/services/students-v2.service";
import type { StudentIdCardData, PickupCardData } from "@/types/students.types";
import type { CardTemplateId } from "@/constants/students-v2.constants";

export type CardMode = "student" | "pickup";

export function useStudentCards() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(
    null,
  );
  const [selectedTemplate, setSelectedTemplate] =
    useState<CardTemplateId>("classic");
  const [cardMode, setCardMode] = useState<CardMode>("student");
  const [idCardData, setIdCardData] = useState<StudentIdCardData | null>(null);
  const [pickupCardData, setPickupCardData] = useState<PickupCardData | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);

  async function loadCardData(studentId: string) {
    setSelectedStudentId(studentId);
    setIsLoading(true);
    try {
      const [idData, pickupData] = await Promise.all([
        StudentsService.getIdCardData(studentId),
        StudentsService.getPickupCardData(studentId),
      ]);
      setIdCardData(idData);
      setPickupCardData(pickupData);
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load card data",
      );
    } finally {
      setIsLoading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    window.print();
  }

  return {
    selectedStudentId,
    selectedTemplate,
    setSelectedTemplate,
    cardMode,
    setCardMode,
    idCardData,
    pickupCardData,
    isLoading,
    loadCardData,
    handlePrint,
    handleDownload,
  };
}
