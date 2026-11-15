"use client";

import * as React from "react";
import {
  AlertTriangle,
  ArrowRight,
  Banknote,
  CheckCircle2,
  Clock,
  Download,
  FileSpreadsheet,
  GraduationCap,
  KeyRound,
  Landmark,
  Loader2,
  ReceiptIndianRupee,
  RefreshCw,
  Tags,
  UploadCloud,
  Users,
  XCircle,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";
import { Switch } from "./switch";
import {
  ImportAlert,
  ImportDropzone,
  ImportPreviewGrid,
  ImportStepper,
  ImportSummaryTiles,
} from "./bulk-import-dialog";
import type { WorkbookImportController } from "@/hooks/useWorkbookImport";
import type { BulkEntity, ImportJob, WorkbookSheetReport } from "@/types/bulk-import.types";

const SHEET_GUIDE: { entity: BulkEntity; sheet: string; icon: LucideIcon; description: string }[] = [
  { entity: "finance-accounts", sheet: "Finance Accounts", icon: Landmark, description: "Bank, cash and wallet accounts with opening balances" },
  { entity: "finance-heads", sheet: "Finance Heads", icon: Tags, description: "Income and expense categories" },
  { entity: "staff", sheet: "Staff", icon: Users, description: "Teachers and staff with roles and sign-in mobile numbers" },
  { entity: "students", sheet: "Students", icon: GraduationCap, description: "Students with class, section, parents and portal logins" },
  { entity: "finance-income", sheet: "Income", icon: Banknote, description: "Income ledger entries — can use accounts and heads from above" },
  { entity: "finance-expenses", sheet: "Expenses", icon: ReceiptIndianRupee, description: "Expense ledger entries — can use accounts, heads and staff from above" },
];

const ICONS = new Map(SHEET_GUIDE.map((g) => [g.entity, g.icon]));

function sheetIcon(entity: BulkEntity) {
  const Icon = ICONS.get(entity) ?? FileSpreadsheet;
  return <Icon size={18} className="shrink-0 text-primary" />;
}

function count(n: number) {
  return n.toLocaleString("en-IN");
}

function UploadStep({ ctrl }: { ctrl: WorkbookImportController }) {
  return (
    <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
      <div className="space-y-4 rounded-3xl border border-border/60 bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
            <FileSpreadsheet size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">1. Download the school template</p>
            <p className="text-sm text-muted-foreground">
              One Excel file with a sheet for each type of data, built from your live setup — dropdowns,
              rules for every column and sample rows. Fill only the sheets you need.
            </p>
          </div>
        </div>
        <ol className="space-y-2">
          {SHEET_GUIDE.map((g, i) => (
            <li key={g.entity} className="flex items-center gap-3 rounded-2xl bg-muted/40 px-3 py-2">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-background text-xs font-semibold text-muted-foreground">
                {i + 1}
              </span>
              <g.icon size={16} className="shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground">{g.sheet}</p>
                <p className="truncate text-xs text-muted-foreground">{g.description}</p>
              </div>
            </li>
          ))}
        </ol>
        <p className="text-xs text-muted-foreground">
          Sheets are imported top to bottom, so later sheets can refer to records added by earlier ones. You
          only get the sheets your role is allowed to import.
        </p>
        <Button onClick={ctrl.downloadTemplate} loading={ctrl.busy === "template"} fullWidth>
          <Download size={14} /> Download school template
        </Button>
      </div>

      <div className="space-y-4">
        <div className="rounded-3xl border border-border/60 bg-card p-5">
          <p className="mb-3 font-semibold text-foreground">2. Upload the filled workbook</p>
          <ImportDropzone
            checking={ctrl.busy === "validate"}
            fileName={ctrl.file?.name}
            onSelect={ctrl.selectFile}
            accept=".xlsx,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            hint=".xlsx · up to 5 MB · up to 2,000 rows per sheet"
          />
        </div>
        {ctrl.error && (
          <ImportAlert tone="error" title="This file can't be imported yet">
            {ctrl.error}
          </ImportAlert>
        )}
        <ul className="space-y-2 text-sm text-muted-foreground">
          {[
            "Every sheet is checked before anything is saved.",
            "Duplicates are caught inside each sheet and against existing records.",
            "Download one highlighted report covering every sheet, fix it and re-upload.",
          ].map((tip) => (
            <li key={tip} className="flex gap-2 rounded-2xl bg-muted/30 p-3">
              <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald-500" />
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function SheetStatusIcon({ sheet }: { sheet: WorkbookSheetReport }) {
  if (sheet.sheet_error) return <XCircle size={16} className="text-red-500" />;
  if (!sheet.summary.total) return <Clock size={16} className="text-muted-foreground" />;
  if (sheet.summary.error) return <AlertTriangle size={16} className="text-red-500" />;
  if (sheet.summary.warning) return <AlertTriangle size={16} className="text-amber-500" />;
  return <CheckCircle2 size={16} className="text-emerald-500" />;
}

function SheetTabs({ ctrl }: { ctrl: WorkbookImportController }) {
  return (
    <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:overflow-visible" aria-label="Sheets">
      {ctrl.report!.sheets.map((sheet) => {
        const active = ctrl.activeSheet?.entity === sheet.entity;
        return (
          <button
            key={sheet.entity}
            type="button"
            onClick={() => ctrl.selectSheet(sheet.entity)}
            aria-current={active}
            className={cn(
              "flex min-w-[200px] items-center gap-3 rounded-2xl border px-3 py-2.5 text-left transition-all lg:min-w-0",
              active ? "border-primary bg-primary/5 ring-2 ring-primary/20" : "border-border/60 hover:bg-muted/40",
            )}
          >
            {sheetIcon(sheet.entity)}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-foreground">{sheet.sheet_name}</p>
              <p className="text-xs text-muted-foreground">
                {sheet.sheet_error
                  ? "Skipped"
                  : sheet.summary.total
                    ? `${count(sheet.summary.ready + sheet.summary.warning)} ready · ${count(sheet.summary.error)} errors`
                    : "Empty — skipped"}
              </p>
            </div>
            <SheetStatusIcon sheet={sheet} />
          </button>
        );
      })}
    </nav>
  );
}

function ActiveSheet({ ctrl }: { ctrl: WorkbookImportController }) {
  const sheet = ctrl.activeSheet;
  if (!sheet) return null;
  if (sheet.sheet_error) {
    return (
      <ImportAlert tone="error" title={`Sheet '${sheet.sheet_name}' will not be imported`}>
        {sheet.sheet_error}
      </ImportAlert>
    );
  }
  if (!sheet.summary.total) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-2xl border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
        <Clock size={22} />
        Sheet &apos;{sheet.sheet_name}&apos; has no rows — it will be skipped.
      </div>
    );
  }
  return (
    <div className="space-y-4">
      {sheet.header_issues.length > 0 && (
        <ImportAlert tone="warning" title="Some columns need attention">
          <ul className="list-disc pl-4">
            {sheet.header_issues.map((issue) => (
              <li key={issue}>{issue}</li>
            ))}
          </ul>
        </ImportAlert>
      )}
      <ImportSummaryTiles summary={sheet.summary} filter={ctrl.filter} onFilter={ctrl.setFilter} />
      <ImportPreviewGrid columns={sheet.columns} rows={ctrl.visibleRows} />
    </div>
  );
}

function ReviewStep({ ctrl }: { ctrl: WorkbookImportController }) {
  const report = ctrl.report!;
  const { summary } = report;
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-3">
        <FileSpreadsheet size={20} className="text-emerald-600" />
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-foreground">{report.file_name}</p>
          <p className="text-xs text-muted-foreground">
            {report.sheets.length} sheet(s) recognised · {count(summary.total)} rows checked
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={ctrl.recheck} loading={ctrl.busy === "validate"}>
          <RefreshCw size={14} /> Re-check
        </Button>
        <Button variant="outline" size="sm" onClick={ctrl.reset} disabled={!!ctrl.busy}>
          <UploadCloud size={14} /> Upload another file
        </Button>
      </div>

      {report.ignored_sheets.length > 0 && (
        <ImportAlert tone="warning" title="Some sheets were not recognised and will be ignored">
          {report.ignored_sheets.join(", ")} — rename them to match the template if they hold data to import.
        </ImportAlert>
      )}

      {ctrl.importableCount === 0 ? (
        <ImportAlert tone="error" title="Nothing can be imported yet">
          Every row has at least one error. Download the error rows, fix the highlighted cells and upload the
          corrected file.
        </ImportAlert>
      ) : summary.error > 0 ? (
        <ImportAlert tone="warning" title={`${count(summary.error)} row(s) across the sheets have errors`}>
          Fix them and re-upload, or skip them and import the other {count(ctrl.importableCount)} row(s) now.
        </ImportAlert>
      ) : (
        <ImportAlert tone="info" title="Every sheet passed the rules">
          {summary.warning
            ? `${count(summary.warning)} row(s) have warnings — review them, they will still be imported.`
            : "No duplicates or problems were found."}
        </ImportAlert>
      )}

      {ctrl.error && (
        <ImportAlert tone="error" title="The import could not start">
          {ctrl.error}
        </ImportAlert>
      )}

      <div className="grid gap-4 lg:grid-cols-[240px_minmax(0,1fr)]">
        <SheetTabs ctrl={ctrl} />
        <ActiveSheet ctrl={ctrl} />
      </div>

      <div className="sticky bottom-0 z-10 flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-border/60 bg-background/95 p-3 shadow-lg backdrop-blur">
        <div className="flex flex-wrap items-center gap-2">
          {summary.error > 0 && (
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
        <Button onClick={ctrl.startImport} disabled={!ctrl.canImport} loading={ctrl.busy === "import"}>
          Import {count(ctrl.importableCount)} row(s) <ArrowRight size={14} />
        </Button>
      </div>
    </div>
  );
}

function SectionProgress({ section, label }: { section: ImportJob; label: string }) {
  const percent = section.total ? Math.round((section.processed / section.total) * 100) : 100;
  return (
    <li className="space-y-2 rounded-2xl border border-border/60 bg-card p-4">
      <div className="flex items-center gap-3">
        {sheetIcon(section.entity)}
        <p className="flex-1 font-medium text-foreground">{label}</p>
        {section.status === "pending" && <span className="text-xs text-muted-foreground">Waiting…</span>}
        {section.status === "running" && <Loader2 size={16} className="animate-spin text-primary" />}
        {section.status === "completed" && <CheckCircle2 size={16} className="text-emerald-500" />}
        {section.status === "failed" && <XCircle size={16} className="text-red-500" />}
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            section.status === "failed" ? "bg-red-500" : section.status === "completed" ? "bg-emerald-500" : "bg-primary",
          )}
          style={{ width: `${section.status === "pending" ? 0 : percent}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground" aria-live="polite">
        {count(section.processed)} / {count(section.total)} · {count(section.created)} created · {count(section.failed)} failed
        {section.skipped > 0 && ` · ${count(section.skipped)} skipped`}
      </p>
      {section.error && <p className="text-xs text-red-600">{section.error}</p>}
    </li>
  );
}

function ImportingStep({ ctrl }: { ctrl: WorkbookImportController }) {
  const job = ctrl.job!;
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-foreground">Importing your workbook…</p>
        <p className="text-sm text-muted-foreground">
          Sheets are saved one after another. You can leave this page — the import keeps running on the server.
        </p>
      </div>
      <ol className="space-y-3">
        {job.sections.map((section) => (
          <SectionProgress key={section.entity} section={section} label={ctrl.sheetLabel(section.entity)} />
        ))}
      </ol>
    </div>
  );
}

function DoneStep({ ctrl }: { ctrl: WorkbookImportController }) {
  const job = ctrl.job;
  const failedRows = job?.sections.flatMap((s) =>
    s.results.filter((r) => r.status === "failed").map((r) => ({ ...r, sheet: ctrl.sheetLabel(s.entity) })),
  ) ?? [];
  const allGood = job?.status === "completed" && !failedRows.length;

  return (
    <div className="mx-auto max-w-3xl space-y-4">
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
        <p className="text-sm text-muted-foreground">
          {count(ctrl.totals.created)} created · {count(ctrl.totals.failed)} failed · {count(ctrl.totals.skipped)} skipped
        </p>
      </div>

      {ctrl.error && <ImportAlert tone="error" title="Something went wrong">{ctrl.error}</ImportAlert>}
      {job?.error && <ImportAlert tone="error" title="Import stopped">{job.error}</ImportAlert>}

      {job && (
        <ol className="space-y-3">
          {job.sections.map((section) => (
            <SectionProgress key={section.entity} section={section} label={ctrl.sheetLabel(section.entity)} />
          ))}
        </ol>
      )}

      {ctrl.totals.credentials > 0 && (
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50/60 p-4 dark:border-amber-900 dark:bg-amber-950/20">
          <KeyRound size={18} className="text-amber-600" />
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-foreground">{count(ctrl.totals.credentials)} login(s) created</p>
            <p className="text-xs text-muted-foreground">
              Temporary passwords are shown only now. Download and share them securely — users must change them
              at first sign-in.
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={ctrl.downloadCredentials}>
            <Download size={14} /> Download credentials
          </Button>
        </div>
      )}

      {failedRows.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-foreground">Rows that failed while saving</p>
            <Button variant="ghost" size="sm" onClick={ctrl.downloadFailures}>
              <Download size={14} /> Download list
            </Button>
          </div>
          <div className="max-h-72 overflow-auto rounded-2xl border border-border/60">
            <table className="w-full text-sm">
              <tbody>
                {failedRows.map((r) => (
                  <tr key={`${r.sheet}-${r.row}`} className="border-t border-border/40 first:border-t-0">
                    <td className="whitespace-nowrap px-3 py-2 text-xs font-medium text-foreground">{r.sheet}</td>
                    <td className="whitespace-nowrap px-3 py-2 font-mono text-xs text-muted-foreground">Row {r.row}</td>
                    <td className="px-3 py-2 text-red-600 dark:text-red-400">{r.message}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-center gap-2">
        <Button onClick={ctrl.reset}>
          <UploadCloud size={14} /> Import another workbook
        </Button>
      </div>
    </div>
  );
}

/** Settings page body for importing a multi-sheet school workbook; drive it with useWorkbookImport(). */
export function WorkbookImport({ controller }: { controller: WorkbookImportController }) {
  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border/60 bg-card pb-4">
        <ImportStepper step={controller.step} />
      </div>
      {controller.step === "upload" && <UploadStep ctrl={controller} />}
      {controller.step === "review" && controller.report && <ReviewStep ctrl={controller} />}
      {controller.step === "importing" && controller.job && <ImportingStep ctrl={controller} />}
      {controller.step === "done" && <DoneStep ctrl={controller} />}
    </div>
  );
}
