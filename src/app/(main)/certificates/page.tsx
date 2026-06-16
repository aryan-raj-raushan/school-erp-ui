"use client";

import { Suspense, useState, } from "react";
import { useRouter } from "next/navigation";
import { Plus, Eye } from "lucide-react";
import {
  useTransferCertificates,
  useBonafideCertificates,
} from "@/hooks/useCertificates";
import { useFilterParams } from "@/hooks/useFilterParams";
import type { CertificateFilters } from "@/types/certificates.types";
import {
  CERTIFICATE_PAGE,
  type CertificateType,
} from "@/constants/certificate.constants";
import { PageHeader } from "@/components/ui/page-header";
import {
  Div,
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
} from "@/components/ui";
import { useAcademicClassSection } from "@/hooks/useAcademicClassSection";
import { Class } from "@/types";

// ─── Type Toggle ──────────────────────────────────────────────────────────────

interface TypeToggleProps {
  value: CertificateType;
  onChange: (v: CertificateType) => void;
}

function TypeToggle({ value, onChange }: TypeToggleProps) {
  const options: { key: CertificateType; label: string }[] = [
    { key: "transfer", label: CERTIFICATE_PAGE.toggle.transfer },
    { key: "bonafide", label: CERTIFICATE_PAGE.toggle.bonafide },
  ];

  return (
    <Div
      type="row"
      gap="xs"
      className="rounded-lg border border-border bg-muted/30 p-1"
    >
      {options.map((opt) => (
        <Div
          key={opt.key}
          // type="button"
          onClick={() => onChange(opt.key)}
          className={[
            "rounded-md px-4 py-1.5 text-sm font-medium transition-all",
            value === opt.key
              ? "bg-background text-foreground shadow-sm border border-border/60"
              : "text-muted-foreground hover:text-foreground",
          ].join(" ")}
        >
          {opt.label}
        </Div>
      ))}
    </Div>
  );
}

// ─── Transfer Table ───────────────────────────────────────────────────────────

function TransferTable({
  filters,
  onFilterChange,
  years,
  classes,
  sections,
}: {
  filters: CertificateFilters;
  onFilterChange: (next: Partial<CertificateFilters>) => void;
  years: { id: string; name: string }[];
  classes: Class[];
  sections: { id: string; name: string }[];
}) {
  const router = useRouter();
  const { certificates, pagination, isLoading } =
    useTransferCertificates(filters);

  console.log("certificates: ", certificates);

  return (
    <>
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.referenceNo}
            </TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.studentName}
            </TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.section}</TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.academicYear}
            </TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.leavingReason}
            </TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.createdDate}
            </TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={10}>
              <Spinner />
            </TableEmptyRow>
          ) : certificates.length === 0 ? (
            <TableEmptyRow colSpan={10}>
              {CERTIFICATE_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            certificates?.map((cert, i) => (
              <TableRow key={cert.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>
                  <Badge className="font-mono text-xs">{cert.reference_no}</Badge>
                </TableCell>
                <TableCell>{cert.student_name}</TableCell>
                <TableCell>{cert.class_name ?? "—"}</TableCell>
                <TableCell>{cert.section_name ?? "—"}</TableCell>
                <TableCell>{cert.academic_year_name ?? "—"}</TableCell>
                <TableCell>{cert.leaving_reason}</TableCell>
                <TableCell>
                  <Badge variant={CERTIFICATE_PAGE.statusBadge[cert.status]}>
                    {CERTIFICATE_PAGE.status[cert.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(cert.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/certificates/transfer/view?id=${cert.id}`)
                    }
                    title="View"
                  >
                    <Eye size={14} />
                  </Button>
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
    </>
  );
}

// ─── Bonafide Table ───────────────────────────────────────────────────────────

function BonafideTable({ filters }: { filters: CertificateFilters }) {
  const router = useRouter();
  const { certificates, pagination, isLoading } =
    useBonafideCertificates(filters);

  return (
    <>
      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.sno}</TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.referenceNo}
            </TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.studentName}
            </TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.class}</TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.section}</TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.academicYear}
            </TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.purpose}</TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>
              {CERTIFICATE_PAGE.table.createdDate}
            </TableHeaderCell>
            <TableHeaderCell>{CERTIFICATE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={10}>
              <Spinner />
            </TableEmptyRow>
          ) : certificates.length === 0 ? (
            <TableEmptyRow colSpan={10}>
              {CERTIFICATE_PAGE.table.noEntry}
            </TableEmptyRow>
          ) : (
            certificates?.map((cert, i) => (
              <TableRow key={cert.id}>
                <TableCell>{i + 1}</TableCell>
                <TableCell primary>
                  <Badge className="font-mono text-xs">{cert.reference_no}</Badge>
                </TableCell>
                <TableCell>{cert.student_name}</TableCell>
                <TableCell>{cert.class_name ?? "—"}</TableCell>
                <TableCell>{cert.section_name ?? "—"}</TableCell>
                <TableCell>{cert.academic_year_name ?? "—"}</TableCell>
                <TableCell>{cert.purpose}</TableCell>
                <TableCell>
                  <Badge variant={CERTIFICATE_PAGE.statusBadge[cert.status]}>
                    {CERTIFICATE_PAGE.status[cert.status]}
                  </Badge>
                </TableCell>
                <TableCell>
                  {new Date(cert.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </TableCell>
                <TableCell>
                  <Button
                    size="icon-sm"
                    variant="ghost"
                    onClick={() =>
                      router.push(`/certificates/bonafide/view?id=${cert.id}`)
                    }
                    title="View"
                  >
                    <Eye size={14} />
                  </Button>
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
    </>
  );
}

// ─── Main Content ─────────────────────────────────────────────────────────────

function CertificatesContent() {
  const router = useRouter();

  const {
    years,
    classes,
    sections,
  } = useAcademicClassSection();

  const [certType, setCertType] = useState<CertificateType>("transfer");

  const [urlFilters, setUrlFilters] = useFilterParams<
    Record<string, string | undefined>
  >({
    academic_year_id: undefined,
    class_id: undefined,
    section_id: undefined,
    status: undefined,
    search: undefined,
    page: undefined,
  });

  const filters: CertificateFilters = {
    academic_year_id: urlFilters.academic_year_id,
    class_id: urlFilters.class_id,
    section_id: urlFilters.section_id,
    status: urlFilters.status,
    search: urlFilters.search,
    page: urlFilters.page ? Number(urlFilters.page) : 1,
  };

  function handleFilterChange(next: Partial<CertificateFilters>) {
    const urlNext: Record<string, string | undefined> = {};
    if ("academic_year_id" in next)
      urlNext.academic_year_id = next.academic_year_id;
    if ("class_id" in next) urlNext.class_id = next.class_id;
    if ("section_id" in next) urlNext.section_id = next.section_id;
    if ("status" in next) urlNext.status = next.status;
    if ("search" in next) urlNext.search = next.search;
    if ("page" in next)
      urlNext.page = next.page ? String(next.page) : undefined;
    setUrlFilters(urlNext);
  }

  const createRoute =
    certType === "transfer"
      ? "/certificates/transfer/create-new"
      : "/certificates/bonafide/create-new";

  const createLabel =
    certType === "transfer"
      ? CERTIFICATE_PAGE.buttons.createTransfer
      : CERTIFICATE_PAGE.buttons.createBonafide;

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={CERTIFICATE_PAGE.title}
        subtitle={CERTIFICATE_PAGE.description}
        actions={
          <Button onClick={() => router.push(createRoute)}>
            <Plus size={16} />
            {createLabel}
          </Button>
        }
      />

      {/* Type Toggle + Filters */}
      <Div type="row" gap="md" align="center" wrap>
        <TypeToggle value={certType} onChange={setCertType} />

        <Input
          width="md"
          placeholder={CERTIFICATE_PAGE.filters.search}
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
          <option value="">{CERTIFICATE_PAGE.filters.allYears}</option>
          {years.map((y) => (
            <option key={y.id} value={y.id}>
              {y.name}
            </option>
          ))}
        </Select>

        <Select
          width="sm"
          value={filters.class_id ?? ""}
          onChange={(e) =>
            handleFilterChange({ class_id: e.target.value || undefined })
          }
        >
          <option value="">{CERTIFICATE_PAGE.filters.allClasses}</option>
          {classes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </Select>

        {sections.length > 0 && (
          <Select
            width="sm"
            value={filters.section_id ?? ""}
            onChange={(e) =>
              handleFilterChange({ section_id: e.target.value || undefined })
            }
          >
            <option value="">{CERTIFICATE_PAGE.filters.allSections}</option>
            {sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </Select>
        )}

        <Select
          width="sm"
          value={filters.status ?? ""}
          onChange={(e) =>
            handleFilterChange({ status: e.target.value || undefined })
          }
        >
          <option value="">{CERTIFICATE_PAGE.filters.allStatuses}</option>
          {Object.entries(CERTIFICATE_PAGE.status).map(([key, label]) => (
            <option key={key} value={key}>
              {label}
            </option>
          ))}
        </Select>
      </Div>

      {/* Table */}
      {certType === "transfer" ? (
        <TransferTable
          filters={filters}
          onFilterChange={handleFilterChange}
          years={years}
          classes={classes}
          sections={sections}
        />
      ) : (
        <BonafideTable filters={filters} />
      )}
    </Div>
  );
}

export default function CertificatesPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <CertificatesContent />
    </Suspense>
  );
}
