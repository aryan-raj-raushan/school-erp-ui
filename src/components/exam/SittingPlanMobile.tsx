"use client";

import { useState } from "react";
import { Download, MoveRight, Save, UserMinus, Users, X } from "lucide-react";
import {
  ActionSheet,
  BottomSheet,
  Button,
  ListAvatar,
  StickyActionBar,
} from "@/components/ui";
import { haptic } from "@/lib/haptics";
import type { StudentSlot } from "@/hooks/exam/useExamSittingAndAdmit";

type Held = { studentId: string; fromSeat: number | null; name: string };

export interface SittingPlanMobileProps {
  roomName: string;
  subtitle: string;
  seated: ReadonlyArray<StudentSlot | null>;
  unassigned: ReadonlyArray<StudentSlot>;
  gridCols: number;
  capacity: number;
  hasChanges: boolean;
  changeSummary: string;
  isSaving: boolean;
  isDownloadingPdf: boolean;
  canDownload: boolean;
  onAssign: (studentId: string, seatIndex: number) => void;
  onMove: (fromSeat: number, toSeat: number) => void;
  onUnassign: (seatIndex: number) => void;
  onSave: () => void;
  onDownload: () => void;
}

const SEAT_MIN_PX = 44;

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Touch layout for the exam seating editor. Drag-and-drop doesn't exist on
 * phones, so seating is tap-based: pick a student from the Unassigned
 * sheet (or a seated student to move), then tap the target seat.
 */
export function SittingPlanMobile({
  roomName,
  subtitle,
  seated,
  unassigned,
  gridCols,
  capacity,
  hasChanges,
  changeSummary,
  isSaving,
  isDownloadingPdf,
  canDownload,
  onAssign,
  onMove,
  onUnassign,
  onSave,
  onDownload,
}: SittingPlanMobileProps) {
  const [poolOpen, setPoolOpen] = useState(false);
  const [held, setHeld] = useState<Held | null>(null);
  const [seatMenu, setSeatMenu] = useState<number | null>(null);

  const occupied = seated.filter(Boolean).length;
  const percent = capacity > 0 ? Math.round((occupied / capacity) * 100) : 0;
  const menuSlot = seatMenu === null ? null : seated[seatMenu];

  function tapSeat(index: number) {
    const slot = seated[index];
    if (held && !slot) {
      void haptic("success");
      if (held.fromSeat === null) onAssign(held.studentId, index);
      else onMove(held.fromSeat, index);
      setHeld(null);
      return;
    }
    if (slot) {
      void haptic("light");
      setSeatMenu(index);
    }
  }

  function pickFromPool(slot: StudentSlot) {
    void haptic("light");
    setHeld({ studentId: slot.student_id, fromSeat: null, name: slot.name });
    setPoolOpen(false);
  }

  return (
    <div className="flex flex-col gap-4 pt-3">
      <header>
        <h1 className="text-xl font-bold">{roomName}</h1>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-3 flex items-center gap-3">
          <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full ${
                percent >= 100 ? "bg-red-500" : percent >= 80 ? "bg-amber-400" : "bg-emerald-500"
              }`}
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            {occupied}/{capacity} seated
          </span>
        </div>
        {hasChanges && (
          <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
            {changeSummary} · unsaved
          </p>
        )}
      </header>

      {held ? (
        <div className="flex items-center gap-3 rounded-2xl bg-primary/10 p-3 text-sm">
          <MoveRight size={18} className="shrink-0 text-primary-text" />
          <span className="min-w-0 flex-1 truncate">
            Tap an empty seat for <strong>{held.name}</strong>
          </span>
          <button
            type="button"
            aria-label="Cancel"
            onClick={() => setHeld(null)}
            className="flex h-9 w-9 items-center justify-center rounded-full active:bg-muted"
          >
            <X size={18} />
          </button>
        </div>
      ) : (
        <Button type="button" variant="outline" size="lg" onClick={() => setPoolOpen(true)}>
          <Users size={18} /> Unassigned · {unassigned.length}
        </Button>
      )}

      <div className="overflow-x-auto pb-1">
        <div
          className="grid gap-1.5"
          style={{
            gridTemplateColumns: `repeat(${gridCols}, minmax(${SEAT_MIN_PX}px, 1fr))`,
          }}
        >
          {seated.map((slot, index) => {
            const saved = Boolean(slot?.sitting_plan_id);
            const target = held && !slot;
            return (
              <button
                key={index}
                type="button"
                onClick={() => tapSeat(index)}
                aria-label={slot ? `Seat ${index + 1}: ${slot.name}` : `Empty seat ${index + 1}`}
                className={`relative flex aspect-square flex-col items-center justify-center rounded-xl border text-center active:scale-95 ${
                  slot
                    ? saved
                      ? "border-emerald-400 bg-emerald-50 dark:border-emerald-700 dark:bg-emerald-950/50"
                      : "border-blue-400 bg-blue-50 dark:border-blue-700 dark:bg-blue-950/50"
                    : target
                      ? "animate-pulse border-2 border-dashed border-primary bg-primary/10"
                      : "border-border bg-muted/40"
                }`}
              >
                <span className="absolute left-1 top-0.5 text-[9px] font-bold text-muted-foreground">
                  {index + 1}
                </span>
                {slot && (
                  <>
                    <span
                      className={`text-xs font-bold ${
                        saved ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"
                      }`}
                    >
                      {initials(slot.name)}
                    </span>
                    {slot.roll_number && (
                      <span className="text-[9px] text-muted-foreground">{slot.roll_number}</span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex gap-4 text-[11px] text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-emerald-400 bg-emerald-50" /> Saved
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded border-2 border-blue-400 bg-blue-50" /> New
        </span>
      </div>

      <StickyActionBar>
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="flex-1"
          disabled={!canDownload}
          loading={isDownloadingPdf}
          onClick={onDownload}
        >
          <Download size={18} /> PDF
        </Button>
        <Button
          type="button"
          size="lg"
          className="flex-[2]"
          disabled={!hasChanges}
          loading={isSaving}
          onClick={onSave}
        >
          <Save size={18} /> Save plan
        </Button>
      </StickyActionBar>

      <BottomSheet
        isOpen={poolOpen}
        onClose={() => setPoolOpen(false)}
        title={`Unassigned (${unassigned.length})`}
        maxHeight="80dvh"
      >
        {unassigned.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">Everyone is seated</p>
        ) : (
          <ul>
            {unassigned.map((slot) => (
              <li key={slot.student_id}>
                <button
                  type="button"
                  onClick={() => pickFromPool(slot)}
                  className="flex min-h-16 w-full items-center gap-3 rounded-xl px-2 text-left active:bg-muted"
                >
                  <ListAvatar name={slot.name} size={40} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[15px] font-medium">{slot.name}</span>
                    <span className="block truncate text-xs text-muted-foreground">
                      {[slot.class_label, slot.roll_number ? `Roll ${slot.roll_number}` : null]
                        .filter(Boolean)
                        .join(" · ")}
                    </span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </BottomSheet>

      <ActionSheet
        isOpen={menuSlot !== null}
        onClose={() => setSeatMenu(null)}
        title={menuSlot?.name}
        subtitle={seatMenu === null ? undefined : `Seat ${seatMenu + 1}`}
        actions={
          menuSlot && seatMenu !== null
            ? [
                {
                  label: "Move to another seat",
                  icon: <MoveRight size={18} />,
                  onClick: () =>
                    setHeld({ studentId: menuSlot.student_id, fromSeat: seatMenu, name: menuSlot.name }),
                },
                {
                  label: "Unassign",
                  icon: <UserMinus size={18} />,
                  destructive: true,
                  onClick: () => onUnassign(seatMenu),
                },
              ]
            : []
        }
      />
    </div>
  );
}
