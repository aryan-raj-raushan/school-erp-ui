import { saveBlob } from "@/lib/save-blob";

const MAX_FILE_BYTES = 5 * 1024 * 1024;

export function describeImportError(error: unknown, fallback: string): string {
  if (error instanceof Error && error.message) {
    if (/timeout/i.test(error.message)) {
      return "The server took too long to respond. Try a smaller file (split it into parts).";
    }
    return error.message;
  }
  return fallback;
}

export function checkImportFile(file: File, allowCsv: boolean): string | null {
  const name = file.name.toLowerCase();
  if (name.endsWith(".xls")) {
    return "The old .xls format isn't supported. In Excel use File → Save As → Excel Workbook (.xlsx), then upload again.";
  }
  if (name.endsWith(".csv") && !allowCsv) {
    return "A CSV file holds only one sheet. Upload the multi-sheet .xlsx template instead.";
  }
  if (!name.endsWith(".xlsx") && !name.endsWith(".csv")) {
    return `'${file.name}' is not a spreadsheet. Upload the .xlsx template${allowCsv ? " (or a .csv file)" : ""}.`;
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

export function downloadCsv(rows: (string | number)[][], fileName: string) {
  const csv = rows.map((r) => r.map(csvCell).join(",")).join("\n");
  saveBlob(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }), fileName);
}

const POLL_INTERVAL_MS = 2000;
const POLL_MAX_BACKOFF_MS = 15000;
const POLL_GIVE_UP_AFTER_MS = 2 * 60 * 1000;

export function pollImportJob<T extends { status: string }>(options: {
  fetchJob: () => Promise<T>;
  onUpdate: (job: T) => void;
  onFinished: (job: T) => void;
  onLost: (lastError: unknown) => void;
}): () => void {
  let cancelled = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let failures = 0;
  let lastSuccessAt = Date.now();

  const schedule = (delay: number) => {
    timer = setTimeout(tick, delay);
  };

  async function tick() {
    try {
      const job = await options.fetchJob();
      if (cancelled) return;
      failures = 0;
      lastSuccessAt = Date.now();
      options.onUpdate(job);
      if (job.status === "running") schedule(POLL_INTERVAL_MS);
      else options.onFinished(job);
    } catch (err) {
      if (cancelled) return;
      failures++;
      if (Date.now() - lastSuccessAt >= POLL_GIVE_UP_AFTER_MS) {
        options.onLost(err);
        return;
      }
      schedule(Math.min(POLL_INTERVAL_MS * 2 ** failures, POLL_MAX_BACKOFF_MS));
    }
  }

  schedule(POLL_INTERVAL_MS);
  return () => {
    cancelled = true;
    clearTimeout(timer);
  };
}
