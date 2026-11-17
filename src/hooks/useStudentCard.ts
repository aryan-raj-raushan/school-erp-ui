"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { StudentsService } from "@/services/students-v2.service";
import { SchoolSettingsService } from "@/services/school-settings.service";
import type { StudentIdCardData, PickupCardData, BulkCardItem } from "@/types/students.types";
import { CARD_TEMPLATES, type CardTemplateId } from "@/constants/students.constants";
import { confirmAction } from "@/components/ui/confirm-dialog";
import { errorMessage } from "@/lib/api-error";

export type CardMode = "student" | "pickup";

const DEFAULT_TEMPLATE: CardTemplateId = "classic";
const CARD_MODE_LABEL: Record<CardMode, string> = { student: "student ID cards", pickup: "pickup cards" };
const SETTINGS_FIELD: Record<CardMode, "id_card_template" | "pickup_card_template"> = {
  student: "id_card_template",
  pickup: "pickup_card_template",
};

function asTemplateId(value: string | null | undefined): CardTemplateId | null {
  return CARD_TEMPLATES.some((t) => t.id === value) ? (value as CardTemplateId) : null;
}

export function templateLabel(id: CardTemplateId | null): string {
  return CARD_TEMPLATES.find((t) => t.id === id)?.label ?? "";
}

export function useStudentCards() {
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [cardMode, setCardMode] = useState<CardMode>("student");
  const [savedTemplates, setSavedTemplates] = useState<Record<CardMode, CardTemplateId | null>>({
    student: null,
    pickup: null,
  });
  const [sessionTemplates, setSessionTemplates] = useState<Partial<Record<CardMode, CardTemplateId>>>({});
  const [idCardData, setIdCardData] = useState<StudentIdCardData | null>(null);
  const [pickupCardData, setPickupCardData] = useState<PickupCardData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [bulkItems, setBulkItems] = useState<BulkCardItem[] | null>(null);
  const [isLoadingBulk, setIsLoadingBulk] = useState(false);

  useEffect(() => {
    let active = true;
    SchoolSettingsService.getSettings()
      .then((settings) => {
        if (!active) return;
        setSavedTemplates({
          student: asTemplateId(settings.id_card_template),
          pickup: asTemplateId(settings.pickup_card_template),
        });
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, []);

  const selectedTemplate = sessionTemplates[cardMode] ?? savedTemplates[cardMode] ?? DEFAULT_TEMPLATE;
  const savedTemplate = savedTemplates[cardMode];

  const setSelectedTemplate = useCallback(
    async (id: CardTemplateId) => {
      const mode = cardMode;
      const current = savedTemplates[mode];
      if (current === id) {
        setSessionTemplates((prev) => ({ ...prev, [mode]: id }));
        return;
      }
      if (current) {
        const confirmed = await confirmAction({
          title: "Change the school's card template?",
          description: `${templateLabel(current)} is currently used for all ${CARD_MODE_LABEL[mode]}. Switch every future card to ${templateLabel(id)}?`,
          confirmLabel: `Use ${templateLabel(id)}`,
        });
        if (!confirmed) return;
      }
      setSessionTemplates((prev) => ({ ...prev, [mode]: id }));
      try {
        await SchoolSettingsService.updateSettings({ [SETTINGS_FIELD[mode]]: id });
        setSavedTemplates((prev) => ({ ...prev, [mode]: id }));
        toast.success(`${templateLabel(id)} is now the school's template for ${CARD_MODE_LABEL[mode]}`);
      } catch (err) {
        toast.error(errorMessage(err, "Template applied for now, but could not be saved for the school"));
      }
    },
    [cardMode, savedTemplates],
  );

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
      toast.error(errorMessage(err, "Failed to load card data"));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadBulkCards(scope: { academic_year_id: string; class_id: string; section_id?: string }) {
    setIsLoadingBulk(true);
    try {
      const items = await StudentsService.getBulkCards(scope);
      if (!items.length) {
        toast.error("No active students found in this class / section");
        return null;
      }
      setBulkItems(items);
      return items;
    } catch (err) {
      toast.error(errorMessage(err, "Failed to load students for bulk cards"));
      return null;
    } finally {
      setIsLoadingBulk(false);
    }
  }

  return {
    selectedStudentId,
    selectedTemplate,
    savedTemplate,
    setSelectedTemplate,
    cardMode,
    setCardMode,
    idCardData,
    pickupCardData,
    isLoading,
    loadCardData,
    bulkItems,
    isLoadingBulk,
    loadBulkCards,
    clearBulkItems: () => setBulkItems(null),
  };
}
