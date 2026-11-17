"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { AlertTriangle, CircleHelp } from "lucide-react";
import { create } from "zustand";
import { cn } from "@/lib/utils";
import { useBackLayer } from "@/hooks/useBackLayer";
import { Div } from "./layout";
import { P, H3 } from "./typography";
import { Button } from "./button";

export interface ConfirmOptions {
  title: string;
  description?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  /** User must type this exact text before the confirm button enables. */
  confirmText?: string;
  /** Every statement must be ticked before the confirm button enables. */
  acknowledgements?: string[];
}

interface ConfirmDialogProps extends ConfirmOptions {
  onClose: () => void;
  onConfirm: () => void;
  busy?: boolean;
}

/** Compact confirmation dialog, centered and portalled to the body. */
export function ConfirmDialog({
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  destructive = false,
  confirmText,
  acknowledgements = [],
  busy,
}: ConfirmDialogProps) {
  const [typed, setTyped] = React.useState("");
  const [ticked, setTicked] = React.useState<boolean[]>(() => acknowledgements.map(() => false));
  useBackLayer(true, onClose);

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const textOk = !confirmText || typed.trim() === confirmText.trim();
  const acknowledged = ticked.every(Boolean);
  const canConfirm = textOk && acknowledged && !busy;

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[1100] flex items-center justify-center px-4 safe-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
        <motion.div
          role="alertdialog"
          aria-modal="true"
          className={cn(
            "relative z-10 w-full rounded-xl border border-border/50 bg-white shadow-lg dark:bg-neutral-900",
            confirmText || acknowledgements.length ? "max-w-md" : "max-w-sm",
          )}
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          <Div gap="md" className="p-5">
            <Div type="row" align="center" gap="sm">
              <Div
                className={cn(
                  "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
                  destructive ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary",
                )}
              >
                {destructive ? <AlertTriangle size={18} /> : <CircleHelp size={18} />}
              </Div>
              <H3 color="default" className="text-base font-semibold">
                {title}
              </H3>
            </Div>
            {description && (
              <div className="-mt-2 text-sm text-muted-foreground">{description}</div>
            )}
            {acknowledgements.length > 0 && (
              <Div gap="sm">
                {acknowledgements.map((statement, index) => (
                  <label key={statement} className="flex cursor-pointer items-start gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="mt-0.5 h-4 w-4 accent-destructive"
                      checked={ticked[index] ?? false}
                      onChange={(e) =>
                        setTicked((prev) => prev.map((v, i) => (i === index ? e.target.checked : v)))
                      }
                    />
                    <span>{statement}</span>
                  </label>
                ))}
              </Div>
            )}
            {confirmText && (
              <Div gap="xs">
                <P color="muted" className="text-xs">
                  Type <span className="font-semibold text-foreground">{confirmText}</span> to confirm
                </P>
                <input
                  autoFocus
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  className="h-10 rounded-[8px] border border-border bg-transparent px-3 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring"
                />
              </Div>
            )}
            <Div type="row" justify="end" gap="sm">
              <Button variant="outline" size="sm" onClick={onClose} disabled={busy}>
                {cancelLabel}
              </Button>
              <Button
                variant={destructive ? "destructive" : "default"}
                size="sm"
                onClick={onConfirm}
                disabled={!canConfirm}
                loading={busy}
              >
                {confirmLabel}
              </Button>
            </Div>
          </Div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

interface PendingConfirm extends ConfirmOptions {
  resolve: (confirmed: boolean) => void;
}

const useConfirmStore = create<{ pending: PendingConfirm | null }>(() => ({ pending: null }));

/** Opens a confirmation dialog and resolves to true only when the user confirms. */
export function confirmAction(options: ConfirmOptions): Promise<boolean> {
  return new Promise((resolve) => {
    useConfirmStore.getState().pending?.resolve(false);
    useConfirmStore.setState({ pending: { ...options, resolve } });
  });
}

export function ConfirmDialogHost() {
  const pending = useConfirmStore((s) => s.pending);
  if (!pending) return null;
  const { resolve, ...options } = pending;
  const settle = (confirmed: boolean) => {
    useConfirmStore.setState({ pending: null });
    resolve(confirmed);
  };
  return (
    <ConfirmDialog
      key={options.title + String(options.confirmText)}
      {...options}
      onClose={() => settle(false)}
      onConfirm={() => settle(true)}
    />
  );
}

export async function confirmDelete(
  subject: string,
  action: () => unknown,
  description: React.ReactNode = "This cannot be undone.",
): Promise<void> {
  const confirmed = await confirmAction({
    title: `Delete ${subject}?`,
    description,
    confirmLabel: "Delete",
    destructive: true,
  });
  if (confirmed) await action();
}

export function confirmCreate(
  subject: string,
  description: React.ReactNode = "Please check the details — this record will be saved now.",
): Promise<boolean> {
  return confirmAction({ title: `Create ${subject}?`, description, confirmLabel: "Create" });
}
