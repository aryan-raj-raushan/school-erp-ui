"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ChevronRight, CreditCard, UserRound } from "lucide-react";
import {
  EmptyState,
  ListAvatar,
  PullIndicator,
  ScaleToFit,
  SegmentedControl,
  type SegmentOption,
} from "@/components/ui";
import {
  CARD_THEMES,
  LAYOUT_DIMS,
  CardPreview,
  TemplateThumb,
} from "@/components/student/id-cards";
import { StudentPickerSheet } from "@/components/student/StudentPickerSheet";
import { usePullToRefresh } from "@/hooks/usePullToRefresh";
import { useStudentCards, type CardMode } from "@/hooks/useStudentCard";
import { CARD_TEMPLATES } from "@/constants/students.constants";
import { haptic } from "@/lib/haptics";

const MODE_OPTIONS: ReadonlyArray<SegmentOption<CardMode>> = [
  { value: "student", label: "ID card" },
  { value: "pickup", label: "Pick-up card" },
];

export function StudentCardMobile() {
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const [pickerOpen, setPickerOpen] = useState(false);

  const {
    selectedStudentId,
    selectedTemplate,
    setSelectedTemplate,
    cardMode,
    setCardMode,
    idCardData,
    pickupCardData,
    isLoading,
    loadCardData,
  } = useStudentCards();

  useEffect(() => {
    if (preselectedStudentId) void loadCardData(preselectedStudentId);
    // Load the linked student once; loadCardData is not memoised.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedStudentId]);

  const pullState = usePullToRefresh(async () => {
    if (selectedStudentId) await loadCardData(selectedStudentId);
  });

  const student = idCardData;
  const studentName = student
    ? `${student.first_name} ${student.last_name ?? ""}`.trim()
    : "";
  const studentMeta = student
    ? [
        [student.class_name, student.section_name].filter(Boolean).join(" - "),
        student.roll_number ? `Roll ${student.roll_number}` : null,
      ]
        .filter(Boolean)
        .join(" · ")
    : "";
  const hasCard = cardMode === "student" ? !!idCardData : !!pickupCardData;

  function pickTemplate(id: (typeof CARD_TEMPLATES)[number]["id"]) {
    void haptic("light");
    setSelectedTemplate(id);
  }

  return (
    <div className="flex flex-col gap-4 pt-3">
      <button
        type="button"
        onClick={() => setPickerOpen(true)}
        className="flex min-h-[72px] items-center gap-3 rounded-2xl border border-border bg-white p-3 text-left active:bg-muted dark:bg-neutral-900"
      >
        {student ? (
          <ListAvatar src={student.profile_image} name={studentName} size={48} />
        ) : (
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
            <UserRound size={22} />
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[15px] font-semibold">
            {student ? studentName : "Choose a student"}
          </span>
          <span className="block truncate text-xs text-muted-foreground">
            {student ? studentMeta : "Pick a class and student to preview the card"}
          </span>
        </span>
        <ChevronRight size={20} className="shrink-0 text-muted-foreground" />
      </button>

      <SegmentedControl
        ariaLabel="Card type"
        options={MODE_OPTIONS}
        value={cardMode}
        onChange={setCardMode}
      />

      <PullIndicator
        pull={pullState.pull}
        threshold={pullState.threshold}
        isRefreshing={pullState.isRefreshing}
      />

      <div className="rounded-3xl bg-muted/40 px-3 py-6">
        {isLoading ? (
          <div className="mx-auto h-[420px] max-w-[300px] animate-pulse rounded-3xl bg-muted" />
        ) : !selectedStudentId || !hasCard ? (
          <EmptyState
            icon={<CreditCard size={28} />}
            title="No card yet"
            description="Choose a student to generate their card."
            action={{ label: "Choose student", onClick: () => setPickerOpen(true) }}
          />
        ) : (
          <ScaleToFit width={LAYOUT_DIMS[CARD_THEMES[selectedTemplate].layout].w}>
            <div className="mx-auto w-fit">
              <CardPreview
                template={selectedTemplate}
                mode={cardMode}
                idCardData={idCardData}
                pickupCardData={pickupCardData}
              />
            </div>
          </ScaleToFit>
        )}
      </div>

      <section>
        <h3 className="mb-2 px-1 text-sm font-semibold">Design</h3>
        <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CARD_TEMPLATES.map((template) => {
            const active = template.id === selectedTemplate;
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => pickTemplate(template.id)}
                aria-pressed={active}
                className={`w-[150px] shrink-0 snap-start rounded-2xl border-2 p-2 text-left transition-colors active:scale-95 ${
                  active ? "border-primary bg-primary/5" : "border-border bg-white dark:bg-neutral-900"
                }`}
              >
                <TemplateThumb templateId={template.id} mode={cardMode} />
                <span className="mt-2 block truncate text-xs font-semibold">{template.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <StudentPickerSheet
        isOpen={pickerOpen}
        onClose={() => setPickerOpen(false)}
        selectedStudentId={selectedStudentId}
        onSelect={(id) => void loadCardData(id)}
      />
    </div>
  );
}
