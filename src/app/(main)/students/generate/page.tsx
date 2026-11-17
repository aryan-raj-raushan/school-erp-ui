"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Printer,
  Download,
  CreditCard,
  ChevronDown,
  FileArchive,
} from "lucide-react";
import { toast } from "sonner";
import { useStudentCards, templateLabel, type CardMode } from "@/hooks/useStudentCard";
import { useStudents } from "@/hooks/useStudentV2";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
  P,
  Span,
  Button,
  Spinner,
  Tabs,
  ResponsiveModalContainer,
  FilterToolbar,
  ScaleToFit,
  type FilterField,
} from "@/components/ui";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  CARD_TEMPLATES,
} from "@/constants/students.constants";
import {
  CARD_THEMES,
  LAYOUT_DIMS,
  CardPreview,
  TemplateThumb,
} from "@/components/student/id-cards";
import { StudentCardMobile } from "@/components/student/StudentCardMobile";
import { useIsMobileReady } from "@/hooks/useIsMobileReady";
import { exportCardsAsZip, waitForPaint } from "@/lib/card-export";
import { errorMessage } from "@/lib/api-error";

// ─── Main page ────────────────────────────────────────────────────────────────

function GenerateDesktop() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const preselectedStudentId = searchParams.get("studentId");
  const printRef = useRef<HTMLDivElement>(null);
  const bulkAreaRef = useRef<HTMLDivElement>(null);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [printTarget, setPrintTarget] = useState<"single" | "bulk">("single");
  const [bulkProgress, setBulkProgress] = useState<{ done: number; total: number } | null>(null);

  const {
    selectedStudentId,
    selectedTemplate,
    savedTemplate,
    setSelectedTemplate,
    cardMode,
    setCardMode,
    idCardData,
    pickupCardData,
    isLoading: isCardLoading,
    loadCardData,
    bulkItems,
    isLoadingBulk,
    loadBulkCards,
    clearBulkItems,
  } = useStudentCards();

  const {
    years,
    classes,
    sections,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    selectedClassId,
    selectedSectionId,
    handleClassChange,
    handleSectionChange,
    isLoadingClasses,
  } = useAcademicClassSection();

  const { students, isLoading: isStudentsLoading, updateFilters } = useStudents({
    is_enabled: true,
  });

  // Fetch students for the chosen academic year / class / section only.
  useEffect(() => {
    if (selectedClassId) {
      updateFilters({
        academic_year_id: selectedAcademicYearId || undefined,
        class_id: selectedClassId,
        section_id: selectedSectionId || undefined,
      });
    }
  }, [selectedAcademicYearId, selectedClassId, selectedSectionId]); // eslint-disable-line

  // Auto-load if arriving from a student row action.
  useEffect(() => {
    if (preselectedStudentId) {
      loadCardData(preselectedStudentId);
    }
  }, [preselectedStudentId]); // eslint-disable-line

  const hasData = cardMode === "student" ? !!idCardData : !!pickupCardData;
  const currentTemplate = CARD_TEMPLATES.find((t) => t.id === selectedTemplate);

  function handlePrint() {
    setPrintTarget("single");
    window.print();
  }

  const selectedClassName = classes.find((c) => c.id === selectedClassId)?.name ?? "";
  const selectedSectionName = sections.find((s) => s.id === selectedSectionId)?.name ?? "";
  const bulkScopeLabel = selectedClassName
    ? `Class ${selectedClassName}${selectedSectionName ? ` - ${selectedSectionName}` : " (all sections)"}`
    : "";
  const isBulkBusy = isLoadingBulk || bulkProgress !== null;

  async function loadSelectedClassCards() {
    if (!selectedAcademicYearId || !selectedClassId) {
      toast.error("Select an academic year and class first");
      return null;
    }
    const items = await loadBulkCards({
      academic_year_id: selectedAcademicYearId,
      class_id: selectedClassId,
      section_id: selectedSectionId || undefined,
    });
    if (items) await waitForPaint();
    return items;
  }

  async function handleBulkDownload() {
    const items = await loadSelectedClassCards();
    if (!items) return;
    const nodes = Array.from(bulkAreaRef.current?.querySelectorAll<HTMLElement>("[data-bulk-card]") ?? []);
    setBulkProgress({ done: 0, total: nodes.length });
    try {
      const count = await exportCardsAsZip(
        nodes.map((node, index) => {
          const card = items[index].id_card;
          return {
            node,
            fileName: [card.section_name, card.roll_number ?? index + 1, card.first_name, card.last_name]
              .filter(Boolean)
              .join("-"),
          };
        }),
        `${bulkScopeLabel}-${cardMode === "student" ? "id-cards" : "pickup-cards"}`,
        (done, total) => setBulkProgress({ done, total }),
      );
      toast.success(`${count} cards downloaded as a ZIP file`);
    } catch (err) {
      toast.error(errorMessage(err, "Could not create the ZIP file"));
    } finally {
      setBulkProgress(null);
      clearBulkItems();
    }
  }

  async function handleBulkPrint() {
    const items = await loadSelectedClassCards();
    if (!items) return;
    setPrintTarget("bulk");
    await waitForPaint();
    window.print();
    setPrintTarget("single");
    clearBulkItems();
  }

  const cardTabs = [
    { value: "student" as CardMode, label: STUDENT_PAGE.buttons.generateIdCard },
    { value: "pickup" as CardMode, label: STUDENT_PAGE.buttons.generatePickupCard },
  ];

  function handleFilterChange(next: Record<string, string | undefined>) {
    if ("academic_year_id" in next) setSelectedAcademicYearId(next.academic_year_id ?? "");
    if ("class_id" in next) handleClassChange(next.class_id ?? "");
    if ("section_id" in next) handleSectionChange(next.section_id ?? "");
    if ("student_id" in next && next.student_id) loadCardData(next.student_id);
  }

  function handleClearFilters() {
    setSelectedAcademicYearId("");
    handleClassChange("");
  }

  const filterFields: FilterField[] = [
    {
      type: "select",
      key: "academic_year_id",
      label: "Academic Year",
      placeholder: "Select year",
      options: years.map((y) => ({
        value: y.id,
        label: `${y.name}${y.is_current ? " (Current)" : ""}`,
      })),
      resetKeys: ["class_id", "section_id", "student_id"],
    },
    {
      type: "select",
      key: "class_id",
      label: "Class",
      placeholder: "Select class",
      options: classes.map((c) => ({ value: c.id, label: c.name })),
      disabled: !selectedAcademicYearId || isLoadingClasses,
      resetKeys: ["section_id", "student_id"],
    },
    {
      type: "select",
      key: "section_id",
      label: "Section",
      placeholder: "All sections",
      options: sections.map((s) => ({ value: s.id, label: s.name })),
      disabled: !selectedClassId,
    },
    {
      type: "select",
      key: "student_id",
      label: "Student",
      placeholder: !selectedClassId ? "Select a class first" : "Select student",
      options: students.map((s) => {
        const rollSuffix = s.roll_number ? ` — Roll ${s.roll_number}` : "";
        return { value: s.id, label: `${s.first_name} ${s.last_name ?? ""}${rollSuffix}` };
      }),
      disabled: !selectedClassId || isStudentsLoading,
    },
  ];

  const filterValues: Record<string, string | undefined> = {
    academic_year_id: selectedAcademicYearId,
    class_id: selectedClassId,
    section_id: selectedSectionId,
    student_id: selectedStudentId ?? undefined,
  };

  return (
    <>
      {/* Print-only styles */}
      <style>{printTarget === "single" ? `
        @media print {
          body * { visibility: hidden !important; }
          #card-print-area, #card-print-area * { visibility: visible !important; }
          #card-print-area {
            position: fixed !important;
            inset: 0 !important;
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            background: white !important;
          }
        }
      ` : `
        @media print {
          body * { visibility: hidden !important; }
          #bulk-print-area, #bulk-print-area * { visibility: visible !important; }
          #bulk-print-area {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            display: flex !important;
            flex-wrap: wrap !important;
            gap: 12px !important;
            background: white !important;
          }
          #bulk-print-area [data-bulk-card] { break-inside: avoid; page-break-inside: avoid; }
        }
      `}</style>

      <Div type="col" gap="md">
        <PageHeader
          title={STUDENT_PAGE.generate.title}
          subtitle={STUDENT_PAGE.generate.subtitle}
          actions={
            <Button variant="outline" size="sm" onClick={() => router.push(STUDENT_ROUTES.list)}>
              <ArrowLeft size={14} />
              {STUDENT_PAGE.buttons.back}
            </Button>
          }
        />

        {/* ── Class & student selection ─────────────────────────────────── */}
        <FilterToolbar
          fields={filterFields}
          values={filterValues}
          onChange={handleFilterChange}
          onClear={handleClearFilters}
          sheetTitle="Filter Students"
        />

        {/* ── Card type / template / actions ────────────────────────────── */}
        <Div
          className="rounded-xl border border-border bg-card px-4 py-3"
          type="col"
          gap="sm"
        >
          <Div type="col" gap="xs" className="sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            <Div type="row" align="center" gap="sm" className="flex-wrap">
              <P color="muted" className="text-[11px] font-semibold uppercase tracking-wider shrink-0">
                Card Type
              </P>
              <Tabs options={cardTabs} value={cardMode} onChange={setCardMode} className="w-full sm:w-64" />
            </Div>

            <Div type="row" align="center" gap="sm" className="flex-wrap">
              <P color="muted" className="text-[11px] font-semibold uppercase tracking-wider shrink-0">
                {STUDENT_PAGE.generate.chooseTemplate}
              </P>
              <Button
                variant={'default'}
                type="button"
                onClick={() => setGalleryOpen(true)}
                className="flex items-center gap-2 rounded-lg border px-3 py-2 hover:bg-muted/50 transition-colors"
                style={{ borderColor: "hsl(var(--border))" }}
              >
                <Span
                  className="h-3.5 w-3.5 rounded-full shrink-0"
                  style={{ background: CARD_THEMES[selectedTemplate].accent }}
                />
                <Span className="text-sm font-medium text-foreground">{currentTemplate?.label}</Span>
                <ChevronDown size={14} className="text-muted-foreground" />
              </Button>
            </Div>
          </Div>

          <Div
            type="row"
            align="center"
            justify="between"
            gap="sm"
            className="flex-wrap rounded-lg bg-muted/40 px-3 py-2"
          >
            <P className="text-xs">
              {savedTemplate ? (
                <>
                  This school uses <Span className="font-semibold">{templateLabel(savedTemplate)}</Span> for{" "}
                  {cardMode === "student" ? "ID cards" : "pickup cards"}. Want to change it?
                </>
              ) : (
                <>No template saved for this school yet — the one you pick is remembered for every card.</>
              )}
            </P>
            <Button type="button" size="xs" variant="outline" onClick={() => setGalleryOpen(true)}>
              {savedTemplate ? "Change template" : "Choose template"}
            </Button>
          </Div>

          <Div type="row" align="center" gap="sm" className="flex-wrap sm:justify-between">
            <Div type="row" align="center" gap="sm" className="flex-wrap">
              <P color="muted" className="text-[11px] font-semibold uppercase tracking-wider shrink-0">
                Whole class
              </P>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkPrint}
                disabled={!selectedClassId || isBulkBusy}
                title={selectedClassId ? `Print every card for ${bulkScopeLabel}` : "Select a class first"}
              >
                <Printer size={14} />
                Print all
              </Button>
              <Button
                size="sm"
                onClick={handleBulkDownload}
                disabled={!selectedClassId || isBulkBusy}
                loading={isLoadingBulk}
                title={selectedClassId ? `Download every card for ${bulkScopeLabel}` : "Select a class first"}
              >
                <FileArchive size={14} />
                {bulkProgress ? `Rendering ${bulkProgress.done}/${bulkProgress.total}…` : "Download all (ZIP)"}
              </Button>
              {bulkScopeLabel && (
                <P color="muted" className="text-xs">
                  {bulkScopeLabel}
                </P>
              )}
            </Div>
            <Div type="row" align="center" gap="sm" className="flex-wrap sm:justify-end">
              <Button variant="outline" size="sm" onClick={handlePrint} disabled={!hasData} className="flex-1 sm:flex-none">
                <Printer size={14} />
                {STUDENT_PAGE.buttons.printCard}
              </Button>
              <Button size="sm" onClick={handlePrint} disabled={!hasData} className="flex-1 sm:flex-none">
                <Download size={14} />
                {STUDENT_PAGE.buttons.downloadCard}
              </Button>
            </Div>
          </Div>
        </Div>

        {bulkItems && (
          <div
            id="bulk-print-area"
            ref={bulkAreaRef}
            aria-hidden
            style={{ position: "fixed", left: -100000, top: 0, display: "flex", flexWrap: "wrap", gap: 12 }}
          >
            {bulkItems.map((item) => (
              <div key={item.id_card.id} data-bulk-card className="inline-block bg-white p-1">
                <CardPreview
                  template={selectedTemplate}
                  mode={cardMode}
                  idCardData={item.id_card}
                  pickupCardData={{ student: item.id_card, parents: item.parents }}
                />
              </div>
            ))}
          </div>
        )}

        {/* ── Preview ──────────────────────────────────────────────────── */}
        <Div
          type="col"
          align="center"
          justify="center"
          className="flex-1 w-full rounded-2xl py-8 sm:py-10 px-3 overflow-x-auto"
          style={{ background: "hsl(var(--muted) / 0.25)", border: "1px dashed hsl(var(--border))" }}
        >
          {isCardLoading ? (
            <Div type="col" align="center" gap="md">
              <Spinner size="lg" />
              <P color="muted">Loading card data…</P>
            </Div>
          ) : !selectedStudentId ? (
            <Div type="col" align="center" gap="md" className="px-8 text-center">
              <Div
                className="h-14 w-14 rounded-2xl flex items-center justify-center"
                style={{ background: "hsl(var(--muted))" }}
              >
                <CreditCard size={26} className="text-muted-foreground" />
              </Div>
              <P color="muted">{STUDENT_PAGE.generate.noStudent}</P>
            </Div>
          ) : (
            // NOTE: kept as a raw <div> intentionally — it carries `ref={printRef}`
            // for window.print(), and the shared <Div> primitive does not forward refs.
            <ScaleToFit width={LAYOUT_DIMS[CARD_THEMES[selectedTemplate].layout].w}>
              <Div id="card-print-area" ref={printRef} className="mx-auto">
                <CardPreview
                  template={selectedTemplate}
                  mode={cardMode}
                  idCardData={idCardData}
                  pickupCardData={pickupCardData}
                />
              </Div>
            </ScaleToFit>
          )}
        </Div>
      </Div>

      {/* ── Template sandbox modal ────────────────────────────────────── */}
      <ResponsiveModalContainer
        isOpen={galleryOpen}
        onClose={() => setGalleryOpen(false)}
        title="Template Sandbox"
      >
        <Div className="px-4 py-4">
          <P color="muted" className="text-xs mb-3">
            Pick a design for the {cardMode === "student" ? "Student ID Card" : "Pickup Card"}. Previews use sample data.
          </P>
          <Div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CARD_TEMPLATES.map((t) => (
              <Div
                key={t.id}
                // type="button"
                onClick={() => {
                  setGalleryOpen(false);
                  void setSelectedTemplate(t.id);
                }}
                className="text-left rounded-xl border p-2.5 transition-all hover:shadow-md"
                style={{
                  borderColor: selectedTemplate === t.id ? "hsl(var(--primary))" : "hsl(var(--border))",
                  background: selectedTemplate === t.id ? "hsl(var(--primary) / 0.05)" : "hsl(var(--card))",
                }}
              >
                <TemplateThumb templateId={t.id} mode={cardMode} />
                <P className="text-xs font-semibold text-foreground mt-2">
                  {t.label}
                  {savedTemplate === t.id && <Span className="ml-1 text-[10px] font-medium text-primary">· School default</Span>}
                </P>
                <P className="text-[10.5px] text-muted-foreground mt-0.5 leading-snug">{t.description}</P>
              </Div>
            ))}
          </Div>
        </Div>
      </ResponsiveModalContainer>
    </>
  );
}

function GenerateContent() {
  const isMobile = useIsMobileReady();

  if (isMobile === undefined) {
    return (
      <Div type="row" justify="center" className="py-20">
        <Spinner size="lg" />
      </Div>
    );
  }

  return isMobile ? <StudentCardMobile /> : <GenerateDesktop />;
}

export default function GeneratePage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <GenerateContent />
    </Suspense>
  );
}