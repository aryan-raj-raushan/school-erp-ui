"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BulkImportService } from "@/services/bulk-import.service";
import { saveBlob } from "@/lib/save-blob";
import type {
  BulkEntity,
  ImportJob,
  RowStatus,
  ValidationReport,
} from "@/types/bulk-import.types";

export type BulkImportStep = "upload" | "review" | "importing" | "done";
export type BulkImportBusy = "template" | "validate" | "report" | "errors" | "import" | null;
export type BulkImportFilter = "all" | RowStatus;

const MAX_FILE_BYTES = 5 * 1024 * 1024;
const POLL_MS = 1000;
const MAX_POLL_FAILURES = 5;

function describeError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    if (/timeout/i.test(error.message)) {
      return "The server took too long to respond. Try a smaller file (split it into parts).";
    }
    return error.message;
  }
  return fallback;
}

function checkFile(file: File): string | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xls")) {
    return "The old .xls format isn't supported. In Excel use File → Save As → Excel Workbook (.xlsx), then upload again.";
  }
  if (!name.endsWith(".xlsx") && !name.endsWith(".csv")) {
    return `'${file.name}' is not a spreadsheet. Upload the .xlsx template (or a .csv file).`;
  }
  if (file.size === 0) return "This file is empty.";
  if (file.size > MAX_FILE_BYTES) {
    return `This file is ${(file.size / 1024 / 1024).toFixed(1)} MB — the limit is 5 MB. Split it into smaller files.`;
  }
  return null;
}

function csvCell(value: string | number): string {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function downloadCsv(rows: (string | number)[][], fileName: string) {
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
  saveBlob(new Blob([`﻿${csv}`], { type: "text/csv;charset=utf-8" }), fileName);
}

export interface UseBulkImportOptions {
  title: string;
  onImported?: () => void;
}

export function useBulkImport(entity: BulkEntity, { title, onImported }: UseBulkImportOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState<BulkImportStep>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null);
  const [job, setJob] = useState<ImportJob | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<BulkImportBusy>(null);
  const [skipErrors, setSkipErrors] = useState(true);
  const [filter, setFilter] = useState<BulkImportFilter>("all");
  const onImportedRef = useRef(onImported);
  useEffect(() => {
    onImportedRef.current = onImported;
  }, [onImported]);

  const reset = useCallback(() => {
    setStep("upload");
    setFile(null);
    setReport(null);
    setJob(null);
    setError(null);
    setBusy(null);
    setFilter("all");
    setSkipErrors(true);
  }, []);

  const open = useCallback(() => {
    reset();
    setIsOpen(true);
  }, [reset]);

  const close = useCallback(() => {
    if (step === "importing") {
      toast.info("The import keeps running on the server. Refresh the list in a minute to see the new records.");
    }
    setIsOpen(false);
  }, [step]);

  const validate = useCallback(
    async (target: File) => {
      setBusy("validate");
      setError(null);
      try {
        const result = await BulkImportService.validate(entity, target);
        setReport(result);
        setFilter(result.summary.error ? "error" : "all");
        setStep("review");
      } catch (err) {
        setReport(null);
        setStep("upload");
        setError(describeError(err, "The file could not be checked."));
      } finally {
        setBusy(null);
      }
    },
    [entity],
  );

  const selectFile = useCallback(
    (picked: File | null | undefined) => {
      if (!picked) return;
      const problem = checkFile(picked);
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

  const downloadTemplate = useCallback(async () => {
    setBusy("template");
    try {
      saveBlob(await BulkImportService.downloadTemplate(entity), `${entity}-import-template.xlsx`);
      toast.success("Sample Excel downloaded — fill the Data sheet and upload it here.");
    } catch (err) {
      toast.error(describeError(err, "Could not download the template."));
    } finally {
      setBusy(null);
    }
  }, [entity]);

  const downloadReport = useCallback(
    async (errorsOnly: boolean) => {
      if (!file) return;
      setBusy(errorsOnly ? "errors" : "report");
      try {
        const blob = await BulkImportService.downloadReport(entity, file, errorsOnly);
        saveBlob(blob, `${entity}-import-${errorsOnly ? "errors" : "report"}.xlsx`);
      } catch (err) {
        toast.error(describeError(err, "Could not download the report."));
      } finally {
        setBusy(null);
      }
    },
    [entity, file],
  );

  const startImport = useCallback(async () => {
    if (!file) return;
    setBusy("import");
    setError(null);
    try {
      setJob(await BulkImportService.startImport(entity, file, skipErrors));
      setStep("importing");
    } catch (err) {
      setError(describeError(err, "The import could not be started."));
    } finally {
      setBusy(null);
    }
  }, [entity, file, skipErrors]);

  const jobId = job?.job_id;
  useEffect(() => {
    if (step !== "importing" || !jobId) return;
    let failures = 0;
    let cancelled = false;
    const timer = setInterval(async () => {
      try {
        const latest = await BulkImportService.getJob(entity, jobId);
        if (cancelled) return;
        failures = 0;
        setJob(latest);
        if (latest.status === "running") return;
        clearInterval(timer);
        setStep("done");
        onImportedRef.current?.();
        if (latest.status === "failed") toast.error(latest.error ?? "The import stopped unexpectedly.");
        else if (latest.failed) toast.warning(`${latest.created} imported, ${latest.failed} failed.`);
        else toast.success(`${latest.created} ${title.toLowerCase()} imported successfully.`);
      } catch (err) {
        failures++;
        if (failures >= MAX_POLL_FAILURES) {
          clearInterval(timer);
          setError(
            `Lost track of the import progress (${describeError(err, "network error")}). It may still be running — refresh the list shortly.`,
          );
          setStep("done");
          onImportedRef.current?.();
        }
      }
    }, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [step, jobId, entity, title]);

  const downloadCredentials = useCallback(() => {
    if (!job?.credentials.length) return;
    downloadCsv(
      [
        ["Row", "Name", "Mobile Number", "Temporary Password"],
        ...job.credentials.map((c) => [c.row, c.name, c.phone_number, c.temporary_password]),
      ],
      `${entity}-login-credentials.csv`,
    );
  }, [entity, job]);

  const downloadFailures = useCallback(() => {
    const failed = job?.results.filter((r) => r.status === "failed") ?? [];
    if (!failed.length) return;
    downloadCsv(
      [["Excel Row", "Reason"], ...failed.map((r) => [r.row, r.message ?? "Unknown error"])],
      `${entity}-import-failures.csv`,
    );
  }, [entity, job]);

  const visibleRows = useMemo(
    () => (report?.rows ?? []).filter((r) => filter === "all" || r.status === filter),
    [report, filter],
  );

  const importableCount = report ? report.summary.ready + report.summary.warning : 0;
  const canImport =
    !!report && importableCount > 0 && (skipErrors || report.summary.error === 0) && !busy;

  return {
    entity,
    title,
    isOpen,
    open,
    close,
    step,
    file,
    report,
    job,
    error,
    busy,
    filter,
    setFilter,
    visibleRows,
    skipErrors,
    setSkipErrors,
    importableCount,
    canImport,
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

export type BulkImportController = ReturnType<typeof useBulkImport>;
