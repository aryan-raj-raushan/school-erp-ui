"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { BulkImportService } from "@/services/bulk-import.service";
import { saveBlob } from "@/lib/save-blob";
import { checkImportFile, describeImportError, downloadCsv, pollImportJob } from "@/lib/bulk-import.utils";
import type {
  BulkEntity,
  ImportJob,
  RowStatus,
  ValidationReport,
} from "@/types/bulk-import.types";

export type BulkImportStep = "upload" | "review" | "importing" | "done";
export type BulkImportBusy = "template" | "validate" | "report" | "errors" | "import" | null;
export type BulkImportFilter = "all" | RowStatus;

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
        setError(describeImportError(err, "The file could not be checked."));
      } finally {
        setBusy(null);
      }
    },
    [entity],
  );

  const selectFile = useCallback(
    (picked: File | null | undefined) => {
      if (!picked) return;
      const problem = checkImportFile(picked, true);
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
      toast.error(describeImportError(err, "Could not download the template."));
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
        toast.error(describeImportError(err, "Could not download the report."));
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
      setError(describeImportError(err, "The import could not be started."));
    } finally {
      setBusy(null);
    }
  }, [entity, file, skipErrors]);

  const jobId = job?.job_id;
  useEffect(() => {
    if (step !== "importing" || !jobId) return;
    return pollImportJob({
      fetchJob: () => BulkImportService.getJob(entity, jobId),
      onUpdate: setJob,
      onFinished: (latest) => {
        setStep("done");
        onImportedRef.current?.();
        if (latest.status === "failed") toast.error(latest.error ?? "The import stopped unexpectedly.");
        else if (latest.failed) toast.warning(`${latest.created} imported, ${latest.failed} failed.`);
        else toast.success(`${latest.created} ${title.toLowerCase()} imported successfully.`);
      },
      onLost: (err) => {
        setError(
          `Lost track of the import progress for 2 minutes (${describeImportError(err, "network error")}). It may still be running — refresh the list shortly.`,
        );
        setStep("done");
        onImportedRef.current?.();
      },
    });
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
