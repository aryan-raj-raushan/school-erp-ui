"use client";

import { Suspense, useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Plus,
  Calendar,
  PartyPopper,
  Pencil,
  Trash2,
  Eye,
  CalendarDays,
} from "lucide-react";
import { useSchoolEvents } from "@/hooks/useSchoolEvents";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useStorageFilter } from "@/hooks/useStorageFilter";
import { STORAGE_FILTER_KEYS } from "@/constants/storage-filter-keys.constants";
import { HolidayEventDetail } from "./holiday-event-detail";
import type { SchoolEventFilters } from "@/types/setting/school-events.types";
import {
  Div,
  P,
  Button,
  PageHeader,
  type PageHeaderConfig,
  PageCol,
  FilterToolbar,
  type FilterField,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  TablePagination,
  Badge,
  Spinner,
  Tabs,
} from "@/components/ui";
import { CalendarViewModal } from "@/components/holiday-events/CalendarViewModal";
import { useIsMobile } from "@/hooks/use-mobile";

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "EVENT", label: "Events" },
  { value: "HOLIDAY", label: "Holidays" },
] as const;

function SchoolEventsContent() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const searchParams = useSearchParams();
  const detailId = searchParams.get("id");
  const { years } = useAcademicYears();

  const [calendarOpen, setCalendarOpen] = useState(false);

  const currentYearId = useMemo(() => {
    const current = years.find((y) => y.is_current);
    return current?.id || (years[0]?.id ?? undefined);
  }, [years]);


  type PersistedSchoolEventFilters = Pick<
    SchoolEventFilters,
    "type" | "academic_year_id" | "search"
  >;

  const {
    filters: storedFilters,
    updateFilters: persistFilters,
    clearFilters: clearStoredFilters,
    isHydrated: isStorageHydrated,
  } = useStorageFilter<PersistedSchoolEventFilters>({
    key: STORAGE_FILTER_KEYS.SCHOOL_EVENTS,
    defaultValue: {},
  });

  const {
    events,
    pagination,
    filters,
    searchInput,
    isLoading,
    updateFilters,
    deleteEvent,
  } = useSchoolEvents({
    academic_year_id: currentYearId,
    page: 1,
  });

  // For the calendar, we want ALL events (no pagination).
  const { events: allEvents } = useSchoolEvents({
    limit: 99,
    academic_year_id: filters.academic_year_id,
  });

  function handleFilterChange(next: Partial<SchoolEventFilters>) {
    updateFilters(next);

    const persisted: Partial<PersistedSchoolEventFilters> = {};
    (["type", "academic_year_id", "search"] as const).forEach((field) => {
      if (field in next) persisted[field] = next[field] as never;
    });
    if (Object.keys(persisted).length > 0) persistFilters(persisted);
  }

  function handleClearFilters() {
    handleFilterChange({
      type: undefined,
      academic_year_id: currentYearId,
      search: undefined,
      page: 1,
    });
    clearStoredFilters();
  }

  // One-time: once storage has hydrated, apply any filters saved from a
  // previous visit.
  useEffect(() => {
    if (!isStorageHydrated) return;
    const hasStoredFilters = Object.values(storedFilters).some(Boolean);
    if (hasStoredFilters) {
      updateFilters(storedFilters);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isStorageHydrated]);

  const filterFields = useMemo<FilterField[]>(
    () => [
      {
        type: "search",
        key: "search",
        placeholder: "Search by name…",
      },
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

  const filterValues: Record<string, string | undefined> = {
    search: filters.search,
    academic_year_id: filters.academic_year_id,
  };

  const activeTab = filters.type ?? "";

  if (detailId) {
    return <HolidayEventDetail id={detailId} />;
  }

  const pageHeaderConfig: PageHeaderConfig = {
    title: isMobile ? "Events" : "Events & Holidays",
    subtitle: pagination
      ? `${pagination.total} total events and holidays`
      : "Manage school events and holidays",
    actions: [
      {
        label: "Calendar",
        icon: <CalendarDays size={14} />,
        onClick: () => setCalendarOpen(true),
        variant: "outline",
      },
      {
        label: "Add New",
        icon: <Plus size={14} />,
        onClick: () => router.push("/settings/holidays-events/create-new"),
      },
    ],
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      {/* Type Tabs */}
      <Tabs
        options={TYPE_TABS.map((t) => ({ value: t.value, label: t.label }))}
        value={activeTab}
        onChange={(val) =>
          handleFilterChange({
            type: (val as SchoolEventFilters["type"]) || undefined,
          })
        }
        className="w-72"
      />

      {/* Filters */}
      <FilterToolbar
        fields={filterFields}
        values={filterValues}
        onChange={(next) =>
          handleFilterChange(next as Partial<SchoolEventFilters>)
        }
        onClear={handleClearFilters}
        sheetTitle="Filter Events & Holidays"
      />

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>From</TableHeaderCell>
            <TableHeaderCell>To</TableHeaderCell>
            <TableHeaderCell>Academic Year</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}>
              <Spinner />
            </TableEmptyRow>
          ) : events.length === 0 ? (
            <TableEmptyRow colSpan={6}>
              No{" "}
              {activeTab === "HOLIDAY"
                ? "holidays"
                : activeTab === "EVENT"
                ? "events"
                : "records"}{" "}
              found
            </TableEmptyRow>
          ) : (
            events.map((ev) => (
              <TableRow key={ev.id}>
                <TableCell primary>
                  <Div type="row" align="center" gap="sm">
                    {ev.type === "HOLIDAY" ? (
                      <Calendar size={15} className="text-amber-500 shrink-0" />
                    ) : (
                      <PartyPopper size={15} className="text-blue-500 shrink-0" />
                    )}
                    {ev.name}
                  </Div>
                </TableCell>
                <TableCell>
                  <Badge variant={ev.type === "HOLIDAY" ? "warning" : "info"}>
                    {ev.type}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(ev.from_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {ev.from_time && (
                    <P color="muted" className="text-xs">
                      {ev.from_time.slice(0, 5)}
                    </P>
                  )}
                </TableCell>
                <TableCell>
                  {new Date(ev.to_date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                  {ev.to_time && (
                    <P color="muted" className="text-xs">
                      {ev.to_time.slice(0, 5)}
                    </P>
                  )}
                </TableCell>
                <TableCell>
                  {years.find((y) => y.id === ev.academic_year_id)?.name ?? "—"}
                </TableCell>
                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/settings/holidays-events?id=${ev.id}`)
                      }
                      title="View"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(
                          `/settings/holidays-events?id=${ev.id}&edit=true`,
                        )
                      }
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteEvent(ev.id)}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {/* Calendar modal */}
      {calendarOpen && (
        <CalendarViewModal events={allEvents} onClose={() => setCalendarOpen(false)} />
      )}
    </PageCol>
  );
}

export default function SchoolEventsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <SchoolEventsContent />
    </Suspense>
  );
}