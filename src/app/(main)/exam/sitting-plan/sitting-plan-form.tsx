"use client";

import { Suspense, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, Users, X, Download } from "lucide-react";
import { useRoomSittingPlan } from "@/hooks/exam/useExamSittingAndAdmit";
import { SittingPlanService } from "@/services/exam.service";
import { PageHeader } from "@/components/ui/page-header";
import { Div, P, Button, Spinner } from "@/components/ui";
import { EXAM_ROUTES, SITTING_PLAN_PAGE } from "@/constants/exam.constants";
import type { StudentSlot } from "@/hooks/exam/useExamSittingAndAdmit";

interface DragPayload {
  studentId: string;
  fromSeatIndex: number | null;
}

// ── Pool Chip ─────────────────────────────────────────────────────────────────

function PoolChip({
  slot,
  draggingRef,
  onDragStart,
}: {
  slot: StudentSlot;
  draggingRef: React.MutableRefObject<DragPayload | null>;
  onDragStart: () => void;
}) {
  return (
    <Div
      draggable
      onDragStart={() => {
        draggingRef.current = { studentId: slot.student_id, fromSeatIndex: null };
        onDragStart();
      }}
      title={`${slot.name}${slot.roll_number ? ` #${slot.roll_number}` : ""}${slot.class_label ? ` · ${slot.class_label}` : ""}`}
      className="flex items-center gap-1.5 px-2 py-1 rounded border border-border bg-card hover:border-primary hover:bg-primary/5 cursor-grab active:cursor-grabbing select-none transition-colors"
    >
      {slot.class_label && (
        <P className="text-[8px] font-bold bg-primary/10 text-primary px-1 py-0.5 rounded shrink-0 leading-none">{slot.class_label}</P>
      )}
      <P className="text-[11px] font-medium truncate max-w-[100px]">{slot.name}</P>
      {slot.roll_number && (
        <P className="text-[9px] text-muted-foreground shrink-0">#{slot.roll_number}</P>
      )}
    </Div>
  );
}

// ── Seat Box ──────────────────────────────────────────────────────────────────

function SeatBox({
  index,
  slot,
  isDragging,
  draggingRef,
  onDragStart,
  onDrop,
  onRemove,
}: {
  index: number;
  slot: StudentSlot | null;
  isDragging: boolean;
  draggingRef: React.MutableRefObject<DragPayload | null>;
  onDragStart: () => void;
  onDrop: (i: number) => void;
  onRemove: (i: number) => void;
}) {
  const [over, setOver] = useState(false);
  const canDrop = isDragging && !slot;
  const saved = !!slot?.sitting_plan_id;
  const label = slot ? slot.name.split(" ").map((w) => w[0]).join("").toUpperCase().slice(0, 2) : null;

  return (
    <Div
      onDragOver={(e) => { if (canDrop) { e.preventDefault(); setOver(true); } }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); if (canDrop) onDrop(index); }}
      className={[
        "relative rounded flex flex-col items-center justify-center border transition-all select-none overflow-hidden",
        "w-full h-full min-h-[38px]",
        slot
          ? saved
            ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-950/50 dark:border-emerald-700"
            : "border-blue-400 bg-blue-50 dark:bg-blue-950/50 dark:border-blue-700"
          : over
          ? "border-2 border-primary bg-primary/10"
          : "border border-slate-400 dark:border-slate-500 bg-slate-50 dark:bg-slate-800 hover:border-slate-600 dark:hover:border-slate-400",
      ].join(" ")}
    >
      {/* seat number */}
      <P className="absolute top-[2px] left-[3px] text-[8px] text-slate-500 dark:text-slate-400 font-bold leading-none">
        {index + 1}
      </P>

      {slot ? (
        <>
          <Button
            onClick={() => onRemove(index)}
            className="absolute top-[1px] right-[2px] w-3 h-3 rounded-full bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 flex items-center justify-center z-10"
            title="Unassign"
          >
            <X size={6} className="text-red-600 dark:text-red-300" />
          </Button>
          <Div
            draggable
            onDragStart={() => {
              draggingRef.current = { studentId: slot.student_id, fromSeatIndex: index };
              onDragStart();
            }}
            className="flex flex-col items-center justify-center w-full h-full pt-2 cursor-grab active:cursor-grabbing"
            title={`${slot.name}${slot.roll_number ? ` #${slot.roll_number}` : ""}${slot.class_label ? ` · ${slot.class_label}` : ""}`}
          >
            <P
              className={[
                "text-[10px] font-bold leading-none",
                saved ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300",
              ].join(" ")}
            >
              {label}
            </P>
            {slot.roll_number && (
              <P className="text-[7px] opacity-50 mt-0.5">{slot.roll_number}</P>
            )}
            {slot.class_label && (
              <P className="text-[7px] opacity-40 mt-0.5 leading-none">{slot.class_label}</P>
            )}
          </Div>
        </>
      ) : (
        over && <P className="text-[9px] text-primary font-bold">+</P>
      )}
    </Div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

function RoomSittingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const hallDetailId = params.get("hall_detail_id") ?? "";
  const examId = params.get("exam_id") ?? "";
  const academicYearId = params.get("academic_year_id") ?? "";

  const {
    room,
    exam,
    seated,
    unassigned,
    isLoading,
    isSaving,
    hasChanges,
    newCount,
    movedCount,
    removedCount,
    movePoolToSeat,
    removeSeat,
    moveSeatToSeat,
    save,
  } = useRoomSittingPlan(hallDetailId, examId, academicYearId);

  const draggingRef = useRef<DragPayload | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

  async function handleDownloadPdf() {
    setIsDownloadingPdf(true);
    try {
      await SittingPlanService.downloadRoomPdf({
        hall_detail_id: hallDetailId,
        exam_ids: [examId],
        academic_year_id: academicYearId,
        room_name: room?.room_name,
      });
    } catch {
      // toast shown by service on error
    } finally {
      setIsDownloadingPdf(false);
    }
  }

  function endDrag() { draggingRef.current = null; setIsDragging(false); }

  function handleDropToSeat(toIdx: number) {
    const d = draggingRef.current;
    if (!d) return;
    d.fromSeatIndex === null
      ? movePoolToSeat(d.studentId, toIdx)
      : moveSeatToSeat(d.fromSeatIndex, toIdx);
    endDrag();
  }

  function handleDropToPool() {
    const d = draggingRef.current;
    if (d?.fromSeatIndex != null) removeSeat(d.fromSeatIndex);
    endDrag();
  }

  const occupiedCount = seated.filter(Boolean).length;
  const capacity = room?.sitting_capacity ?? 0;
  // Use defined grid or derive sensible columns from capacity
  const gridCols = room?.grid_cols ?? (capacity > 0 ? Math.ceil(Math.sqrt(capacity)) : 5);
  const gridRows = room?.grid_rows ?? (capacity > 0 ? Math.ceil(capacity / gridCols) : null);
  const pct = capacity > 0 ? Math.round((occupiedCount / capacity) * 100) : 0;
  const saveLabel = [newCount > 0 && `+${newCount}`, movedCount > 0 && `↔${movedCount}`, removedCount > 0 && `−${removedCount}`].filter(Boolean).join(" ");

  if (isLoading) return <Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>;
  if (!room) return <Div type="row" justify="center" className="py-20"><P color="muted">Room not found.</P></Div>;

  return (
    <Div type="col" gap="sm" className="h-[calc(100vh-72px)]" onDragEnd={endDrag}>
      {/* Header */}
      <PageHeader
        title={room.room_name}
        subtitle={[exam?.exam_name, room.grid_cols && room.grid_rows ? `${room.grid_rows}×${room.grid_cols} grid` : `${capacity} seats`].filter(Boolean).join(" · ")}
        actions={
          <Div type="row" gap="sm">
            {hasChanges && (
              <Button loading={isSaving} onClick={save} size="sm">
                <Save size={13} /> Save {saveLabel}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              loading={isDownloadingPdf}
              onClick={handleDownloadPdf}
              disabled={!room || seated.filter(Boolean).length === 0}
            >
              <Download size={13} /> {SITTING_PLAN_PAGE.buttons.roomPdf}
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push(EXAM_ROUTES.sittingPlan.list)}>
              <ArrowLeft size={13} /> Back
            </Button>
          </Div>
        }
      />

      {/* Stats */}
      <Div type="row" align="center" gap="sm" className="text-xs text-muted-foreground shrink-0">
        <P className="text-xs text-muted-foreground"><strong className="text-foreground">{occupiedCount}</strong>/{capacity} filled</P>
        <Div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
          <Div className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-400" : "bg-emerald-500"}`} style={{ width: `${pct}%` }} />
        </Div>
        <P className="text-xs text-muted-foreground"><strong className="text-foreground">{unassigned.length}</strong> unassigned</P>
        {hasChanges && (
          <P className="text-amber-600 dark:text-amber-400 font-medium text-xs">
            {[newCount > 0 && `+${newCount} new`, movedCount > 0 && `↔${movedCount} moved`, removedCount > 0 && `−${removedCount} removed`].filter(Boolean).join(", ")} · unsaved
          </P>
        )}
        <Div type="row" align="center" gap="sm" className="ml-auto text-[10px]">
          <P className="flex items-center gap-1 text-[10px]"><Div className="w-2.5 h-2.5 rounded-sm border-2 border-emerald-400 bg-emerald-50 dark:bg-emerald-950 inline-block" /> Saved</P>
          <P className="flex items-center gap-1 text-[10px]"><Div className="w-2.5 h-2.5 rounded-sm border-2 border-blue-400 bg-blue-50 dark:bg-blue-950 inline-block" /> New</P>
        </Div>
      </Div>

      {/* Body: left pool + right grid */}
      <Div type="row" gap="sm" className="flex-1 min-h-0">

        {/* Left — unassigned pool */}
        <Div
          onDragOver={(e) => { if (isDragging && draggingRef.current?.fromSeatIndex != null) e.preventDefault(); }}
          onDrop={(e) => { e.preventDefault(); handleDropToPool(); }}
          className={[
            "w-44 shrink-0 flex flex-col rounded-xl border-2 transition-colors",
            isDragging && draggingRef.current?.fromSeatIndex != null
              ? "border-amber-400 bg-amber-50/30 dark:bg-amber-950/10"
              : "border-border",
          ].join(" ")}
        >
          <Div type="row" align="center" gap="xs" className="px-3 py-2 border-b border-border bg-muted/40 rounded-t-xl shrink-0">
            <Users size={12} className="text-muted-foreground" />
            <P className="text-[11px] font-semibold">Unassigned</P>
            <P className="ml-auto text-[9px] bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded-full">{unassigned.length}</P>
          </Div>
          {isDragging && draggingRef.current?.fromSeatIndex != null && (
            <P className="text-center text-[9px] text-amber-600 dark:text-amber-400 font-medium py-1 bg-amber-50/50 dark:bg-amber-950/10 shrink-0">
              drop to unassign
            </P>
          )}
          <Div type="col" gap="xs" className="flex-1 overflow-y-auto p-2">
            {unassigned.length === 0
              ? <P className="text-[10px] text-muted-foreground text-center mt-4">All seated</P>
              : unassigned.map((s) => (
                  <PoolChip
                    key={s.student_id}
                    slot={s}
                    draggingRef={draggingRef}
                    onDragStart={() => setIsDragging(true)}
                  />
                ))
            }
          </Div>
        </Div>

        {/* Right — seat grid */}
        <Div className="flex-1 min-h-0 min-w-0 overflow-auto">
          <Div
            className="grid gap-1 w-full"
            style={{
              gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
              ...(gridRows ? { gridTemplateRows: `repeat(${gridRows}, minmax(36px, 1fr))` } : { alignContent: "start" }),
              minHeight: gridRows ? `${gridRows * 38}px` : undefined,
            }}
          >
            {seated.map((slot, i) => (
              <SeatBox
                key={i}
                index={i}
                slot={slot}
                isDragging={isDragging}
                draggingRef={draggingRef}
                onDragStart={() => setIsDragging(true)}
                onDrop={handleDropToSeat}
                onRemove={removeSeat}
              />
            ))}
          </Div>
        </Div>
      </Div>
    </Div>
  );
}

export { RoomSittingContent as SittingPlanFormContent };

export default function RoomSittingPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <RoomSittingContent />
    </Suspense>
  );
}
