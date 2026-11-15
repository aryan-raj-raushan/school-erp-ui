"use client";

import * as React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  KeyRound,
  Loader2,
  RefreshCw,
  ShieldCheck,
  UploadCloud,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Modal, ModalBody, ModalFooter } from "./modal";
import { Button } from "./button";
import { Switch } from "./switch";
import type { BulkImportController, BulkImportFilter, BulkImportStep } from "@/hooks/useBulkImport";
import type { ReportColumn, ReportRow, RowIssue, RowStatus } from "@/types/bulk-import.types";

const MAX_PREVIEW_ROWS = 300;

const STEPS: { key: BulkImportStep; label: string }[] = [
  { key: "upload", label: "Upload" },
  { key: "review", label: "Review" },
  { key: "importing", label: "Import" },
];

const STATUS_STYLE: Record<RowStatus, { label: string; badge: string; cell: string }> = {
  ready: {
    label: "Ready",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
    cell: "",
  },
  warning: {
    label: "Warning",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    cell: "bg-amber-50 ring-1 ring-inset ring-amber-300 dark:bg-amber-900/20 dark:ring-amber-700",
  },
  error: {
    label: "Error",
    badge: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
    cell: "bg-red-50 ring-1 ring-inset ring-red-300 dark:bg-red-900/20 dark:ring-red-700",
  },
};

export function ImportStepper({ step }: { step: BulkImportStep }) {
  const active = step === "done" ? STEPS.length : STEPS.findIndex((s) => s.key === step);
  return (
    <ol className="flex items-center gap-2 px-4 pt-4 sm:px-6">
      {STEPS.map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <li key={s.key} className="flex flex-1 items-center gap-2">
            <span
              className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                done && "bg-emerald-500 text-white",
                current && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                !done && !current && "bg-muted text-muted-foreground",
              )}
            >
              {done ? <CheckCircle2 size={15} /> : i + 1}
            </span>
            <span className={cn("text-sm font-medium", current ? "text-foreground" : "text-muted-foreground")}>
              {s.label}
            </span>
            {i < STEPS.length - 1 && (
              <span className={cn("h-px flex-1 transition-colors", done ? "bg-emerald-400" : "bg-border")} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export function ImportAlert({
  tone,
  title,
  children,
}: {
  tone: "error" | "warning" | "info";
  title: string;
  children?: React.ReactNode;
}) {
  const Icon = tone === "info" ? ShieldCheck : AlertTriangle;
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "flex gap-3 rounded-2xl border p-3 text-sm",
        tone === "error" && "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300",
        tone === "warning" && "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-300",
        tone === "info" && "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950/40 dark:text-sky-300",
      )}
    >
      <Icon size={18} className="mt-0.5 shrink-0" />
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">{title}</p>
        {children && <div className="break-words opacity-90">{children}</div>}
      </div>
    </div>
  );
}

export function ImportDropzone({
  checking,
  fileName,
  onSelect,
  accept,
  hint,
}: {
  checking: boolean;
  fileName?: string;
  onSelect: (file: File | undefined) => void;
  accept: string;
  hint: string;
}) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = React.useState(false);

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Upload Excel file"
      onClick={() => !checking && inputRef.current?.click()}
      onKeyDown={(e) => {
        if ((e.key === "Enter" || e.key === " ") && !checking) inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        if (!checking) onSelect(e.dataTransfer.files?.[0]);
      }}
      className={cn(
        "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed px-6 py-10 text-center transition-all",
        dragging ? "scale-[1.01] border-primary bg-primary/5" : "border-border hover:border-primary/60 hover:bg-muted/40",
        checking && "cursor-wait opacity-80",
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          onSelect(e.target.files?.[0]);
          e.target.value = "";
        }}
      />
      <span
        className={cn(
          "flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary transition-transform",
          dragging && "scale-110",
        )}
      >
        {checking ? <Loader2 size={26} className="animate-spin" /> : <UploadCloud size={26} />}
      </span>
      {checking ? (
        <div>
          <p className="font-semibold text-foreground">Checking {fileName}…</p>
          <p className="text-sm text-muted-foreground">Validating every row and looking for duplicates</p>
        </div>
      ) : (
        <div>
          <p className="font-semibold text-foreground">
            Drag & drop your Excel file here, or <span className="text-primary underline">browse</span>
          </p>
          <p className="text-sm text-muted-foreground">{hint}</p>
        </div>
      )}
    </div>
  );
}

function UploadStep({ ctrl }: { ctrl: BulkImportController }) {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 rounded-3xl border border-border/60 bg-muted/30 p-4 sm:flex-row sm:items-center">
        <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
          <FileSpreadsheet size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-foreground">Start from the sample Excel</p>
          <p className="text-sm text-muted-foreground">
            Built from your school&apos;s live setup — dropdowns for classes, sections, roles, accounts and
            heads, rules for every column, and example rows.
          </p>
        </div>
        <Button variant="outline" onClick={ctrl.downloadTemplate} loading={ctrl.busy === "template"}>
          <Download size={14} /> Download sample
        </Button>
      </div>

      <ImportDropzone
        checking={ctrl.busy === "validate"}
        fileName={ctrl.file?.name}
        onSelect={ctrl.selectFile}
        accept=".xlsx,.csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
        hint=".xlsx or .csv · up to 5 MB · up to 2,000 rows"
      />

      {ctrl.error && (
        <ImportAlert tone="error" title="This file can't be imported yet">
          {ctrl.error}
        </ImportAlert>
      )}

      <ul className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
        {[
          "Nothing is saved until you review and confirm.",
          "Duplicates are checked inside the file and against existing records.",
          "Download a highlighted error report, fix it and re-upload.",
        ].map((tip) => (
          <li key={tip} className="flex gap-2 rounded-2xl bg-muted/30 p-3">
            <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
            {tip}
          </li>
        ))}
      </ul>
    </div>
  );
}

const FILTERS: { key: BulkImportFilter; label: string; tone: "default" | "success" | "warning" | "danger" }[] = [
  { key: "all", label: "Total rows", tone: "default" },
  { key: "ready", label: "Ready", tone: "success" },
  { key: "warning", label: "Warnings", tone: "warning" },
  { key: "error", label: "Errors", tone: "danger" },
];

export function ImportSummaryTiles({
  summary,
  filter,
  onFilter,
}: {
  summary: { total: number; ready: number; warning: number; error: number };
  filter: BulkImportFilter;
  onFilter: (filter: BulkImportFilter) => void;
}) {
  const counts: Record<BulkImportFilter, number> = {
    all: summary.total,
    ready: summary.ready,
    warning: summary.warning,
    error: summary.error,
  };
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {FILTERS.map((f) => (
        <SummaryTile
          key={f.key}
          label={f.label}
          value={counts[f.key]}
          tone={f.tone}
          active={filter === f.key}
          onClick={() => onFilter(f.key)}
        />
      ))}
    </div>
  );
}

function SummaryTile({
  label,
  value,
  tone,
  active,
  onClick,
}: {
  label: string;
  value: number;
  tone: "default" | "success" | "warning" | "danger";
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "rounded-2xl border p-3 text-left transition-all hover:shadow-sm",
        active ? "border-primary ring-2 ring-primary/30" : "border-border/60",
        tone === "success" && "bg-emerald-50/60 dark:bg-emerald-950/20",
        tone === "warning" && "bg-amber-50/60 dark:bg-amber-950/20",
        tone === "danger" && "bg-red-50/60 dark:bg-red-950/20",
      )}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <p
        className={cn(
          "text-2xl font-bold tabular-nums",
          tone === "success" && "text-emerald-600",
          tone === "warning" && "text-amber-600",
          tone === "danger" && "text-red-600",
        )}
      >
        {value.toLocaleString("en-IN")}
      </p>
    </button>
  );
}

function issueLabel(issue: RowIssue, headers: Map<string, string>): string {
  return issue.column ? `${headers.get(issue.column) ?? issue.column}: ${issue.message}` : issue.message;
}

export function ImportPreviewGrid({
  columns,
  rows,
}: {
  columns: ReportColumn[];
  rows: ReportRow[];
}) {
  const headers = React.useMemo(() => new Map(columns.map((c) => [c.key, c.header])), [columns]);
  const shown = rows.slice(0, MAX_PREVIEW_ROWS);
  const visibleColumns = React.useMemo(
    () =>
      columns.filter(
        (c) => c.required || rows.some((r) => r.values[c.key] || r.issues.some((i) => i.column === c.key)),
      ),
    [columns, rows],
  );

  if (!rows.length) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-10 text-sm text-muted-foreground">
        <CheckCircle2 size={22} className="text-emerald-500" />
        No rows in this view.
      </div>
    );
  }

  return (
    <div className="max-h-[46dvh] overflow-auto rounded-2xl border border-border/60">
      <table className="w-full border-separate border-spacing-0 text-sm">
        <thead className="sticky top-0 z-20 bg-muted/95 backdrop-blur">
          <tr>
            <th className="sticky left-0 z-30 bg-muted/95 px-3 py-2 text-left text-xs font-semibold">Row</th>
            <th className="px-3 py-2 text-left text-xs font-semibold">Status</th>
            <th className="min-w-[260px] px-3 py-2 text-left text-xs font-semibold">What to fix</th>
            {visibleColumns.map((c) => (
              <th key={c.key} className="whitespace-nowrap px-3 py-2 text-left text-xs font-semibold">
                {c.header}
                {c.required && <span className="text-red-500"> *</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {shown.map((row) => {
            const style = STATUS_STYLE[row.status];
            return (
              <tr key={row.row} className="align-top hover:bg-muted/30">
                <td className="sticky left-0 z-10 border-t border-border/40 bg-background px-3 py-2 font-mono text-xs text-muted-foreground">
                  {row.row}
                </td>
                <td className="border-t border-border/40 px-3 py-2">
                  <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-semibold", style.badge)}>
                    {style.label}
                  </span>
                </td>
                <td className="border-t border-border/40 px-3 py-2">
                  {row.issues.length ? (
                    <ul className="space-y-1">
                      {row.issues.map((issue, i) => (
                        <li
                          key={i}
                          className={cn(
                            "flex gap-1.5 text-xs",
                            issue.severity === "error" ? "text-red-600 dark:text-red-400" : "text-amber-700 dark:text-amber-400",
                          )}
                        >
                          {issue.severity === "error" ? (
                            <XCircle size={13} className="mt-0.5 shrink-0" />
                          ) : (
                            <AlertTriangle size={13} className="mt-0.5 shrink-0" />
                          )}
                          <span>{issueLabel(issue, headers)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <span className="text-xs text-emerald-600">Looks good</span>
                  )}
                </td>
                {visibleColumns.map((c) => {
                  const cellIssues = row.issues.filter((i) => i.column === c.key);
                  const severity = cellIssues.some((i) => i.severity === "error")
                    ? "error"
                    : cellIssues.length
                      ? "warning"
                      : null;
                  return (
                    <td
                      key={c.key}
                      title={cellIssues.map((i) => i.message).join("\n") || undefined}
                      className={cn(
                        "max-w-[220px] truncate whitespace-nowrap border-t border-border/40 px-3 py-2",
                        severity && STATUS_STYLE[severity].cell,
                      )}
                    >
                      {row.values[c.key] || <span className="text-muted-foreground/50">—</span>}
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
      {rows.length > MAX_PREVIEW_ROWS && (
        <p className="border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
          Showing the first {MAX_PREVIEW_ROWS} of {rows.length.toLocaleString("en-IN")} rows. Download the
          report to see all of them.
        </p>
      )}
    </div>
  );
}

function ReviewStep({ ctrl }: { ctrl: BulkImportController }) {
  const report = ctrl.report!;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-muted/30 p-3">
        <FileSpreadsheet size={20} className="text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{report.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {report.summary.total.toLocaleString("en-IN")} rows checked
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={ctrl.recheck} loading={ctrl.busy === "validate"}>
          <RefreshCw size={14} /> Re-check
        </Button>
        <Button variant="outline" size="sm" onClick={ctrl.reset} disabled={!!ctrl.busy}>
          <UploadCloud size={14} /> Upload another file
        </Button>
      </div>

      {report.header_issues.length > 0 && (
        <ImportAlert tone="warning" title="Some columns need attention">
          <ul className="list-disc pl-4">
            {report.header_issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </ImportAlert>
      )}

      <ImportSummaryTiles summary={report.summary} filter={ctrl.filter} onFilter={ctrl.setFilter} />

      {ctrl.importableCount === 0 ? (
        <ImportAlert tone="error" title="Nothing can be imported yet">
          Every row has at least one error. Download the error rows, fix the highlighted cells and upload
          the corrected file.
        </ImportAlert>
      ) : report.summary.error > 0 ? (
        <ImportAlert tone="warning" title={`${report.summary.error} row(s) have errors`}>
          Fix them in the file and re-upload, or skip them and import the other {ctrl.importableCount} row(s)
          now.
        </ImportAlert>
      ) : (
        <ImportAlert tone="info" title="All rows passed the rules">
          {report.summary.warning
            ? `${report.summary.warning} row(s) have warnings — review them, they will still be imported.`
            : "No duplicates or problems were found."}
        </ImportAlert>
      )}

      {ctrl.error && (
        <ImportAlert tone="error" title="The import could not start">
          {ctrl.error}
        </ImportAlert>
      )}

      <ImportPreviewGrid columns={report.columns} rows={ctrl.visibleRows} />
    </div>
  );
}

function ImportingStep({ ctrl }: { ctrl: BulkImportController }) {
  const job = ctrl.job!;
  const percent = job.total ? Math.round((job.processed / job.total) * 100) : 0;
  return (
    <div className="flex flex-col items-center gap-5 py-8 text-center">
      <div className="relative flex size-28 items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 100 100" aria-hidden>
          <circle cx="50" cy="50" r="44" className="fill-none stroke-muted" strokeWidth="8" />
          <circle
            cx="50"
            cy="50"
            r="44"
            className="fill-none stroke-primary transition-all duration-500"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 44}
            strokeDashoffset={2 * Math.PI * 44 * (1 - percent / 100)}
          />
        </svg>
        <span className="text-2xl font-bold tabular-nums">{percent}%</span>
      </div>
      <div>
        <p className="text-lg font-semibold text-foreground">Importing {ctrl.title.toLowerCase()}…</p>
        <p className="text-sm text-muted-foreground" aria-live="polite">
          {job.processed.toLocaleString("en-IN")} of {job.total.toLocaleString("en-IN")} rows processed
        </p>
      </div>
      <div className="flex gap-6 text-sm">
        <span className="text-emerald-600">✓ {job.created} created</span>
        <span className="text-red-600">✕ {job.failed} failed</span>
        {job.skipped > 0 && <span className="text-muted-foreground">{job.skipped} skipped</span>}
      </div>
      <p className="max-w-md text-xs text-muted-foreground">
        Each row goes through the same rules as adding it by hand. You can close this window — the import
        keeps running on the server.
      </p>
    </div>
  );
}

function DoneStep({ ctrl }: { ctrl: BulkImportController }) {
  const job = ctrl.job;
  const failed = job?.results.filter((r) => r.status === "failed") ?? [];
  const allGood = job?.status === "completed" && !failed.length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-2 py-4 text-center">
        <span
          className={cn(
            "flex size-14 items-center justify-center rounded-full",
            allGood ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30" : "bg-amber-100 text-amber-600 dark:bg-amber-900/30",
          )}
        >
          {allGood ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
        </span>
        <p className="text-lg font-semibold text-foreground">
          {allGood ? "Import complete" : job?.status === "failed" ? "Import stopped" : "Import finished with problems"}
        </p>
        {job && (
          <p className="text-sm text-muted-foreground">
            {job.created} created · {job.failed} failed · {job.skipped} skipped
          </p>
        )}
      </div>

      {ctrl.error && <ImportAlert tone="error" title="Something went wrong">{ctrl.error}</ImportAlert>}
      {job?.error && <ImportAlert tone="error" title="Import stopped">{job.error}</ImportAlert>}

      {job && job.credentials.length > 0 && (
        <div className="space-y-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <div className="flex flex-wrap items-center gap-3">
            <KeyRound size={18} className="text-amber-600" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-foreground">{job.credentials.length} login(s) created</p>
              <p className="text-xs text-muted-foreground">
                Temporary passwords are shown only now. Download and share them securely — users must change
                them at first sign-in.
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={ctrl.downloadCredentials}>
              <Download size={14} /> Download credentials
            </Button>
          </div>
        </div>
      )}

      {failed.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Rows that failed while saving</p>
            <Button variant="ghost" size="sm" onClick={ctrl.downloadFailures}>
              <Download size={14} /> Download list
            </Button>
          </div>
          <div className="max-h-56 overflow-auto rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <tbody>
                {failed.map((r) => (
                  <tr key={r.row} className="border-t border-border/40 first:border-t-0">
                    <td className="px-3 py-2 font-mono text-xs text-muted-foreground">Row {r.row}</td>
                    <td className="px-3 py-2 text-red-600 dark:text-red-400">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function Footer({ ctrl }: { ctrl: BulkImportController }) {
  const report = ctrl.report;
  if (ctrl.step === "upload") {
    return (
      <ModalFooter>
        <Button variant="secondary" onClick={ctrl.close}>
          Cancel
        </Button>
      </ModalFooter>
    );
  }
  if (ctrl.step === "review" && report) {
    return (
      <ModalFooter className="items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {report.summary.error > 0 && (
            <>
              <label className="mr-2 flex cursor-pointer items-center gap-2 text-sm">
                <Switch checked={ctrl.skipErrors} onCheckedChange={ctrl.setSkipErrors} />
                Skip rows with errors
              </label>
              <Button variant="outline" size="sm" onClick={() => ctrl.downloadReport(true)} loading={ctrl.busy === "errors"}>
                <Download size={14} /> Error rows
              </Button>
            </>
          )}
          <Button variant="ghost" size="sm" onClick={() => ctrl.downloadReport(false)} loading={ctrl.busy === "report"}>
            <Download size={14} /> Full report
          </Button>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={ctrl.close}>
            Cancel
          </Button>
          <Button onClick={ctrl.startImport} disabled={!ctrl.canImport} loading={ctrl.busy === "import"}>
            Import {ctrl.importableCount.toLocaleString("en-IN")} row(s)
          </Button>
        </div>
      </ModalFooter>
    );
  }
  if (ctrl.step === "importing") {
    return (
      <ModalFooter>
        <Button variant="secondary" onClick={ctrl.close}>
          Close — keep importing
        </Button>
      </ModalFooter>
    );
  }
  return (
    <ModalFooter>
      <Button variant="outline" onClick={ctrl.reset}>
        <UploadCloud size={14} /> Import another file
      </Button>
      <Button onClick={ctrl.close}>Done</Button>
    </ModalFooter>
  );
}

/** Upload → review → import wizard for any bulk-import entity; drive it with useBulkImport(). */
export function BulkImportDialog({ controller }: { controller: BulkImportController }) {
  if (!controller.isOpen) return null;
  return (
    <Modal onClose={controller.close} title={`Import ${controller.title} from Excel`} size="xl">
      <ImportStepper step={controller.step} />
      <ModalBody>
        {controller.step === "upload" && <UploadStep ctrl={controller} />}
        {controller.step === "review" && controller.report && <ReviewStep ctrl={controller} />}
        {controller.step === "importing" && controller.job && <ImportingStep ctrl={controller} />}
        {controller.step === "done" && <DoneStep ctrl={controller} />}
      </ModalBody>
      <Footer ctrl={controller} />
    </Modal>
  );
}
