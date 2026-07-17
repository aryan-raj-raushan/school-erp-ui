"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, MoreVertical, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Div } from "./layout";
import { P, H3 } from "./typography";
import { Button, buttonVariants } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { useIsMobile } from "./responsive-bottom-sheet";

export interface RowAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  variant?: "default" | "destructive";
  disabled?: boolean;
  /** Skip rendering this action — lets conditional actions stay declarative. */
  hidden?: boolean;
  /**
   * Require confirmation (via a responsive modal) before firing `onClick`.
   * Pass `true` for sensible defaults, or an object to customize the copy.
   */
  confirm?:
    | boolean
    | {
        title?: string;
        description?: string;
        confirmLabel?: string;
        cancelLabel?: string;
      };
}

export interface RowActionsProps {
  /** Additional actions shown in the overflow (⋮) menu. */
  actions: RowAction[];
  /** Optional dedicated view button rendered before the overflow menu. */
  onView?: () => void;
  viewLabel?: string;
}

function resolveConfirmCopy(action: RowAction) {
  const overrides = typeof action.confirm === "object" ? action.confirm : {};
  return {
    title: overrides.title ?? `Confirm ${action.label}`,
    description:
      overrides.description ??
      `Are you sure you want to ${action.label.toLowerCase()}? This action cannot be undone.`,
    confirmLabel: overrides.confirmLabel ?? action.label,
    cancelLabel: overrides.cancelLabel ?? "Cancel",
  };
}

interface ConfirmDialogProps {
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmLabel: string;
  cancelLabel: string;
  destructive: boolean;
}

/** Compact confirmation dialog: bottom sheet on mobile, centered dialog on desktop. */
function ConfirmDialog({
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel,
  cancelLabel,
  destructive,
}: ConfirmDialogProps) {
  const isMobile = useIsMobile();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const body = (
    <Div gap="md" className="p-5">
      <Div type="row" align="center" gap="sm">
        <Div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            destructive ? "bg-destructive/10 text-destructive" : "bg-muted text-muted-foreground",
          )}
        >
          <AlertTriangle size={18} />
        </Div>
        <H3 color="default" className="text-base font-semibold">
          {title}
        </H3>
      </Div>
      <P color="muted" className="-mt-2">
        {description}
      </P>
      <Div type="row" justify="end" gap="sm">
        <Button variant="outline" size="sm" onClick={onClose}>
          {cancelLabel}
        </Button>
        <Button variant={destructive ? "destructive" : "default"} size="sm" onClick={onConfirm}>
          {confirmLabel}
        </Button>
      </Div>
    </Div>
  );


  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-md" onClick={onClose} />
        <motion.div
          className="relative z-10 w-full max-w-sm rounded-xl border border-border/50 bg-white shadow-lg dark:bg-neutral-900"
          initial={{ opacity: 0, scale: 0.95, y: 8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 8 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        >
          {body}
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
  );
}

/**
 * Reusable row-actions cell for DataTable columns: an optional "view"
 * button plus an overflow (⋮) menu for the rest. Define the actions as
 * config (label + icon + onClick) instead of hand-writing a row of
 * `<Button>`s per column. Flag an action with `confirm` (e.g. delete) to
 * require confirmation via a responsive dialog — bottom sheet on mobile,
 * centered dialog on desktop — before `onClick` fires.
 */
export function RowActions({ actions, onView, viewLabel = "View" }: RowActionsProps) {
  const [pendingAction, setPendingAction] = React.useState<RowAction | null>(null);
  const visibleActions = actions.filter((action) => !action.hidden);

  function handleSelect(action: RowAction) {
    if (action.confirm) {
      setPendingAction(action);
    } else {
      action.onClick();
    }
  }
  

  function handleConfirm() {
    if (!pendingAction) return;
    pendingAction.onClick();
    setPendingAction(null);
  }

  if (!onView && visibleActions.length === 0) return null;

  const confirmCopy = pendingAction ? resolveConfirmCopy(pendingAction) : null;

  return (
    <>
      <Div type="row" gap="xs" align="center">
        {onView && (
          <Button size="icon-sm" variant="ghost" title={viewLabel} onClick={onView}>
            <Eye size={14} />
          </Button>
        )}

        {visibleActions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                title="More actions"
                className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
              >
                <MoreVertical size={14} />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {visibleActions.map((action, index) => (
                <DropdownMenuItem
                  key={index}
                  variant={action.variant === "destructive" ? "destructive" : "default"}
                  disabled={action.disabled}
                  onSelect={() => handleSelect(action)}
                  className="bg-white"
                >
                  {action.icon}
                  {action.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </Div>

      {pendingAction && confirmCopy && (
        <ConfirmDialog
          onClose={() => setPendingAction(null)}
          onConfirm={handleConfirm}
          title={confirmCopy.title}
          description={confirmCopy.description}
          confirmLabel={confirmCopy.confirmLabel}
          cancelLabel={confirmCopy.cancelLabel}
          destructive={pendingAction.variant === "destructive"}
        />
      )}
    </>
  );
}
