"use client";

import { createPortal } from "react-dom";
import { Search, X, ArrowUpDown, CornerDownLeft } from "lucide-react";
import { Div, P, SectionLabel, Button, Badge, Spinner, Input } from "@/components/ui";
import { useGlobalSearch, SECTIONS, TYPE_BADGE } from "@/hooks/useGlobalSearch";
import type { SearchResultItem } from "@/hooks/useGlobalSearch";

interface GlobalSearchProps {
  open: boolean;
  onClose: () => void;
}

export function GlobalSearch({ open, onClose }: GlobalSearchProps) {
  const { query, setQuery, selected, setSelected, inputRef, listRef, results, isLoading, flatItems, navigate } =
    useGlobalSearch(open, onClose);

  if (typeof document === "undefined") return null;

  return createPortal(
    <Div
      type="row"
      align="start"
      justify="center"
      className={`fixed inset-0 z-[100] pt-20 px-4 transition-opacity duration-150 ${open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
    >
      <Div className="absolute inset-0 bg-black/45 backdrop-blur-[8px] cursor-default" onClick={onClose} />

      <Div
        className={`relative w-full max-w-[600px] rounded-[20px] overflow-hidden border border-border/50 shadow-2xl bg-card transition-all duration-150 ${open ? "scale-100 opacity-100" : "scale-95 opacity-0"}`}
      >
        <Div type="row" align="center" className="px-5 py-3.5 gap-3 border-b border-border/50">
          <Search size={16} className="text-muted-foreground shrink-0" />
          <Input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search records..."
            className="flex-1 bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground min-w-0"
          />
          {isLoading ? (
            <Spinner size="sm" className="shrink-0" />
          ) : (
            <Button variant="ghost" size="icon-xs" onClick={onClose}>
              <X size={13} />
            </Button>
          )}
        </Div>

        <div ref={listRef} className="max-h-[440px] overflow-y-auto px-2 py-2 [scrollbar-width:none]">
          {query.trim().length < 2 && (
            <P color="muted" size="sm" className="py-10 text-center">
              Type at least 2 characters to search...
            </P>
          )}

          {query.trim().length >= 2 && (
            <>
              {isLoading && flatItems.length === 0 && (
                <Div align="center" className="py-10">
                  <Spinner size="md" />
                </Div>
              )}

              {!isLoading && flatItems.length === 0 && (
                <P color="muted" size="sm" className="py-10 text-center">
                  No results for &ldquo;{query}&rdquo;
                </P>
              )}

              {SECTIONS.map(({ key, label }) => {
                const section = results[key] as SearchResultItem[];
                if (!section.length) return null;
                return (
                  <Div key={key}>
                    <SectionLabel className="px-3 pt-3 pb-1 opacity-70">
                      {label} · {section.length}
                    </SectionLabel>
                    {section.map((item) => {
                      const idx = flatItems.indexOf(item);
                      const badge = TYPE_BADGE[item.type];
                      return (
                        <Button
                          key={`${item.type}-${item.id}`}
                          variant="ghost"
                          fullWidth
                          onClick={() => navigate(item)}
                          onMouseEnter={() => setSelected(idx)}
                          className={`justify-start gap-3 px-3 py-2.5 rounded-xl h-auto font-normal ${idx === selected ? "bg-accent" : "bg-transparent"}`}
                        >
                          <Badge
                            className="rounded-md text-[10px] px-[7px] py-0.5 shrink-0"
                            style={{ background: badge.bg, color: badge.color }}
                          >
                            {badge.label}
                          </Badge>
                          <Div className="flex-1 min-w-0 text-left">
                            <P color="default" size="sm" weight="medium" noWrap>{item.name}</P>
                            <P color="muted" size="xs" noWrap>
                              {[item.subtitle, item.meta].filter(Boolean).join(" · ")}
                            </P>
                          </Div>
                          {idx === selected && <P color="muted" size="xs" className="shrink-0">↵</P>}
                        </Button>
                      );
                    })}
                  </Div>
                );
              })}
            </>
          )}
        </div>

        <Div type="row" align="center" gap="sm" className="border-t border-border/50 px-5 py-2.5">
          <Div type="row" align="center" gap="xs">
            <kbd className="inline-flex items-center px-[5px] py-px rounded bg-muted text-[10px] border border-border/50">
              <ArrowUpDown size={10} />
            </kbd>
            <P color="muted" size="xs">navigate</P>
          </Div>
          <Div type="row" align="center" gap="xs">
            <kbd className="inline-flex items-center px-[5px] py-px rounded bg-muted text-[10px] border border-border/50">
              <CornerDownLeft size={10} />
            </kbd>
            <P color="muted" size="xs">open</P>
          </Div>
          <Div type="row" align="center" gap="xs">
            <kbd className="px-[5px] py-px rounded bg-muted text-[10px] border border-border/50">esc</kbd>
            <P color="muted" size="xs">close</P>
          </Div>
        </Div>
      </Div>
    </Div>,
    document.body,
  );
}
