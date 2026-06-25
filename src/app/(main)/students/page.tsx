"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Eye,
  Pencil,
  Trash2,
  CreditCard,
  ToggleLeft,
  ToggleRight,
} from "lucide-react";
import { useStudents } from "@/hooks/useStudentV2";
import { useAcademicYears } from "@/hooks/useAcademicYears";
// import { useFilterParams } from "@/hooks/useFilterParams";
import { useState, useEffect } from "react";
import { ClassesService, SectionsService } from "@/services/classes.service";
import type { Class, Section } from "@/types";
import type {
  StudentFilters,
  StudentStatus,
  Gender,
} from "@/types/students.types";
import {
  Div,
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
  PageCol,
  FilterBar,
  PageHeader,
} from "@/components/ui";
import {
  STUDENT_PAGE,
  STUDENT_ROUTES,
  STATUS_BADGE,
  STUDENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
} from "@/constants/students-v2.constants";
import { useFilterParams } from "@/hooks/useFilterParams";

function StudentsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();
  const [classes, setClasses] = useState<Class[]>([]);
  const [sections, setSections] = useState<Section[]>([]);

  // Persistent URL filters
  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    class_id: undefined,
    section_id: undefined,
    status: undefined,
    gender: undefined,
    search: undefined,
    page: undefined,
  });

  const initialFilters: StudentFilters = {
    academic_year_id: urlFilters.academic_year_id,
    class_id: urlFilters.class_id,
    section_id: urlFilters.section_id,
    status: urlFilters.status as StudentStatus | undefined,
    gender: urlFilters.gender as Gender | undefined,
    search: urlFilters.search,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    students,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteStudent,
    toggleEnabled,
  } = useStudents(initialFilters);

  // Load classes when academic year changes
  useEffect(() => {
    if (!filters.academic_year_id) {
      setClasses([]);
      setSections([]);
      return;
    }
    ClassesService.list({
      academic_year_id: filters.academic_year_id,
      limit: 100,
    })
      .then((r) => setClasses(r.items))
      .catch(() => {});
  }, [filters.academic_year_id]);

  // Load sections when class changes
  useEffect(() => {
    if (!filters.class_id) {
      setSections([]);
      return;
    }
    SectionsService.list({ class_id: filters.class_id, limit: 100 })
      .then((r) => setSections(r.items))
      .catch(() => {});
  }, [filters.class_id]);

  function handleFilterChange(next: Partial<StudentFilters>) {
    updateFilters(next);
    const urlNext: Record<string, string | undefined> = {};
    if ("academic_year_id" in next)
      urlNext.academic_year_id = next.academic_year_id;
    if ("class_id" in next) {
      urlNext.class_id = next.class_id;
      urlNext.section_id = undefined;
    }
    if ("section_id" in next) urlNext.section_id = next.section_id;
    if ("status" in next) urlNext.status = next.status;
    if ("gender" in next) urlNext.gender = next.gender;
    if ("search" in next) urlNext.search = next.search;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

  return (
    <PageCol>
      <PageHeader
        title={STUDENT_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} students` : ""}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push(STUDENT_ROUTES.generate)}
            >
              <CreditCard size={16} />
              {STUDENT_PAGE.buttons.generateCards}
            </Button>
            <Button onClick={() => router.push(STUDENT_ROUTES.createNew)}>
              <Plus size={16} />
              {STUDENT_PAGE.buttons.addStudent}
            </Button>
          </>
        }
      />

      <FilterBar>
        <Input
          width="md"
          placeholder={STUDENT_PAGE.filters.search}
          value={filters.search ?? ""}
          onChange={(e) =>
            handleFilterChange({ search: e.target.value || undefined })
          }
        />
        <Select
          width="sm"
          value={filters.academic_year_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              academic_year_id: e.target.value || undefined,
              class_id: undefined,
              section_id: undefined,
            })
          }
        >
          <option value="">{STUDENT_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
              {y.is_current ? " (Current)" : ""}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.class_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              class_id: e.target.value || undefined,
              section_id: undefined,
            })
          }
          disabled={!filters.academic_year_id}
        >
          <option value="">{STUDENT_PAGE.filters.allClasses}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.section_id ?? ""}
          onChange={(e) =>
            handleFilterChange({ section_id: e.target.value || undefined })
          }
          disabled={!filters.class_id}
        >
          <option value="">{STUDENT_PAGE.filters.allSections}</option>
          {sections.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            handleFilterChange({
              status: (e.target.value as StudentStatus) || undefined,
            })
          }
        >
          <option value="">{STUDENT_PAGE.filters.allStatus}</option>
          {STUDENT_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.gender ?? ""}
          onChange={(e) =>
            handleFilterChange({
              gender: (e.target.value as Gender) || undefined,
            })
          }
        >
          <option value="">{STUDENT_PAGE.filters.allGender}</option>
          {GENDER_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
      </FilterBar>

      {/* Table */}
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{STUDENT_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.systemNo}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.studentName}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.section}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.admissionNo}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.rollNo}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.gender}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.phone}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{STUDENT_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={11}>
              <Spinner />
            </TableEmptyRow>
          ) : students.length === 0 ? (
            <TableEmptyRow colSpan={11}>
              {STUDENT_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            students.map((s, i) => (
              <TableRow key={s.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell>
                  <P color="muted" className="font-mono text-xs">
                    #{s.system_number}
                  </P>
                </TableCell>
                <TableCell primary>
                  <Div type="row" align="center" gap="sm">
                    {s.profile_image ? (
                      <img
                        src={s.profile_image}
                        alt={s.first_name}
                        className="h-7 w-7 rounded-full object-cover shrink-0"
                      />
                    ) : (
                      <Div className="h-7 w-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                        <P color="muted" className="text-xs font-semibold">
                          {s.first_name[0]}
                          {s.last_name?.[0] ?? ""}
                        </P>
                      </Div>
                    )}
                    <span>
                      {s.first_name} {s.last_name ?? ""}
                    </span>
                  </Div>
                </TableCell>
                <TableCell>{s.class_name ?? "—"}</TableCell>
                <TableCell>{s.section_name ?? "—"}</TableCell>
                <TableCell>{s.admission_number ?? "—"}</TableCell>
                <TableCell>{s.roll_number ?? "—"}</TableCell>
                <TableCell>
                  {s.gender
                    ? s.gender.charAt(0) + s.gender.slice(1).toLowerCase()
                    : "—"}
                </TableCell>
                <TableCell>{s.phone_number ?? "—"}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[s.status]}>{s.status}</Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="View"
                      onClick={() => router.push(STUDENT_ROUTES.view(s.id))}
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Edit"
                      onClick={() => router.push(STUDENT_ROUTES.edit(s.id))}
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title={s.is_enabled ? "Disable" : "Enable"}
                      onClick={() => toggleEnabled(s.id, !s.is_enabled)}
                    >
                      {s.is_enabled ? (
                        <ToggleRight size={14} className="text-emerald-500" />
                      ) : (
                        <ToggleLeft
                          size={14}
                          className="text-muted-foreground"
                        />
                      )}
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      title="Generate ID Card"
                      onClick={() =>
                        router.push(
                          `${STUDENT_ROUTES.generate}?studentId=${s.id}`,
                        )
                      }
                    >
                      <CreditCard size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      title="Delete"
                      onClick={() => deleteStudent(s.id)}
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
    </PageCol>
  );
}

export default function StudentsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StudentsContent />
    </Suspense>
  );
}
