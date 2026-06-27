"use client";

import { Suspense, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Send, SendHorizonal } from "lucide-react";
import { useExams } from "@/hooks/exam/useExams";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import {
  Div, Button, Select, Badge, Spinner,
  PageHeader, PageCol, FilterBar,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
} from "@/components/ui";
import { EXAMS_PAGE, EXAM_ROUTES, EXAM_TERM_OPTIONS } from "@/constants/exam.constants";
import type { Exam, ExamFilters } from "@/types/exam.types";

function ExamsContent() {
  const router = useRouter();
  const { exams, pagination, filters, isLoading, updateFilters, remove, togglePublish } = useExams();

  const {
    years, classes,
    selectedAcademicYearId, setSelectedAcademicYearId,
    selectedClassId, handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: true });

  const classNameById = useMemo(
    () => Object.fromEntries(classes.map((c) => [c.id, c.name])),
    [classes],
  );

  // Group sibling exams (same name+term+year = one logical exam across classes)
  const examGroups = useMemo(() => {
    const groups = new Map<string, Exam[]>();
    exams.forEach((e) => {
      const key = `${e.exam_name}||${e.exam_term}||${e.academic_year_id}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(e);
    });
    return [...groups.values()];
  }, [exams]);

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    handleClassChange("");
    updateFilters({ academic_year_id: val || undefined, class_id: undefined });
  }

  function handleClassFilter(val: string) {
    handleClassChange(val);
    updateFilters({ class_id: val || undefined });
  }

  async function removeGroup(group: Exam[]) {
    for (const e of group) await remove(e.id);
  }

  async function togglePublishGroup(group: Exam[], publish: boolean) {
    for (const e of group) await togglePublish(e.id, publish);
  }

  return (
    <PageCol>
      <PageHeader
        title={EXAMS_PAGE.pageHeading.title}
        subtitle={examGroups.length ? `${examGroups.length} exam${examGroups.length > 1 ? "s" : ""}` : ""}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.exams.create)}>
            <Plus size={16} /> {EXAMS_PAGE.buttons.add}
          </Button>
        }
      />

      {/* Filters */}
      <FilterBar>
        <Select width="sm" value={selectedAcademicYearId}
          onChange={(e) => handleYearChange(e.target.value)}>
          <option value="">{EXAMS_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>{y.name}{y.is_current ? " (Current)" : ""}</option>
          ))}
        </Select>
        <Select width="sm" value={selectedClassId}
          onChange={(e) => handleClassFilter(e.target.value)}
          disabled={!selectedAcademicYearId}>
          <option value="">{EXAMS_PAGE.filters.allClasses}</option>
          {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select width="sm" value={filters.exam_term ?? ""}
          onChange={(e) => updateFilters({ exam_term: (e.target.value as ExamFilters["exam_term"]) || undefined })}>
          <option value="">{EXAMS_PAGE.filters.allTerms}</option>
          {EXAM_TERM_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </Select>
        <Select width="sm" value={filters.is_published === undefined ? "" : String(filters.is_published)}
          onChange={(e) => updateFilters({ is_published: e.target.value === "" ? undefined : e.target.value === "true" })}>
          <option value="">{EXAMS_PAGE.filters.allStatus}</option>
          <option value="true">Published</option>
          <option value="false">Draft</option>
        </Select>
      </FilterBar>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{EXAMS_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.examName}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.term}</TableHeaderCell>
            <TableHeaderCell>Classes</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.startDate}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.endDate}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.published}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={9}><Spinner /></TableEmptyRow>
          ) : examGroups.length === 0 ? (
            <TableEmptyRow colSpan={9}>{EXAMS_PAGE.table.noEntry}</TableEmptyRow>
          ) : (
            examGroups.map((group, i) => {
              const rep = group[0]; // representative record for shared fields
              const isPublished = group.every((e) => e.is_published);
              const isEnabled = group.every((e) => e.is_enabled);
              return (
                <TableRow key={rep.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{rep.exam_name}</TableCell>
                  <TableCell>
                    <Badge variant="info">{rep.exam_term}</Badge>
                  </TableCell>
                  <TableCell>
                    <Div type="row" gap="xs" wrap>
                      {group.map((e) => (
                        <Badge key={e.id} variant="default">
                          {classNameById[e.class_id] ?? e.class_id.slice(0, 6)}
                        </Badge>
                      ))}
                    </Div>
                  </TableCell>
                  <TableCell>{rep.start_date}</TableCell>
                  <TableCell>{rep.end_date}</TableCell>
                  <TableCell>
                    <Badge variant={isPublished ? "success" : "warning"}>
                      {isPublished ? "Published" : "Draft"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={isEnabled ? "success" : "default"}>
                      {isEnabled ? "Active" : "Disabled"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Div type="row" gap="xs">
                      <Button size="icon-sm" variant="ghost" title="Edit"
                        onClick={() => router.push(EXAM_ROUTES.exams.edit(rep.id))}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="icon-sm" variant="ghost"
                        title={isPublished ? "Unpublish" : "Publish"}
                        onClick={() => togglePublishGroup(group, !isPublished)}>
                        {isPublished
                          ? <Send size={14} className="text-amber-500" />
                          : <SendHorizonal size={14} className="text-emerald-500" />}
                      </Button>
                      <Button size="icon-sm" variant="destructive" title="Delete"
                        onClick={() => removeGroup(group)}>
                        <Trash2 size={14} />
                      </Button>
                    </Div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} />
      )}
    </PageCol>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <ExamsContent />
    </Suspense>
  );
}