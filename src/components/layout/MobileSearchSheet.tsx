"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Capacitor } from "@capacitor/core";
import { ChevronRight, Search, SearchX, X } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { useGlobalSearch, SECTIONS, TYPE_BADGE } from "@/hooks/useGlobalSearch";
import type { SearchResultItem } from "@/hooks/useGlobalSearch";

interface MobileSearchSheetProps {
  open: boolean;
  onClose: () => void;
}

function useVisibleViewport(active: boolean) {
  const [box, setBox] = useState<{ top: number; height: number } | null>(null);

  useEffect(() => {
    if (!active) return;
    const vv = window.visualViewport;
    if (!vv) return;
    const sync = () => {
      if (window.scrollY !== 0) window.scrollTo(0, 0);
      setBox({ top: vv.offsetTop, height: vv.height });
    };
    sync();
    vv.addEventListener("resize", sync);
    vv.addEventListener("scroll", sync);
    return () => {
      vv.removeEventListener("resize", sync);
      vv.removeEventListener("scroll", sync);
    };
  }, [active]);

  return box;
}

function useLockPage(active: boolean) {
  useEffect(() => {
    if (!active || Capacitor.isNativePlatform()) return;
    const { style } = document.body;
    const prev = { position: style.position, top: style.top, width: style.width, overflow: style.overflow };
    style.position = "fixed";
    style.top = "0";
    style.width = "100%";
    style.overflow = "hidden";
    return () => {
      style.position = prev.position;
      style.top = prev.top;
      style.width = prev.width;
      style.overflow = prev.overflow;
    };
  }, [active]);
}

export function MobileSearchSheet({ open, onClose }: MobileSearchSheetProps) {
  const { query, setQuery, inputRef, listRef, results, isLoading, flatItems, navigate } = useGlobalSearch(open, onClose);

  const viewport = useVisibleViewport(open);
  useLockPage(open);

  useEffect(() => {
    if (open) inputRef.current?.focus({ preventScroll: true });
  }, [open, inputRef]);

  if (!open || typeof document === "undefined") return null;

  const hasQuery = query.trim().length >= 2;

  return createPortal(
    <div
      data-native-chrome
      className="fixed inset-x-0 z-[70] flex flex-col justify-end overflow-hidden"
      style={viewport ? { top: viewport.top, height: viewport.height } : { top: 0, bottom: 0 }}
    >
      <div className="absolute inset-0 animate-in bg-black/50 fade-in-0 duration-200" onClick={onClose} />

      <div
        role="dialog"
        aria-label="Search"
        className="relative flex w-full animate-in flex-col overflow-hidden rounded-t-[28px] bg-background shadow-2xl duration-300 slide-in-from-bottom"
        style={{ height: "calc(100% - var(--sat, 0px) - 12px)", maxHeight: "100%" }}
      >
        <div className="flex shrink-0 justify-center pt-2.5">
          <span className="h-1 w-10 rounded-full bg-muted-foreground/30" />
        </div>

        <div className="flex shrink-0 items-center gap-2 px-4 pb-3 pt-3">
          <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 rounded-2xl bg-muted px-3.5">
            <Search size={18} className="shrink-0 text-muted-foreground" />
            <input
              ref={inputRef}
              type="search"
              enterKeyHint="search"
              autoComplete="off"
              autoCorrect="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search students, staff, classes…"
              className="min-w-0 flex-1 appearance-none border-none bg-transparent text-foreground outline-none placeholder:text-muted-foreground [&::-webkit-search-cancel-button]:hidden"
            />
            {isLoading ? (
              <Spinner size="sm" className="shrink-0" />
            ) : (
              query && (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear" className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-muted-foreground/25">
                  <X size={13} />
                </button>
              )
            )}
          </div>
          <button type="button" onClick={onClose} className="shrink-0 px-1.5 text-[15px] font-medium active:opacity-60">
            <span className="text-foreground">Cancel</span>
          </button>
        </div>

        <div
          ref={listRef}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          style={{ paddingBottom: "16px" }}
        >
          {!hasQuery && (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <Search size={32} className="opacity-40" />
              <p className="text-sm">Type at least 2 characters to search</p>
            </div>
          )}

          {hasQuery && isLoading && flatItems.length === 0 && (
            <div className="flex justify-center py-16">
              <Spinner size="md" />
            </div>
          )}

          {hasQuery && !isLoading && flatItems.length === 0 && (
            <div className="flex flex-col items-center gap-2 py-16 text-center text-muted-foreground">
              <SearchX size={32} className="opacity-40" />
              <p className="text-sm">No results for &ldquo;{query}&rdquo;</p>
            </div>
          )}

          {hasQuery &&
            SECTIONS.map(({ key, label }) => {
              const section = results[key] as SearchResultItem[];
              if (!section.length) return null;
              return (
                <section key={key} className="pb-3">
                  <h3 className="px-1 pb-1.5 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {label} · {section.length}
                  </h3>
                  <ul className="overflow-hidden rounded-2xl border border-border bg-card">
                    {section.map((item) => {
                      const badge = TYPE_BADGE[item.type];
                      return (
                        <li key={`${item.type}-${item.id}`} className="border-b border-border last:border-b-0">
                          <button
                            type="button"
                            onClick={() => navigate(item)}
                            className="flex min-h-14 w-full items-center gap-3 px-3.5 py-2.5 text-left active:bg-muted"
                          >
                            <span
                              className="shrink-0 rounded-md px-2 py-0.5 text-[10px] font-semibold"
                              style={{ background: badge.bg, color: badge.color }}
                            >
                              {badge.label}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-sm font-medium">{item.name}</span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {[item.subtitle, item.meta].filter(Boolean).join(" · ")}
                              </span>
                            </span>
                            <ChevronRight size={16} className="shrink-0 text-muted-foreground/60" />
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
        </div>
      </div>
    </div>,
    document.body,
  );
}
