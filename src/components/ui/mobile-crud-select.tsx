"use client";

import * as React from "react";
import { Check, ChevronDown, Pencil, Plus, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { BottomSheet } from "./action-sheet";
import type { CrudDropdownItem } from "./crud-dropdown";

export interface MobileCrudSelectFieldProps {
  label: string;
  /** The selected item's name (these lists are keyed by name, not id). */
  value: string;
  onChange: (name: string) => void;
  items: ReadonlyArray<CrudDropdownItem>;
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  placeholder?: string;
  isLoading?: boolean;
  error?: string;
  required?: boolean;
}

const rowButton =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-full active:bg-muted";

/**
 * Phone version of `CrudDropdown`: a field that opens a bottom sheet where
 * options can be picked, renamed, deleted or added.
 */
export function MobileCrudSelectField({
  label,
  value,
  onChange,
  items,
  onAdd,
  onUpdate,
  onDelete,
  placeholder = "Select",
  isLoading,
  error,
  required,
}: MobileCrudSelectFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editValue, setEditValue] = React.useState("");
  const [addValue, setAddValue] = React.useState("");
  const [isBusy, setIsBusy] = React.useState(false);

  function close() {
    setOpen(false);
    setEditingId(null);
    setAddValue("");
  }

  function choose(name: string) {
    void haptic("light");
    onChange(name);
    close();
  }

  async function run(action: () => Promise<void>) {
    setIsBusy(true);
    try {
      await action();
    } finally {
      setIsBusy(false);
    }
  }

  async function saveEdit(item: CrudDropdownItem) {
    const name = editValue.trim();
    if (!name) return;
    await run(async () => {
      await onUpdate(item.id, name);
      if (value === item.name) onChange(name);
      setEditingId(null);
    });
  }

  async function add() {
    const name = addValue.trim();
    if (!name) return;
    await run(async () => {
      await onAdd(name);
      setAddValue("");
    });
  }

  return (
    <div data-invalid={error ? "true" : undefined}>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2 rounded-2xl border bg-white px-4 py-2 text-left dark:bg-neutral-900",
          error ? "border-destructive" : "border-border",
        )}
      >
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
            {required && <span className="ml-0.5 text-destructive">*</span>}
          </span>
          <span
            className={cn(
              "block h-7 truncate text-base leading-7",
              value ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            {value || placeholder}
          </span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
      </button>
      {error && <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{error}</p>}

      <BottomSheet isOpen={open} onClose={close} title={label} maxHeight="80dvh">
        {isLoading && <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>}
        <ul className="flex flex-col">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-1 border-b border-border/40 last:border-0">
              {editingId === item.id ? (
                <>
                  <input
                    autoFocus
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
                  />
                  <button
                    type="button"
                    aria-label="Save"
                    disabled={isBusy}
                    onClick={() => void saveEdit(item)}
                    className={cn(rowButton, "text-primary-text")}
                  >
                    <Check size={20} />
                  </button>
                  <button
                    type="button"
                    aria-label="Cancel"
                    onClick={() => setEditingId(null)}
                    className={cn(rowButton, "text-muted-foreground")}
                  >
                    <X size={20} />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => choose(item.name)}
                    className="flex h-12 min-w-0 flex-1 items-center gap-2 text-left text-base"
                  >
                    <span className="truncate">{item.name}</span>
                    {item.name === value && <Check size={18} className="shrink-0 text-primary-text" />}
                  </button>
                  <button
                    type="button"
                    aria-label={`Rename ${item.name}`}
                    onClick={() => {
                      setEditingId(item.id);
                      setEditValue(item.name);
                    }}
                    className={cn(rowButton, "text-muted-foreground")}
                  >
                    <Pencil size={18} />
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${item.name}`}
                    disabled={isBusy}
                    onClick={() => void run(() => onDelete(item.id))}
                    className={cn(rowButton, "text-destructive")}
                  >
                    <Trash2 size={18} />
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>

        <div className="mt-3 flex items-center gap-2 rounded-2xl border border-border px-3">
          <input
            value={addValue}
            onChange={(e) => setAddValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                void add();
              }
            }}
            placeholder="Add new…"
            className="h-12 min-w-0 flex-1 bg-transparent text-base outline-none"
          />
          <button
            type="button"
            aria-label="Add"
            disabled={isBusy || !addValue.trim()}
            onClick={() => void add()}
            className={cn(rowButton, "text-primary-text disabled:opacity-40")}
          >
            <Plus size={20} />
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}
