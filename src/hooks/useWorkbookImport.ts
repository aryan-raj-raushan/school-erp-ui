"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { WorkbookImportService } from "@/services/bulk-import.service";
import { saveBlob } from "@/lib/save-blob";
import { checkImportFile, describeImportError, downloadCsv } from "@/lib/bulk-import.utils";
import type {
  BulkEntity,
  WorkbookJob,
  WorkbookReport,
  WorkbookSheetReport,
} from "@/types/bulk-import.types";
import type { BulkImportBusy, BulkImportFilter, BulkImportStep } from "@/hooks/useBulkImport";

const POLL_MS = 1000;
const MAX_POLL_FAILURES = 5;

function sheetFilter(sheet: WorkbookSheetReport): BulkImportFilter {
  return sheet.summary.error ? "error" : "all";
}

export function useWorkbookImport() {
  const [step, setStep] = useState<BulkImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<WorkbookReport | null>(null);
  const [job, setJob] = useState<WorkbookJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<BulkImportBusy>(null);
  const [skipErrors, setSkipErrors] = useState(true);
  const [activeEntity, setActiveEntity] = useState<BulkEntity | null>(null);
  const [filter, setFilter] = useState<BulkImportFilter>("all");

  const reset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setReport(null);
    setJob(null);
    setError(null);
    setBusy(null);
    setSkipErrors(true);
    setActiveEntity(null);
    setFilter("all");
  }, []);

  const validate = useCallback(async (target: File) => {
    setBusy("validate");
    setError(null);
    try {
      const result = await WorkbookImportService.validate(target);
      const first =
        result.sheets.find((s) => s.summary.error || s.sheet_error) ??
        result.sheets.find((s) => s.summary.total) ??
        result.sheets[0];
      setReport(result);
      setActiveEntity(first?.entity ?? null);
      setFilter(first ? sheetFilter(first) : "all");
      setStep("review");
    } catch (err) {
      setReport(null);
      setStep("upload");
      setError(describeImportError(err, "The workbook could not be checked."));
    } finally {
      setBusy(null);
    }
  }, []);

  const selectFile = useCallback(
    (picked: File | null | undefined) => {
      if (!picked) return;
      const problem = checkImportFile(picked, false);
      if (problem) {
        setError(problem);
        return;
      }
      setFile(picked);
      void validate(picked);
    },
    [validate],
  );

  const recheck = useCallback(() => {
    if (file) void validate(file);
  }, [file, validate]);

  const selectSheet = useCallback(
    (entity: BulkEntity) => {
      setActiveEntity(entity);
      const sheet = report?.sheets.find((s) => s.entity === entity);
      if (sheet) setFilter(sheetFilter(sheet));
    },
    [report],
  );

  const downloadTemplate = useCallback(async () => {
    setBusy("template");
    try {
      saveBlob(await WorkbookImportService.downloadTemplate(), "school-data-import-template.xlsx");
      toast.success("Template downloaded — fill the sheets you need and upload the file here.");
    } catch (err) {
      toast.error(describeImportError(err, "Could not download the template."));
    } finally {
      setBusy(null);
    }
  }, []);

  const downloadReport = useCallback(
    async (errorsOnly: boolean) => {
      if (!file) return;
      setBusy(errorsOnly ? "errors" : "report");
      try {
        const blob = await WorkbookImportService.downloadReport(file, errorsOnly);
        saveBlob(blob, `school-data-import-${errorsOnly ? "errors" : "report"}.xlsx`);
      } catch (err) {
        toast.error(describeImportError(err, "Could not download the report."));
      } finally {
        setBusy(null);
      }
    },
    [file],
  );

  const startImport = useCallback(async () => {
    if (!file) return;
    setBusy("import");
    setError(null);
    try {
      setJob(await WorkbookImportService.startImport(file, skipErrors));
      setStep("importing");
    } catch (err) {
      setError(describeImportError(err, "The import could not be started."));
    } finally {
      setBusy(null);
    }
  }, [file, skipErrors]);

  const jobId = job?.job_id;
  useEffect(() => {
    if (step !== "importing" || !jobId) return;
    let failures = 0;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const latest = await WorkbookImportService.getJob(jobId);
        if (cancelled) return;
        failures = 0;
        setJob(latest);
        if (latest.status === "running") return;
        clearInterval(timer);
        setStep("done");
        const created = latest.sections.reduce((sum, s) => sum + s.created, 0);
        const failed = latest.sections.reduce((sum, s) => sum + s.failed, 0);
        if (latest.status === "failed") toast.error(latest.error ?? "The import stopped unexpectedly.");
        else if (failed) toast.warning(`${created} records imported, ${failed} failed.`);
        else toast.success(`${created} records imported successfully.`);
      } catch (err) {
        failures++;
        if (failures >= MAX_POLL_FAILURES) {
          clearInterval(timer);
          setError(
            `Lost track of the import progress (${describeImportError(err, "network error")}). It may still be running — check the lists shortly.`,
          );
          setStep("done");
        }
      }
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [step, jobId]);

  const sheetLabel = useCallback(
    (entity: BulkEntity) => report?.sheets.find((s) => s.entity === entity)?.sheet_name ?? entity,
    [report],
  );

  const downloadCredentials = useCallback(() => {
    const rows =
      job?.sections.flatMap((s) =>
        s.credentials.map((c) => [sheetLabel(s.entity), c.row, c.name, c.phone_number, c.temporary_password]),
      ) ?? [];
    if (!rows.length) return;
    downloadCsv(
      [["Sheet", "Row", "Name", "Mobile Number", "Temporary Password"], ...rows],
      "school-data-import-login-credentials.csv",
    );
  }, [job, sheetLabel]);

  const downloadFailures = useCallback(() => {
    const rows =
      job?.sections.flatMap((s) =>
        s.results
          .filter((r) => r.status === "failed")
          .map((r) => [sheetLabel(s.entity), r.row, r.message ?? "Unknown error"]),
      ) ?? [];
    if (!rows.length) return;
    downloadCsv([["Sheet", "Excel Row", "Reason"], ...rows], "school-data-import-failures.csv");
  }, [job, sheetLabel]);

  const activeSheet = useMemo(
    () => report?.sheets.find((s) => s.entity === activeEntity) ?? null,
    [report, activeEntity],
  );

  const visibleRows = useMemo(
    () => (activeSheet?.rows ?? []).filter((r) => filter === "all" || r.status === filter),
    [activeSheet, filter],
  );

  const importableCount = report ? report.summary.ready + report.summary.warning : 0;
  const canImport =
    !!report && importableCount > 0 && (skipErrors || report.summary.error === 0) && !busy;

  const totals = useMemo(
    () => ({
      created: job?.sections.reduce((sum, s) => sum + s.created, 0) ?? 0,
      failed: job?.sections.reduce((sum, s) => sum + s.failed, 0) ?? 0,
      skipped: job?.sections.reduce((sum, s) => sum + s.skipped, 0) ?? 0,
      credentials: job?.sections.reduce((sum, s) => sum + s.credentials.length, 0) ?? 0,
    }),
    [job],
  );

  return {
    step,
    file,
    report,
    job,
    error,
    busy,
    skipErrors,
    setSkipErrors,
    activeSheet,
    selectSheet,
    sheetLabel,
    filter,
    setFilter,
    visibleRows,
    importableCount,
    canImport,
    totals,
    selectFile,
    recheck,
    reset,
    downloadTemplate,
    downloadReport,
    startImport,
    downloadCredentials,
    downloadFailures,
  };
}

export type WorkbookImportController = ReturnType<typeof useWorkbookImport>;
