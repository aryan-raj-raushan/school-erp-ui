"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import {
  AnimatePresence,
  motion,
  useDragControls,
  type PanInfo,
} from "framer-motion";
import { X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { useBackLayer } from "@/hooks/useBackLayer";

const subscribeNoop = () => () => {};

// ─── BottomSheet ──────────────────────────────────────────────────────────────

export interface BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  /** Pinned below the scrolling body (e.g. Apply / Clear buttons). */
  footer?: React.ReactNode;
  /** Cap on sheet height. Defaults to 85% of the dynamic viewport. */
  maxHeight?: string;
}

/**
 * Native-feeling mobile bottom sheet: drag the handle/header down to dismiss,
 * body scroll is locked while open, and the footer respects the home-indicator
 * safe area. Use `ActionSheet` for a list of tappable actions.
 */
export function BottomSheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxHeight = "85dvh",
}: BottomSheetProps) {
  const dragControls = useDragControls();
  useBackLayer(isOpen, onClose);
  const mounted = React.useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  // Lock the scrolling container (<main>) while open so the page behind
  // doesn't move under the sheet.
  React.useEffect(() => {
    if (!isOpen) return;
    const main = document.querySelector("main") as HTMLElement | null;
    const prev = main?.style.overflow ?? "";
    if (main) main.style.overflow = "hidden";
    return () => {
      if (main) main.style.overflow = prev;
    };
  }, [isOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  function onDragEnd(_: unknown, info: PanInfo) {
    if (info.offset.y > 90 || info.velocity.y > 500) onClose();
  }

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="sheet"
          className="fixed inset-0 z-[60] flex flex-col justify-end"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div className="absolute inset-0 bg-black/45" onClick={onClose} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex w-full flex-col rounded-t-3xl bg-white shadow-2xl dark:bg-neutral-900"
            style={{ maxHeight }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 380, damping: 38 }}
            drag="y"
            dragListener={false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.6 }}
            onDragEnd={onDragEnd}
          >
            {/* Only the handle strip starts a drag so the body still scrolls. */}
            <div
              className="flex h-6 shrink-0 touch-none items-center justify-center"
              onPointerDown={(e) => dragControls.start(e)}
            >
              <div className="h-1.5 w-10 rounded-full bg-muted-foreground/30" />
            </div>
            {title && (
              <div className="flex shrink-0 items-center justify-between px-5 pb-2">
                <h2 className="text-base font-semibold">{title}</h2>
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close"
                  className="flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
                >
                  <X size={18} />
                </button>
              </div>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-4">
              {children}
            </div>
            {footer && (
              <div
                className="shrink-0 border-t border-border/60 px-5 pt-3"
                style={{ paddingBottom: "calc(12px + var(--sab, 0px))" }}
              >
                {footer}
              </div>
            )}
            {!footer && <div style={{ height: "var(--sab, 0px)" }} />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
}

// ─── ActionSheet ──────────────────────────────────────────────────────────────

export interface SheetAction {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  destructive?: boolean;
  hidden?: boolean;
  /** Destructive actions ask for a second tap inside the same sheet. */
  confirm?: { title?: string; description?: string; confirmLabel?: string };
}

export interface ActionSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  actions: SheetAction[];
}

export function ActionSheet({
  isOpen,
  onClose,
  title,
  subtitle,
  actions,
}: ActionSheetProps) {
  const [pending, setPending] = React.useState<SheetAction | null>(null);

  function close() {
    setPending(null);
    onClose();
  }

  const visible = actions.filter((a) => !a.hidden);

  function run(action: SheetAction) {
    void haptic("light");
    if (action.confirm) {
      setPending(action);
      return;
    }
    close();
    action.onClick();
  }

  function confirm() {
    if (!pending) return;
    void haptic("warning");
    const action = pending;
    close();
    action.onClick();
  }

  return (
    <BottomSheet isOpen={isOpen} onClose={close}>
      {pending ? (
        <div className="flex flex-col gap-4 pt-1">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle size={20} />
            </div>
            <div className="min-w-0">
              <h3 className="text-base font-semibold">
                {pending.confirm?.title ?? `${pending.label}?`}
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                {pending.confirm?.description ??
                  "This action cannot be undone."}
              </p>
            </div>
          </div>
          <div className="flex gap-3 pb-1">
            <button
              type="button"
              onClick={() => setPending(null)}
              className="h-12 flex-1 rounded-2xl border border-border text-sm font-semibold active:bg-muted"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={confirm}
              className="h-12 flex-1 rounded-2xl bg-destructive text-sm font-semibold text-white active:opacity-80"
            >
              {pending.confirm?.confirmLabel ?? pending.label}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col">
          {(title || subtitle) && (
            <div className="px-1 pb-3 pt-1">
              {title && (
                <p className="truncate text-base font-semibold">{title}</p>
              )}
              {subtitle && (
                <p className="truncate text-xs text-muted-foreground">
                  {subtitle}
                </p>
              )}
            </div>
          )}
          <ul className="flex flex-col">
            {visible.map((action) => (
              <li key={action.label}>
                <button
                  type="button"
                  onClick={() => run(action)}
                  className={cn(
                    "flex h-14 w-full items-center gap-4 rounded-xl px-2 text-left text-[15px] font-medium active:bg-muted",
                    action.destructive && "text-destructive",
                  )}
                >
                  {action.icon && (
                    <span
                      className={cn(
                        "flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                        action.destructive
                          ? "bg-destructive/10"
                          : "bg-muted text-foreground",
                      )}
                    >
                      {action.icon}
                    </span>
                  )}
                  {action.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </BottomSheet>
  );
}
