"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ListAvatar } from "./mobile-list";

// ─── DetailHero ───────────────────────────────────────────────────────────────

export interface HeroAction {
  label: string;
  icon: React.ReactNode;
  onClick?: () => void;
  /** Renders an anchor (e.g. `tel:`/`sms:`) instead of a button. */
  href?: string;
  hidden?: boolean;
}

export interface DetailHeroProps {
  name: string;
  image?: string | null;
  subtitle?: string;
  meta?: string;
  badge?: React.ReactNode;
  actions?: HeroAction[];
}

const heroActionClass =
  "flex min-w-0 flex-1 flex-col items-center gap-1.5 rounded-2xl py-2.5 text-xs font-medium active:bg-muted";

/** Profile header for detail screens: avatar, identity, status and quick actions. */
export function DetailHero({
  name,
  image,
  subtitle,
  meta,
  badge,
  actions = [],
}: DetailHeroProps) {
  const visible = actions.filter((a) => !a.hidden);
  return (
    <section className="rounded-3xl border border-border/60 bg-white p-4 shadow-sm dark:bg-neutral-900">
      <div className="flex items-center gap-4">
        <ListAvatar src={image} name={name} size={72} />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold leading-tight">{name}</h2>
          {subtitle && (
            <p className="mt-0.5 truncate text-sm text-muted-foreground">
              {subtitle}
            </p>
          )}
          {meta && (
            <p className="truncate text-xs text-muted-foreground">{meta}</p>
          )}
          {badge && <div className="mt-2">{badge}</div>}
        </div>
      </div>

      {visible.length > 0 && (
        <div className="mt-4 flex gap-1 border-t border-border/60 pt-3">
          {visible.map((action) => {
            const content = (
              <>
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary-text">
                  {action.icon}
                </span>
                {action.label}
              </>
            );
            return action.href ? (
              <a
                key={action.label}
                href={action.href}
                className={heroActionClass}
              >
                {content}
              </a>
            ) : (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                className={heroActionClass}
              >
                {content}
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}

// ─── DetailSection / DetailField ──────────────────────────────────────────────

export interface DetailSectionProps {
  title: string;
  icon?: React.ReactNode;
  /** Collapsible sections start open unless `defaultOpen` is false. */
  collapsible?: boolean;
  defaultOpen?: boolean;
  /** Forces the section open (e.g. when it contains a validation error). */
  forceOpen?: boolean;
  children: React.ReactNode;
}

/** Titled card used both for read-only detail groups and for form groups. */
export function DetailSection({
  title,
  icon,
  collapsible = true,
  defaultOpen = true,
  forceOpen = false,
  children,
}: DetailSectionProps) {
  const [open, setOpen] = React.useState(defaultOpen);
  const isOpen = !collapsible || open || forceOpen;

  return (
    <section className="overflow-hidden rounded-2xl border border-border/60 bg-white dark:bg-neutral-900">
      <button
        type="button"
        disabled={!collapsible}
        aria-expanded={isOpen}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-full items-center gap-3 px-4 text-left active:bg-muted/50 disabled:active:bg-transparent"
      >
        {icon && <span className="text-muted-foreground">{icon}</span>}
        <span className="flex-1 text-[15px] font-semibold">{title}</span>
        {collapsible && (
          <ChevronDown
            size={18}
            className={cn(
              "text-muted-foreground transition-transform",
              isOpen && "rotate-180",
            )}
          />
        )}
      </button>
      {isOpen && (
        <div className="border-t border-border/50 px-4 py-4">{children}</div>
      )}
    </section>
  );
}

export function DetailGrid({ children }: { children: React.ReactNode }) {
  return <dl className="grid grid-cols-2 gap-x-4 gap-y-4">{children}</dl>;
}

export function DetailField({
  label,
  value,
  wide,
}: {
  label: string;
  value?: React.ReactNode;
  /** Spans both columns (addresses, long text). */
  wide?: boolean;
}) {
  const empty = value === undefined || value === null || value === "";
  return (
    <div className={cn("min-w-0", wide && "col-span-2")}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 break-words text-[15px]",
          empty && "text-muted-foreground",
        )}
      >
        {empty ? "—" : value}
      </dd>
    </div>
  );
}

// ─── StickyActionBar ──────────────────────────────────────────────────────────

/**
 * Bottom-pinned bar for a screen's primary actions (Save / Cancel). Place as
 * the last child of the scrolling content: it sticks to the bottom edge of
 * the scroll area, directly above the tab bar or keyboard.
 */
export function StickyActionBar({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "sticky bottom-0 z-20 -mx-4 mt-4 flex gap-3 border-t border-border/60 bg-background/95 px-4 py-3 backdrop-blur",
        className,
      )}
    >
      {children}
    </div>
  );
}
