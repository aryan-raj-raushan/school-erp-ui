"use client";

import * as React from "react";
import {
  Controller,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Camera, Check, ChevronDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { haptic } from "@/lib/haptics";
import { BottomSheet } from "./action-sheet";
import { Switch } from "./switch";
import { ListAvatar } from "./mobile-list";

const fieldShell =
  "rounded-2xl border bg-white px-4 transition-colors dark:bg-neutral-900";

function fieldBorder(error?: string, focused?: boolean) {
  if (error) return "border-destructive";
  return focused ? "border-primary ring-2 ring-ring/30" : "border-border";
}

function FieldLabel({ label, required }: { label: string; required?: boolean }) {
  return (
    <span className="block text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
      {label}
      {required && <span className="ml-0.5 text-destructive">*</span>}
    </span>
  );
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="mt-1.5 px-1 text-xs font-medium text-destructive">{message}</p>;
}

// ─── MobileTextField ──────────────────────────────────────────────────────────

export interface MobileTextFieldProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "prefix"> {
  label: string;
  error?: string;
  /** Fixed text shown before the value (e.g. a dial code). */
  prefix?: string;
}

/**
 * App-style text input: the label sits inside the field above the value,
 * and the whole box is the tap target. Works with `register()` spreads.
 */
export const MobileTextField = React.forwardRef<HTMLInputElement, MobileTextFieldProps>(
  ({ label, error, prefix, required, className, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <div data-invalid={error ? "true" : undefined} className={className}>
        <label className={cn("block py-2", fieldShell, fieldBorder(error, focused))}>
          <FieldLabel label={label} required={required} />
          <span className="flex items-center gap-2">
            {prefix && <span className="text-base text-muted-foreground">{prefix}</span>}
            <input
              ref={ref}
              required={false}
              autoComplete="off"
              className="h-7 w-full min-w-0 bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60 disabled:opacity-60"
              onFocus={(e) => {
                setFocused(true);
                onFocus?.(e);
              }}
              onBlur={(e) => {
                setFocused(false);
                onBlur?.(e);
              }}
              {...props}
            />
          </span>
        </label>
        <FieldError message={error} />
      </div>
    );
  },
);
MobileTextField.displayName = "MobileTextField";

// ─── MobileTextArea ───────────────────────────────────────────────────────────

export interface MobileTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
}

export const MobileTextArea = React.forwardRef<HTMLTextAreaElement, MobileTextAreaProps>(
  ({ label, error, required, className, onFocus, onBlur, ...props }, ref) => {
    const [focused, setFocused] = React.useState(false);
    return (
      <div data-invalid={error ? "true" : undefined} className={className}>
        <label className={cn("block py-2", fieldShell, fieldBorder(error, focused))}>
          <FieldLabel label={label} required={required} />
          <textarea
            ref={ref}
            rows={3}
            className="mt-0.5 w-full resize-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground/60"
            onFocus={(e) => {
              setFocused(true);
              onFocus?.(e);
            }}
            onBlur={(e) => {
              setFocused(false);
              onBlur?.(e);
            }}
            {...props}
          />
        </label>
        <FieldError message={error} />
      </div>
    );
  },
);
MobileTextArea.displayName = "MobileTextArea";

// ─── MobileSelectField ────────────────────────────────────────────────────────

export interface SelectOption {
  readonly value: string;
  readonly label: string;
}

export interface MobileSelectFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<SelectOption>;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  /** Shows a search box inside the sheet. Defaults to on for long lists. */
  searchable?: boolean;
  className?: string;
}

const SEARCH_THRESHOLD = 8;

/** Field that opens a bottom sheet of options — no native <select> popups. */
export function MobileSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  required,
  disabled,
  searchable,
  className,
}: MobileSelectFieldProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selected = options.find((o) => o.value === value);
  const showSearch = searchable ?? options.length > SEARCH_THRESHOLD;
  const visible = query
    ? options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
    : options;

  function close() {
    setOpen(false);
    setQuery("");
  }

  function choose(next: string) {
    void haptic("light");
    onChange(next);
    close();
  }

  return (
    <div data-invalid={error ? "true" : undefined} className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2 py-2 text-left disabled:opacity-50",
          fieldShell,
          fieldBorder(error),
        )}
      >
        <span className="min-w-0 flex-1">
          <FieldLabel label={label} required={required} />
          <span
            className={cn(
              "block h-7 truncate text-base leading-7",
              selected ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            {selected?.label ?? placeholder}
          </span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
      </button>
      <FieldError message={error} />

      <BottomSheet isOpen={open} onClose={close} title={label} maxHeight="80dvh">
        {showSearch && (
          <div className="relative mb-3">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search"
              className="h-11 w-full rounded-xl border border-border bg-transparent pl-10 pr-3 text-base outline-none focus:border-primary"
            />
          </div>
        )}
        {visible.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            No options available
          </p>
        ) : (
          <ul>
            {visible.map((option) => {
              const active = option.value === value;
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => choose(option.value)}
                    className={cn(
                      "flex min-h-14 w-full items-center justify-between gap-3 rounded-xl px-2 text-left text-[15px] active:bg-muted",
                      active && "font-semibold text-primary-text",
                    )}
                  >
                    {option.label}
                    {active && <Check size={18} />}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </BottomSheet>
    </div>
  );
}

// ─── MobileMultiSelectField ───────────────────────────────────────────────────

export interface MobileMultiSelectFieldProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: ReadonlyArray<SelectOption>;
  placeholder?: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
}

/** Like `MobileSelectField`, but several options can be ticked before tapping Done. */
export function MobileMultiSelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select",
  error,
  required,
  disabled,
  className,
}: MobileMultiSelectFieldProps) {
  const [open, setOpen] = React.useState(false);

  const selectedLabels = options.filter((o) => value.includes(o.value)).map((o) => o.label);
  const summary =
    selectedLabels.length === 0
      ? placeholder
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.length} selected`;

  function toggle(optionValue: string) {
    void haptic("light");
    onChange(
      value.includes(optionValue)
        ? value.filter((v) => v !== optionValue)
        : [...value, optionValue],
    );
  }

  return (
    <div data-invalid={error ? "true" : undefined} className={className}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(true)}
        className={cn(
          "flex w-full items-center gap-2 py-2 text-left disabled:opacity-50",
          fieldShell,
          fieldBorder(error),
        )}
      >
        <span className="min-w-0 flex-1">
          <FieldLabel label={label} required={required} />
          <span
            className={cn(
              "block h-7 truncate text-base leading-7",
              selectedLabels.length ? "text-foreground" : "text-muted-foreground/60",
            )}
          >
            {summary}
          </span>
        </span>
        <ChevronDown size={18} className="shrink-0 text-muted-foreground" />
      </button>
      <FieldError message={error} />

      <BottomSheet
        isOpen={open}
        onClose={() => setOpen(false)}
        title={label}
        maxHeight="80dvh"
        footer={
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-12 w-full rounded-2xl bg-primary text-sm font-semibold text-primary-foreground active:opacity-80"
          >
            Done{value.length > 0 ? ` · ${value.length}` : ""}
          </button>
        }
      >
        <ul>
          {options.map((option) => {
            const active = value.includes(option.value);
            return (
              <li key={option.value}>
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={active}
                  onClick={() => toggle(option.value)}
                  className="flex min-h-14 w-full items-center gap-3 rounded-xl px-2 text-left text-[15px] active:bg-muted"
                >
                  <span
                    className={cn(
                      "flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2",
                      active ? "border-primary bg-primary text-primary-foreground" : "border-border",
                    )}
                  >
                    {active && <Check size={14} />}
                  </span>
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      </BottomSheet>
    </div>
  );
}

// ─── ChoiceChips ──────────────────────────────────────────────────────────────

export interface ChoiceChipsProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: ReadonlyArray<SelectOption>;
  error?: string;
  required?: boolean;
  className?: string;
}

/** Single choice from a short list, shown as large tappable chips. */
export function ChoiceChips({
  label,
  value,
  onChange,
  options,
  error,
  required,
  className,
}: ChoiceChipsProps) {
  return (
    <div data-invalid={error ? "true" : undefined} className={className}>
      <p className="mb-2 px-1">
        <FieldLabel label={label} required={required} />
      </p>
      <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => {
                void haptic("light");
                onChange(option.value);
              }}
              className={cn(
                "h-11 rounded-full border px-5 text-[15px] font-medium transition-colors active:scale-95",
                active
                  ? "border-transparent text-[color:var(--theme-active-text)]"
                  : "border-border bg-white text-foreground dark:bg-neutral-900",
              )}
              style={
                active
                  ? {
                      background:
                        "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
                    }
                  : undefined
              }
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <FieldError message={error} />
    </div>
  );
}

// ─── ToggleRow ────────────────────────────────────────────────────────────────

export interface ToggleRowProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function ToggleRow({ label, description, checked, onChange, disabled }: ToggleRowProps) {
  return (
    <label className="flex min-h-14 items-center justify-between gap-4 rounded-2xl border border-border bg-white px-4 py-2.5 dark:bg-neutral-900">
      <span className="min-w-0">
        <span className="block text-[15px] font-medium">{label}</span>
        {description && (
          <span className="block text-xs text-muted-foreground">{description}</span>
        )}
      </span>
      <Switch
        checked={checked}
        disabled={disabled}
        onCheckedChange={(next) => {
          void haptic("light");
          onChange(next);
        }}
        className="h-7 w-12 [&>span]:h-6 [&>span]:w-6 [&>span]:data-[state=checked]:translate-x-5"
      />
    </label>
  );
}

// ─── react-hook-form bindings ─────────────────────────────────────────────────

interface Bound<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export function ControlledSelectField<T extends FieldValues>({
  control,
  name,
  ...props
}: Bound<T> & Omit<MobileSelectFieldProps, "value" | "onChange" | "error">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <MobileSelectField
          {...props}
          value={(field.value as string | undefined) ?? ""}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function ControlledChoiceChips<T extends FieldValues>({
  control,
  name,
  ...props
}: Bound<T> & Omit<ChoiceChipsProps, "value" | "onChange" | "error">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field, fieldState }) => (
        <ChoiceChips
          {...props}
          value={(field.value as string | undefined) ?? ""}
          onChange={field.onChange}
          error={fieldState.error?.message}
        />
      )}
    />
  );
}

export function ControlledToggleRow<T extends FieldValues>({
  control,
  name,
  ...props
}: Bound<T> & Omit<ToggleRowProps, "checked" | "onChange">) {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <ToggleRow {...props} checked={Boolean(field.value)} onChange={field.onChange} />
      )}
    />
  );
}

// ─── Layout helpers ───────────────────────────────────────────────────────────

/** Titled group of related fields. */
export function FormGroup({
  title,
  description,
  children,
  className,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("flex flex-col gap-3", className)}>
      {(title || description) && (
        <header className="px-1">
          {title && <h3 className="text-sm font-semibold">{title}</h3>}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </header>
      )}
      {children}
    </section>
  );
}

/** Two short fields side by side (height / weight, city / state …). */
export function FieldRow({ children }: { children: React.ReactNode }) {
  return <div className="grid grid-cols-2 gap-3">{children}</div>;
}

/** Large heading that opens each step of a multi-step form. */
export function StepHeader({
  icon,
  title,
  description,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
}) {
  return (
    <header className="flex items-start gap-3 px-1 pb-1 pt-2">
      {icon && (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary-text">
          {icon}
        </span>
      )}
      <div className="min-w-0">
        <h2 className="text-xl font-bold leading-tight">{title}</h2>
        {description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </header>
  );
}

// ─── PhotoHero ────────────────────────────────────────────────────────────────

export interface PhotoHeroProps {
  url: string | null;
  name?: string;
  isUploading?: boolean;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  /** Native camera/gallery prompt; used instead of the web file input when set. */
  onPick?: () => void;
}

/** Centred avatar with a camera badge — the first thing on a profile form. */
export function PhotoHero({
  url,
  name = "",
  isUploading,
  onFileChange,
  inputRef,
  onPick,
}: PhotoHeroProps) {
  const fallbackRef = React.useRef<HTMLInputElement>(null);
  const ref = inputRef ?? fallbackRef;
  const open = () => (onPick ? onPick() : ref.current?.click());

  return (
    <div className="flex flex-col items-center gap-2 py-2">
      <button
        type="button"
        onClick={open}
        disabled={isUploading}
        aria-label={url ? "Change photo" : "Add photo"}
        className="relative active:scale-95"
      >
        {url || name ? (
          <ListAvatar src={url} name={name} size={104} />
        ) : (
          <span className="flex h-[104px] w-[104px] items-center justify-center rounded-full border-2 border-dashed border-border bg-muted/50 text-muted-foreground">
            <Camera size={30} />
          </span>
        )}
        <span
          className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full border-2 border-background shadow-md"
          style={{
            background:
              "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
            color: "var(--theme-active-text)",
          }}
        >
          <Camera size={16} />
        </span>
        {isUploading && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/45 text-xs font-medium text-white">
            Uploading…
          </span>
        )}
      </button>
      <input
        ref={ref}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={onFileChange}
      />
      <p className="text-xs text-muted-foreground">
        {url ? "Tap to change photo" : "Add a photo · JPG, PNG or WebP"}
      </p>
    </div>
  );
}

// ─── StepProgress ─────────────────────────────────────────────────────────────

export interface StepProgressItem {
  id: string;
  label: string;
  hasError?: boolean;
}

/**
 * Segmented progress bar for multi-step forms. Every segment is tappable
 * (so edits can jump around) and turns red when its step has errors.
 */
export function StepProgress({
  steps,
  activeId,
  onSelect,
}: {
  steps: ReadonlyArray<StepProgressItem>;
  activeId: string;
  onSelect: (id: string) => void;
}) {
  const activeIndex = Math.max(
    0,
    steps.findIndex((s) => s.id === activeId),
  );
  return (
    <div>
      <div className="flex gap-1.5">
        {steps.map((step, index) => (
          <button
            key={step.id}
            type="button"
            aria-label={`Go to ${step.label}`}
            aria-current={step.id === activeId ? "step" : undefined}
            onClick={() => onSelect(step.id)}
            className="group flex h-6 flex-1 items-center"
          >
            <span
              className={cn(
                "h-1.5 w-full rounded-full transition-colors",
                step.hasError
                  ? "bg-destructive"
                  : index <= activeIndex
                    ? "bg-primary"
                    : "bg-muted",
              )}
            />
          </button>
        ))}
      </div>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Step {activeIndex + 1} of {steps.length} · {steps[activeIndex]?.label}
      </p>
    </div>
  );
}
