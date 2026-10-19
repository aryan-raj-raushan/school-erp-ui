"use client";

import * as React from "react";
import { CalendarOff, Users } from "lucide-react";
import { Badge } from "./badge";
import { Button } from "./button";
import { EmptyState } from "./empty-state";
import { Input } from "./form";
import type { FilterField } from "./filter-toolbar";
import { DrawerChevron } from "./mobile-nav";
import { MobileFilterBar } from "./mobile-filter-bar";
import { MobileListSkeleton, StatPill, type StatPillTone } from "./mobile-list";
import { StickyActionBar } from "./mobile-detail";
import { SegmentedControl, type SegmentOption } from "./segmented-control";
import { Switch } from "./switch";

export interface RosterMember {
  id: string;
  /** Roll number / employee code shown in the round marker. */
  marker?: string | null;
  name: string;
  subtitle?: string | null;
}

export interface RosterEntry<S extends string> {
  status?: S;
  remarks?: string;
  isLate?: boolean;
}

export interface RosterStat {
  label: string;
  value: number;
  tone?: StatPillTone;
}

export interface RosterBulkAction<S extends string> {
  label: string;
  status: S;
}

export interface AttendanceRosterProps<S extends string> {
  members: ReadonlyArray<RosterMember>;
  entries: Record<string, RosterEntry<S> | undefined>;
  statusOptions: ReadonlyArray<SegmentOption<S>>;
  /** Statuses set by the system (leave, holiday …) that lock a row. */
  lockedStatuses?: ReadonlyArray<string>;
  stats: ReadonlyArray<RosterStat>;
  bulkActions?: ReadonlyArray<RosterBulkAction<S>>;
  summary?: string;
  isLoading: boolean;
  isSaving: boolean;
  /** Whole roster is read-only, e.g. a holiday. */
  isLocked?: boolean;
  lockedMessage?: string;
  hasSelection: boolean;
  emptySelectionText: string;
  emptyRosterText: string;
  saveLabel: string;
  filterFields: FilterField[];
  filterValues: Record<string, string | undefined>;
  onFilterChange: (next: Record<string, string | undefined>) => void;
  onFilterClear: () => void;
  filterSheetTitle?: string;
  onStatusChange: (id: string, status: S) => void;
  onLateChange: (id: string, isLate: boolean) => void;
  onRemarksChange: (id: string, remarks: string) => void;
  onBulk: (status: S) => void;
  onSave: () => void;
}

function RosterRow<S extends string>({
  member,
  entry,
  locked,
  systemLocked,
  statusOptions,
  onStatusChange,
  onLateChange,
  onRemarksChange,
}: {
  member: RosterMember;
  entry: RosterEntry<S>;
  locked: boolean;
  systemLocked: boolean;
  statusOptions: ReadonlyArray<SegmentOption<S>>;
  onStatusChange: (status: S) => void;
  onLateChange: (isLate: boolean) => void;
  onRemarksChange: (remarks: string) => void;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const canExpand = !locked && !systemLocked;

  return (
    <div className="rounded-2xl border border-border/60 bg-white p-3 dark:bg-neutral-900">
      <div className="mb-2.5 flex items-center gap-3">
        <span className="flex h-9 min-w-9 shrink-0 items-center justify-center rounded-full bg-muted px-2 text-xs font-semibold">
          {member.marker ?? "–"}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-semibold">{member.name}</p>
          {member.subtitle && (
            <p className="truncate text-xs text-muted-foreground">{member.subtitle}</p>
          )}
        </div>
        {canExpand && (
          <button
            type="button"
            aria-label="Late arrival and remarks"
            aria-expanded={expanded}
            onClick={() => setExpanded((v) => !v)}
            className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-muted-foreground active:bg-muted"
          >
            <DrawerChevron open={expanded} />
            {(entry.remarks || entry.isLate) && (
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
            )}
          </button>
        )}
      </div>

      {systemLocked ? (
        <Badge variant="info">{entry.status}</Badge>
      ) : (
        <SegmentedControl
          ariaLabel={`Attendance for ${member.name}`}
          options={statusOptions}
          value={entry.status}
          disabled={locked}
          onChange={onStatusChange}
        />
      )}

      {expanded && canExpand && (
        <div className="mt-3 flex flex-col gap-3 border-t border-border/50 pt-3">
          <label className="flex items-center justify-between text-sm">
            Late arrival
            <Switch checked={entry.isLate ?? false} onCheckedChange={onLateChange} />
          </label>
          <Input
            placeholder="Optional remarks"
            value={entry.remarks ?? ""}
            onChange={(e) => onRemarksChange(e.target.value)}
          />
        </div>
      )}
    </div>
  );
}

/**
 * Phone layout for marking attendance for any group (students, staff …):
 * filters, count tiles, bulk actions, one thumb-sized status control per
 * member and a pinned Save bar. Status vocabulary is supplied by the caller.
 */
export function AttendanceRoster<S extends string>({
  members,
  entries,
  statusOptions,
  lockedStatuses = [],
  stats,
  bulkActions = [],
  summary,
  isLoading,
  isSaving,
  isLocked = false,
  lockedMessage,
  hasSelection,
  emptySelectionText,
  emptyRosterText,
  saveLabel,
  filterFields,
  filterValues,
  onFilterChange,
  onFilterClear,
  filterSheetTitle = "Filters",
  onStatusChange,
  onLateChange,
  onRemarksChange,
  onBulk,
  onSave,
}: AttendanceRosterProps<S>) {
  const marked = members.filter((m) => entries[m.id]?.status).length;

  return (
    <div className="flex flex-col gap-3 pt-3">
      <MobileFilterBar
        fields={filterFields}
        values={filterValues}
        onChange={onFilterChange}
        onClear={onFilterClear}
        sheetTitle={filterSheetTitle}
      />

      {summary && <p className="px-1 text-sm font-medium text-muted-foreground">{summary}</p>}

      {isLocked && lockedMessage && (
        <div className="flex items-center gap-3 rounded-2xl bg-amber-50 p-4 text-sm text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
          <CalendarOff size={20} className="shrink-0" />
          {lockedMessage}
        </div>
      )}

      {!hasSelection ? (
        <EmptyState icon={<Users size={28} />} title="Nothing selected" description={emptySelectionText} />
      ) : isLoading ? (
        <MobileListSkeleton rows={8} />
      ) : members.length === 0 ? (
        <EmptyState icon={<Users size={28} />} title="Nobody here" description={emptyRosterText} />
      ) : (
        <>
          <div className="flex gap-2">
            {stats.map((stat) => (
              <StatPill key={stat.label} label={stat.label} value={stat.value} tone={stat.tone} />
            ))}
          </div>

          {!isLocked && bulkActions.length > 0 && (
            <div className="flex gap-2">
              {bulkActions.map((action) => (
                <Button
                  key={action.label}
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => onBulk(action.status)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}

          <ul className="flex flex-col gap-2.5">
            {members.map((member) => {
              const entry = entries[member.id] ?? {};
              return (
                <li key={member.id}>
                  <RosterRow
                    member={member}
                    entry={entry}
                    locked={isLocked}
                    systemLocked={Boolean(entry.status && lockedStatuses.includes(entry.status))}
                    statusOptions={statusOptions}
                    onStatusChange={(status) => onStatusChange(member.id, status)}
                    onLateChange={(late) => onLateChange(member.id, late)}
                    onRemarksChange={(text) => onRemarksChange(member.id, text)}
                  />
                </li>
              );
            })}
          </ul>

          {!isLocked && (
            <StickyActionBar>
              <Button
                type="button"
                size="lg"
                variant="success"
                className="flex-1"
                loading={isSaving}
                onClick={onSave}
              >
                {saveLabel} · {marked}/{members.length}
              </Button>
            </StickyActionBar>
          )}
        </>
      )}
    </div>
  );
}
