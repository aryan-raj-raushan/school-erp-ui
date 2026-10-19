"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Calendar,
  CalendarDays,
  Eye,
  PartyPopper,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";
import {
  ActionSheet,
  Badge,
  Button,
  DetailField,
  DetailGrid,
  DetailHero,
  DetailSection,
  MobileListCard,
  MobileListScreen,
  PullToRefresh,
  SegmentedControl,
  StickyActionBar,
  type FilterField,
} from "@/components/ui";
import { CalendarViewModal } from "@/components/holiday-events/CalendarViewModal";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useSchoolEvents } from "@/hooks/useSchoolEvents";
import { useSchoolEventsInfinite } from "@/hooks/useSchoolEventsInfinite";
import { formatDate } from "@/lib/utils";
import type {
  AppliesToType,
  SchoolEvent,
  SchoolEventFilters,
  SchoolEventType,
} from "@/types/setting/school-events.types";

const APPLIES_TO_LABEL: Record<AppliesToType, string> = {
  STUDENTS: "Students only",
  STAFF: "Staff only",
  BOTH: "Students & staff",
};

type TypeTab = "" | SchoolEventType;

const TYPE_OPTIONS: ReadonlyArray<{ value: TypeTab; label: string }> = [
  { value: "", label: "All" },
  { value: "EVENT", label: "Events" },
  { value: "HOLIDAY", label: "Holidays" },
];

function TypeIcon({ type, size = 20 }: { type: SchoolEventType; size?: number }) {
  return type === "HOLIDAY" ? <Calendar size={size} /> : <PartyPopper size={size} />;
}

function dateRange(event: SchoolEvent) {
  const from = formatDate(event.from_date);
  return event.from_date === event.to_date ? from : `${from} → ${formatDate(event.to_date)}`;
}

function timeRange(event: SchoolEvent) {
  const from = event.from_time?.slice(0, 5);
  const to = event.to_time?.slice(0, 5);
  if (from && to) return `${from} – ${to}`;
  return from ?? to ?? undefined;
}

// ─── List ─────────────────────────────────────────────────────────────────────

export interface HolidayEventsMobileListProps {
  /** Module root, e.g. `/school/holidays-events`. */
  basePath: string;
}

export function HolidayEventsMobileList({ basePath }: HolidayEventsMobileListProps) {
  const router = useRouter();
  const { years } = useAcademicYears();
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [actionTarget, setActionTarget] = useState<SchoolEvent | null>(null);

  const list = useSchoolEventsInfinite();
  const { filters, updateFilters } = list;

  // The calendar needs every entry of the year, not just the pages loaded so far.
  const { events: calendarEvents } = useSchoolEvents({
    limit: 99,
    academic_year_id: filters.academic_year_id,
  });

  const filterFields = useMemo<FilterField[]>(
    () => [
      { type: "search", key: "search", placeholder: "Search by name…" },
      {
        type: "select",
        key: "academic_year_id",
        label: "Academic Year",
        placeholder: "All Years",
        options: years.map((y) => ({
          value: y.id,
          label: `${y.name}${y.is_current ? " (Current)" : ""}`,
        })),
      },
    ],
    [years],
  );

  const filterValues = {
    search: filters.search,
    academic_year_id: filters.academic_year_id,
  };

  return (
    <>
      <div className="flex flex-col gap-3 pt-3">
        <SegmentedControl<TypeTab>
          ariaLabel="Type"
          value={filters.type ?? ""}
          onChange={(value) => updateFilters({ type: value || undefined })}
          options={TYPE_OPTIONS}
        />
        <Button variant="outline" size="lg" onClick={() => setCalendarOpen(true)}>
          <CalendarDays size={18} /> Calendar view
        </Button>
      </div>

      <MobileListScreen
        filterFields={filterFields}
        filterValues={filterValues}
        onFilterChange={(next) => updateFilters(next as Partial<SchoolEventFilters>)}
        onFilterClear={() =>
          updateFilters({ search: undefined, academic_year_id: undefined })
        }
        filterSheetTitle="Filter events"
        onRefresh={list.refresh}
        countLabel={`${list.total} ${list.total === 1 ? "entry" : "entries"}`}
        isLoading={list.isLoading}
        isEmpty={list.items.length === 0}
        emptyIcon={<CalendarDays size={28} />}
        emptyTitle="No events or holidays"
        emptyDescription="Add a holiday or event to see it here."
        emptyFilteredTitle="No matching entries"
        hasMore={list.hasMore}
        isLoadingMore={list.isLoadingMore}
        onLoadMore={list.loadMore}
        fab={{ label: "Add new", onClick: () => router.push(`${basePath}/create-new`) }}
      >
        <ul className="flex flex-col gap-2.5">
          {list.items.map((event) => (
            <li key={event.id}>
              <MobileListCard
                leading={
                  <span
                    className={
                      event.type === "HOLIDAY"
                        ? "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/15 text-amber-600"
                        : "flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-sky-500/15 text-sky-600"
                    }
                  >
                    <TypeIcon type={event.type} />
                  </span>
                }
                title={event.name}
                subtitle={dateRange(event)}
                badge={
                  <Badge variant={event.type === "HOLIDAY" ? "warning" : "info"}>
                    {event.type === "HOLIDAY" ? "Holiday" : "Event"}
                  </Badge>
                }
                onClick={() => router.push(`${basePath}/view?id=${event.id}`)}
                onMore={() => setActionTarget(event)}
                moreLabel={`Actions for ${event.name}`}
              />
            </li>
          ))}
        </ul>
      </MobileListScreen>

      {calendarOpen && (
        <CalendarViewModal events={calendarEvents} onClose={() => setCalendarOpen(false)} />
      )}

      <ActionSheet
        isOpen={actionTarget !== null}
        onClose={() => setActionTarget(null)}
        title={actionTarget?.name}
        subtitle={actionTarget ? dateRange(actionTarget) : undefined}
        actions={
          actionTarget
            ? [
                {
                  label: "View details",
                  icon: <Eye size={18} />,
                  onClick: () => router.push(`${basePath}/view?id=${actionTarget.id}`),
                },
                {
                  label: "Edit",
                  icon: <Pencil size={18} />,
                  onClick: () =>
                    router.push(`${basePath}/view?id=${actionTarget.id}&edit=true`),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={18} />,
                  destructive: true,
                  confirm: {
                    title: `Delete ${actionTarget.name}?`,
                    description: "This cannot be undone.",
                    confirmLabel: "Delete",
                  },
                  onClick: () => void list.deleteEvent(actionTarget),
                },
              ]
            : []
        }
      />
    </>
  );
}

// ─── Detail ───────────────────────────────────────────────────────────────────

export interface HolidayEventMobileViewProps {
  event: SchoolEvent;
  yearName?: string;
  workingRoleNames: ReadonlyArray<string>;
  onEdit: () => void;
  onRefresh: () => Promise<unknown> | void;
}

export function HolidayEventMobileView({
  event,
  yearName,
  workingRoleNames,
  onEdit,
  onRefresh,
}: HolidayEventMobileViewProps) {
  const includesStaff = event.applies_to === "STAFF" || event.applies_to === "BOTH";

  return (
    <PullToRefresh onRefresh={onRefresh}>
      <div className="flex flex-col gap-3 pt-3">
        <DetailHero
          name={event.name}
          subtitle={dateRange(event)}
          meta={timeRange(event)}
          badge={
            <Badge variant={event.type === "HOLIDAY" ? "warning" : "info"}>
              {event.type === "HOLIDAY" ? "Holiday" : "Event"}
            </Badge>
          }
        />

        <DetailSection title="Details" icon={<TypeIcon type={event.type} size={18} />}>
          <DetailGrid>
            <DetailField label="Academic year" value={yearName} />
            <DetailField label="Type" value={event.type === "HOLIDAY" ? "Holiday" : "Event"} />
            <DetailField label="From" value={formatDate(event.from_date)} />
            <DetailField label="To" value={formatDate(event.to_date)} />
            <DetailField label="Start time" value={event.from_time?.slice(0, 5)} />
            <DetailField label="End time" value={event.to_time?.slice(0, 5)} />
            <DetailField wide label="Description" value={event.description} />
          </DetailGrid>
        </DetailSection>

        <DetailSection title="Applies to" icon={<Users size={18} />}>
          <DetailGrid>
            <DetailField wide label="Applies to" value={APPLIES_TO_LABEL[event.applies_to]} />
            {includesStaff && (
              <DetailField
                wide
                label="Staff who work"
                value={workingRoleNames.length > 0 ? workingRoleNames.join(", ") : undefined}
              />
            )}
          </DetailGrid>
        </DetailSection>

        <StickyActionBar>
          <Button type="button" size="lg" className="flex-1" onClick={onEdit}>
            <Pencil size={16} /> Edit
          </Button>
        </StickyActionBar>
      </div>
    </PullToRefresh>
  );
}
