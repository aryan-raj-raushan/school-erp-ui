"use client";

import * as React from "react";
import { Eye, MoreVertical } from "lucide-react";
import { Div } from "./layout";
import { Button, buttonVariants } from "./button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "./dropdown-menu";
import { useIsMobileSync } from "@/hooks/useIsMobileSync";
import { ActionSheet, type SheetAction } from "./action-sheet";
import { ConfirmDialog } from "./confirm-dialog";

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

const DESTRUCTIVE_LABEL = /^(delete|remove|deactivate|disable|revoke|unassign|cancel)\b/i;

function needsConfirm(action: RowAction): boolean {
  if (action.confirm === false) return false;
  return Boolean(action.confirm) || action.variant === "destructive" || DESTRUCTIVE_LABEL.test(action.label);
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

/**
 * Reusable row-actions cell for DataTable columns: an optional "view"
 * button plus an overflow (⋮) menu for the rest. Define the actions as
 * config (label + icon + onClick) instead of hand-writing a row of
 * `<Button>`s per column. Flag an action with `confirm` (e.g. delete) to
 * require confirmation via a responsive dialog — bottom sheet on mobile,
 * centered dialog on desktop — before `onClick` fires.
 */
export function RowActions({ actions, onView, viewLabel = "View" }: RowActionsProps) {
  const isMobile = useIsMobileSync();
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [pendingAction, setPendingAction] = React.useState<RowAction | null>(null);
  const visibleActions = actions.filter((action) => !action.hidden);

  function handleSelect(action: RowAction) {
    if (needsConfirm(action)) {
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

  if (isMobile) {
    const sheetActions: SheetAction[] = visibleActions.map((action) => {
      const copy = needsConfirm(action) ? resolveConfirmCopy(action) : null;
      return {
        label: action.label,
        icon: action.icon,
        destructive: action.variant === "destructive",
        onClick: action.onClick,
        confirm: copy
          ? { title: copy.title, description: copy.description, confirmLabel: copy.confirmLabel }
          : action.confirm === false
            ? false
            : undefined,
      };
    });

    return (
      <>
        <Div type="row" gap="xs" align="center">
          {onView && (
            <button
              type="button"
              aria-label={viewLabel}
              onClick={onView}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            >
              <Eye size={20} />
            </button>
          )}
          {visibleActions.length > 0 && (
            <button
              type="button"
              aria-label="More actions"
              onClick={() => setSheetOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
            >
              <MoreVertical size={20} />
            </button>
          )}
        </Div>
        <ActionSheet
          isOpen={sheetOpen}
          onClose={() => setSheetOpen(false)}
          actions={sheetActions}
        />
      </>
    );
  }

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
                  className="bg-popover"
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
          destructive={pendingAction.variant === "destructive" || DESTRUCTIVE_LABEL.test(pendingAction.label)}
        />
      )}
    </>
  );
}
