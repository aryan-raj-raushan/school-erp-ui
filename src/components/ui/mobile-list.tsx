"use client";

import * as React from "react";
import { Loader2, MoreVertical, Plus, ArrowDown } from "lucide-react";
import { cn } from "@/lib/utils";

// ─── ListAvatar ───────────────────────────────────────────────────────────────

export function ListAvatar({
  src,
  name,
  size = 48,
  className,
}: {
  src?: string | null;
  name: string;
  size?: number;
  className?: string;
}) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={name}
      width={size}
      height={size}
      loading="lazy"
      className={cn("shrink-0 rounded-full object-cover", className)}
      style={{ width: size, height: size }}
    />
  ) : (
    <div
      aria-hidden
      className={cn(
        "flex shrink-0 items-center justify-center rounded-full bg-primary/10 font-semibold text-primary-text",
        className,
      )}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
    >
      {initials || "?"}
    </div>
  );
}

// ─── MobileListCard ───────────────────────────────────────────────────────────

export interface MobileListCardProps {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Small trailing-aligned content beside the title (e.g. a status badge). */
  badge?: React.ReactNode;
  /** Extra line(s) under the subtitle (e.g. contact chips). */
  footer?: React.ReactNode;
  muted?: boolean;
  onClick?: () => void;
  /** Renders the ⋮ button; its tap never triggers `onClick`. */
  onMore?: () => void;
  moreLabel?: string;
}

/**
 * Generic tappable list row for mobile: leading visual, two text lines,
 * optional badge/footer and a dedicated ⋮ button. 64px+ tall with
 * 48px-minimum tap targets.
 */
export function MobileListCard({
  leading,
  title,
  subtitle,
  badge,
  footer,
  muted,
  onClick,
  onMore,
  moreLabel = "More actions",
}: MobileListCardProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 shadow-sm dark:bg-neutral-900",
        onClick && "active:bg-muted/60",
        muted && "opacity-60",
      )}
    >
      <div
        role={onClick ? "button" : undefined}
        tabIndex={onClick ? 0 : undefined}
        onClick={onClick}
        onKeyDown={(e) => {
          if (onClick && (e.key === "Enter" || e.key === " ")) onClick();
        }}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        {leading}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="min-w-0 flex-1 truncate text-[15px] font-semibold">
              {title}
            </p>
            {badge}
          </div>
          {subtitle && (
            <p className="mt-0.5 truncate text-[13px] text-muted-foreground">
              {subtitle}
            </p>
          )}
          {footer}
        </div>
      </div>
      {onMore && (
        <button
          type="button"
          aria-label={moreLabel}
          onClick={onMore}
          className="-mr-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
        >
          <MoreVertical size={20} />
        </button>
      )}
    </div>
  );
}

// ─── StatPill ─────────────────────────────────────────────────────────────────

export type StatPillTone = "success" | "danger" | "warning" | "neutral";

const statPillTone: Record<StatPillTone, string> = {
  success: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-300",
  danger: "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300",
  warning: "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300",
  neutral: "bg-muted text-foreground",
};

/** Compact count tile for mobile summary rows (present / absent / total …). */
export function StatPill({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: number;
  tone?: StatPillTone;
}) {
  return (
    <div className={cn("flex-1 rounded-2xl px-2 py-2.5 text-center", statPillTone[tone])}>
      <p className="text-lg font-bold leading-none">{value}</p>
      <p className="mt-1 text-[11px] font-medium opacity-80">{label}</p>
    </div>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

export function MobileListSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div className="flex flex-col gap-3" aria-busy="true" aria-live="polite">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center gap-3 rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900"
        >
          <div className="h-12 w-12 shrink-0 rounded-full bg-muted" />
          <div className="flex-1 space-y-2">
            <div className="h-3.5 w-2/5 rounded bg-muted" />
            <div className="h-3 w-3/5 rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Infinite scroll sentinel ─────────────────────────────────────────────────

export function InfiniteScrollSentinel({
  onReach,
  isLoading,
  hasMore,
}: {
  onReach: () => void;
  isLoading: boolean;
  hasMore: boolean;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const onReachRef = React.useRef(onReach);
  React.useEffect(() => {
    onReachRef.current = onReach;
  });

  React.useEffect(() => {
    const node = ref.current;
    if (!node || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) onReachRef.current();
      },
      { rootMargin: "400px 0px" },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  return (
    <div ref={ref} className="flex h-12 items-center justify-center">
      {isLoading && (
        <Loader2 size={20} className="animate-spin text-muted-foreground" />
      )}
    </div>
  );
}

// ─── Pull-to-refresh indicator ────────────────────────────────────────────────

export function PullIndicator({
  pull,
  threshold,
  isRefreshing,
}: {
  pull: number;
  threshold: number;
  isRefreshing: boolean;
}) {
  if (pull === 0 && !isRefreshing) return null;
  const ready = pull >= threshold;
  return (
    <div
      className="flex items-center justify-center overflow-hidden text-muted-foreground"
      style={{ height: pull }}
      aria-hidden
    >
      {isRefreshing ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <ArrowDown
          size={20}
          className="transition-transform"
          style={{ transform: `rotate(${ready ? 180 : 0}deg)` }}
        />
      )}
    </div>
  );
}

// ─── Floating action button ───────────────────────────────────────────────────

/**
 * Sticky FAB. Place it as the last child of the scrolling page content: it
 * floats at the bottom-right of the viewport while scrolling and settles
 * after the list ends, always clear of the tab bar.
 */
export function FloatingActionButton({
  label,
  icon = <Plus size={22} />,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <div className="pointer-events-none sticky bottom-4 z-10 flex justify-end">
      <button
        type="button"
        aria-label={label}
        onClick={onClick}
        className="pointer-events-auto flex h-14 w-14 items-center justify-center rounded-full shadow-lg active:scale-95"
        style={{
          background:
            "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
          color: "var(--theme-active-text)",
          boxShadow: "0 8px 20px var(--theme-glow)",
        }}
      >
        {icon}
      </button>
    </div>
  );
}
