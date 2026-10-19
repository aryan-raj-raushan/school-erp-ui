"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button, MobileTextField } from "@/components/ui";

interface ExtraItem {
  description: string;
  amount: number;
  quantity?: number;
}

export interface BillingExtraItemsProps {
  items: ReadonlyArray<ExtraItem>;
  onAdd: () => void;
  onUpdate: (index: number, patch: Partial<ExtraItem>) => void;
  onRemove: (index: number) => void;
  copy: {
    heading: string;
    description: string;
    amount: string;
    quantity: string;
    remove: string;
    add: string;
  };
}

/** Phone-friendly editor for the extra line items on a generated invoice. */
export function BillingExtraItems({ items, onAdd, onUpdate, onRemove, copy }: BillingExtraItemsProps) {
  return (
    <section className="flex flex-col gap-3">
      <h3 className="px-1 text-sm font-semibold">{copy.heading}</h3>
      {items.map((item, index) => (
        <div
          key={index}
          className="flex flex-col gap-3 rounded-3xl border border-border/70 bg-muted/30 p-3"
        >
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-semibold">Item {index + 1}</span>
            <button
              type="button"
              aria-label={copy.remove}
              onClick={() => onRemove(index)}
              className="flex h-10 w-10 items-center justify-center rounded-full text-destructive active:bg-destructive/10"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <MobileTextField
            label={copy.description}
            value={item.description}
            onChange={(e) => onUpdate(index, { description: e.target.value })}
          />
          <div className="grid grid-cols-2 gap-3">
            <MobileTextField
              label={copy.amount}
              type="number"
              inputMode="decimal"
              value={item.amount || ""}
              onChange={(e) => onUpdate(index, { amount: Number(e.target.value) })}
            />
            <MobileTextField
              label={copy.quantity}
              type="number"
              inputMode="numeric"
              value={item.quantity ?? 1}
              onChange={(e) => onUpdate(index, { quantity: Number(e.target.value) })}
            />
          </div>
        </div>
      ))}
      <Button type="button" variant="outline" size="lg" onClick={onAdd}>
        <Plus size={18} /> {copy.add}
      </Button>
    </section>
  );
}
