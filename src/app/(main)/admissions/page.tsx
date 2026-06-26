"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye, Pencil, Trash2, UserCheck } from "lucide-react";
import { useAdmissionEnquiries, useAdmissionLookups } from "@/hooks/useAdmissions";
import { useAcademicYears } from "@/hooks/useAcademicYears";
import { useFilterParams } from "@/hooks/useFilterParams";
import type {
  AdmissionEnquiryFilters,
  EnquiryStatus,
} from "@/types/admissions.types";
import {
  Div,
  P,
  Button,
  Input,
  Select,
  PageHeader,
  PageCol,
  FilterBar,
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
} from "@/components/ui";
import {
  ADMISSION_PAGE,
  STATUS_BADGE,
  STATUS_OPTIONS,
} from "@/constants/admission.constants";

function AdmissionsContent() {
  const router = useRouter();
  const { years } = useAcademicYears();
  const { classes, teachers } = useAdmissionLookups();

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    applying_class_id: undefined,
    status: undefined,
    search: undefined,
    page: undefined,
  });

  const initialFilters: AdmissionEnquiryFilters = {
    academic_year_id: urlFilters.academic_year_id || undefined,
    applying_class_id: urlFilters.applying_class_id || undefined,
    status: (urlFilters.status as EnquiryStatus) || undefined,
    search: urlFilters.search || undefined,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  const {
    enquiries,
    pagination,
    filters,
    isLoading,
    updateFilters,
    deleteEnquiry,
  } = useAdmissionEnquiries(initialFilters);

  function handleFilterChange(next: Partial<AdmissionEnquiryFilters>) {
    updateFilters(next);
    const urlNext: Record<string, string | undefined> = {};
    if ("academic_year_id" in next)
      urlNext.academic_year_id = next.academic_year_id || undefined;
    if ("applying_class_id" in next)
      urlNext.applying_class_id = next.applying_class_id || undefined;
    if ("status" in next) urlNext.status = next.status || undefined;
    if ("search" in next) urlNext.search = next.search || undefined;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

  return (
    <PageCol>
      <PageHeader
        title={ADMISSION_PAGE.pageHeading.title}
        subtitle={pagination ? `${pagination.total} enquiries` : ""}
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => router.push("/admissions/source")}
            >
              {ADMISSION_PAGE.buttons.manage}
            </Button>
            <Button onClick={() => router.push("/admissions/create-new")}>
              <Plus size={16} /> {ADMISSION_PAGE.buttons.addEnquiry}
            </Button>
          </>
        }
      />

      {/* Filters */}
      <FilterBar>
        <Input
          width="md"
          placeholder="Search student name or phone…"
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
        <Select
          width="sm"
          value={filters.applying_class_id ?? ""}
          onChange={(e) =>
            handleFilterChange({
              applying_class_id: e.target.value || undefined,
            })
          }
        >
          <option value="">All Classes</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            handleFilterChange({
              status: (e.target.value as EnquiryStatus) || undefined,
            })
          }
        >
          {STATUS_OPTIONS.map((o) => (
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
            <TableHeaderCell>{ADMISSION_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>
              {ADMISSION_PAGE.table.studentName}
            </TableHeaderCell>
            <TableHeaderCell>{ADMISSION_PAGE.table.fatherName}</TableHeaderCell>
            <TableHeaderCell>
              {ADMISSION_PAGE.table.motherName}{" "}
            </TableHeaderCell>
            <TableHeaderCell>{ADMISSION_PAGE.table.phone} </TableHeaderCell>
            <TableHeaderCell>
              {ADMISSION_PAGE.table.applyingAcadYear}
            </TableHeaderCell>
            <TableHeaderCell>
              {" "}
              {ADMISSION_PAGE.table.applyingClass}{" "}
            </TableHeaderCell>
            <TableHeaderCell>
              {ADMISSION_PAGE.table.createdDate}{" "}
            </TableHeaderCell>
            <TableHeaderCell>
              {ADMISSION_PAGE.table.followUpDate}
            </TableHeaderCell>
            <TableHeaderCell>
              {ADMISSION_PAGE.table.teacherAssigned}{" "}
            </TableHeaderCell>
            <TableHeaderCell>{ADMISSION_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}>
              <Spinner />
            </TableEmptyRow>
          ) : enquiries.length === 0 ? (
            <TableEmptyRow colSpan={6}>
              {ADMISSION_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            enquiries.map((enq, i) => (
              <TableRow key={enq.id}>
                <TableCell>{i + 1} </TableCell>
                <TableCell primary>
                  <Div type="col" gap="xs">
                    <P>{enq.student_name}</P>
                  </Div>
                </TableCell>
                <TableCell>
                  <Badge variant={STATUS_BADGE[enq.status]}>
                    {enq.status.replace("_", " ")}
                  </Badge>
                </TableCell>
                <TableCell>{enq.father_name} </TableCell>
                <TableCell>{enq.mother_name} </TableCell>
                <TableCell>
                  {enq.dial_code} {enq.phone}
                </TableCell>
                <TableCell>
                  {years.find((y) => y.id === enq.applying_academic_year_id)
                    ?.name ?? "-"}
                </TableCell>
                <TableCell>
                  {classes.find((c) => c.id === enq.applying_class_id)?.name ??
                    "—"}
                </TableCell>
                <TableCell>
                  {new Date(enq.created_at).toLocaleString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  })}
                </TableCell>
                <TableCell>
                  {enq.next_followup_date
                    ? new Date(enq.next_followup_date).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        },
                      )
                    : "—"}
                </TableCell>
                <TableCell>
                  {teachers.find((t) => t.id === enq.assigned_teacher_id)
                    ?.first_name ?? "—"}
                </TableCell>

                <TableCell>
                  <Div type="row" gap="sm">
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() => router.push(`/admissions/${enq.id}`)}
                      title="View"
                    >
                      <Eye size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="ghost"
                      onClick={() =>
                        router.push(`/admissions/${enq.id}?edit=true`)
                      }
                      title="Edit"
                    >
                      <Pencil size={14} />
                    </Button>
                    <Button
                      size="icon-sm"
                      variant="destructive"
                      onClick={() => deleteEnquiry(enq.id)}
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
    </PageCol>
  );
}

export default function AdmissionsPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AdmissionsContent />
    </Suspense>
  );
}
