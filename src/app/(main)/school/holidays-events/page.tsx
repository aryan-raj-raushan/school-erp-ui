"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Calendar, PartyPopper, Pencil, Trash2, Eye, CalendarDays } from "lucide-react";
import { useSchoolEvents } from "@/hooks/useSchoolEvents";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useFilterParams } from "@/hooks/useFilterParams";
import type { SchoolEventFilters } from "@/types/setting/school-events.types";
import {
  Div,
  H1,
  P,
  Button,
  Input,
  Select,
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

const TYPE_TABS = [
  { value: "", label: "All" },
  { value: "EVENT", label: "Events" },
  { value: "HOLIDAY", label: "Holidays" },
] as const;

function SchoolEventsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();

  const [calendarOpen, setCalendarOpen] = useState(false);

  // Persistent filters via URL query params
  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    type: undefined,
    academic_year_id: undefined,
    search: undefined,
    page: undefined,
  });

  const initialFilters: SchoolEventFilters = {
    type: (urlFilters.type as SchoolEventFilters["type"]) || undefined,
    academic_year_id: urlFilters.academic_year_id || undefined,
    search: urlFilters.search || undefined,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    events,
    pagination,
    filters,
    searchInput,
    isLoading,
    updateFilters,
    deleteEvent,
  } = useSchoolEvents(initialFilters);

  // For the calendar, we want ALL events (no pagination). Re-use the same hook
  // with a high limit and no type filter so the calendar is complete.
  const { events: allEvents } = useSchoolEvents({ limit: 99, academic_year_id:filters.academic_year_id });

  function handleFilterChange(next: Partial<SchoolEventFilters>) {
    updateFilters(next);
    // Sync to URL
    const urlNext: Record<string, string | undefined> = {};
    if ("type" in next) urlNext.type = next.type || undefined;
    if ("academic_year_id" in next)
      urlNext.academic_year_id = next.academic_year_id || undefined;
    if ("search" in next) urlNext.search = next.search || undefined;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

  const activeTab = filters.type ?? "";

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <H1>Events & Holidays</H1>
          <P color="muted">
            {pagination
              ? `${pagination.total} total`
              : "Manage school events and holidays"}
          </P>
        </Div>
        {/* Action buttons */}
        <Div type="row" gap="sm" align="center">
          <Button
            variant="outline"
            onClick={() => setCalendarOpen(true)}
          >
            <CalendarDays size={16} />
            Calendar view
          </Button>
          <Button onClick={() => router.push("holidays-events/create-new")}>
            <Plus size={16} />
            Add New
          </Button>
        </Div>
      </Div>

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
      <Div type="row" gap="md" align="center" wrap>
        <Input
          width="md"
          placeholder="Search by name…"
          value={searchInput}
          onChange={(e) => handleFilterChange({ search: e.target.value })}
        />
        <Select
          width="sm"
          value={filters.academic_year_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
            })
          }
        >
          <option value="">All Years</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </Select>
      </Div>

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
                      <PartyPopper
                        size={15}
                        className="text-blue-500 shrink-0"
                      />
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
                        router.push(`holidays-events/view?id=${ev.id}`)
                      }
                      title="View"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`holidays-events/view?id=${ev.id}&edit=true`)
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
        <CalendarViewModal
          events={allEvents}
          onClose={() => setCalendarOpen(false)}
        />
      )}
    </Div>
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
