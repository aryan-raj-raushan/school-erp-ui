"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash2, Send, SendHorizonal } from "lucide-react";
import { useExams } from "@/hooks/exam/useExams";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div, P, Button, Select, Badge, Spinner,
  Table, TableHead, TableHeadRow, TableHeaderCell,
  TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
} from "@/components/ui";
import { EXAMS_PAGE, EXAM_ROUTES, EXAM_TERM_OPTIONS } from "@/constants/exam.constants";
import type { ExamFilters } from "@/types/exam.types";

function ExamsContent() {
  const router = useRouter();
  const { exams, pagination, filters, isLoading, updateFilters, remove, togglePublish } = useExams();

  console.log("exams: ", exams);

  const {
    years, classes,
    selectedAcademicYearId, setSelectedAcademicYearId,
    selectedClassId, handleClassChange,
  } = useAcademicClassSection({ autoSelectCurrentYear: false });

  function handleYearChange(val: string) {
    setSelectedAcademicYearId(val);
    handleClassChange("");
    updateFilters({ academic_year_id: val || undefined, class_id: undefined });
  }

  function handleClassFilter(val: string) {
    handleClassChange(val);
    updateFilters({ class_id: val || undefined });
  }

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={EXAMS_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} exams` : ""}
        actions={
          <Button onClick={() => router.push(EXAM_ROUTES.exams.create)}>
            <Plus size={16} /> {EXAMS_PAGE.buttons.add}
          </Button>
        }
      />

      {/* Filters */}
      <Div type="row" gap="md" align="center" wrap>
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
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{EXAMS_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.examName}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.term}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.startDate}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.endDate}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.published}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{EXAMS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
          ) : exams.length === 0 ? (
            <TableEmptyRow colSpan={8}>{EXAMS_PAGE.table.noEntry}</TableEmptyRow>
          ) : (
            exams.map((exam, i) => (
              <TableRow key={exam.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>{exam.exam_name}</TableCell>
                <TableCell>
                  <Badge variant="info">{exam.exam_term}</Badge>
                </TableCell>
                <TableCell>{exam.start_date}</TableCell>
                <TableCell>{exam.end_date}</TableCell>
                <TableCell>
                  <Badge variant={exam.is_published ? "success" : "warning"}>
                    {exam.is_published ? "Published" : "Draft"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={exam.is_enabled ? "success" : "default"}>
                    {exam.is_enabled ? "Active" : "Disabled"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="icon-sm" variant="ghost" title="Edit"
                      onClick={() => router.push(EXAM_ROUTES.exams.edit(exam.id))}>
                      <Pencil size={14} />
                    </Button>
                    <Button size="icon-sm" variant="ghost"
                      title={exam.is_published ? "Unpublish" : "Publish"}
                      onClick={() => togglePublish(exam.id, !exam.is_published)}>
                      {exam.is_published
                        ? <Send size={14} className="text-amber-500" />
                        : <SendHorizonal size={14} className="text-emerald-500" />}
                    </Button>
                    <Button size="icon-sm" variant="destructive" title="Delete"
                      onClick={() => remove(exam.id)}>
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
        <TablePagination total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} />
      )}
    </Div>
  );
}

export default function ExamsPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <ExamsContent />
    </Suspense>
  );
}