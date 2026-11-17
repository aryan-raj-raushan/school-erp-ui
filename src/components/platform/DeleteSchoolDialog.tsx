"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Download } from "lucide-react";
import { Button, Div, Input, P, ResponsiveModalContainer, Spinner } from "@/components/ui";
import { SchoolsService, type SchoolDeletionSummary } from "@/services/schools.service";
import { errorMessage } from "@/lib/api-error";

interface DeletableSchool {
  id: string;
  name: string;
  code?: string | null;
}

interface DeleteSchoolDialogProps {
  school: DeletableSchool | null;
  onClose: () => void;
  onDeleted: () => void;
  onDownloadBackup: () => Promise<void>;
}

const ACKNOWLEDGEMENTS = [
  "I have downloaded a backup of this school and stored it safely.",
  "I understand every student, parent, staff, fee, attendance and exam record, and all uploaded documents, will be permanently deleted and cannot be recovered.",
];

function formatBackupTime(value: string | null): string {
  if (!value) return "Never downloaded";
  return new Date(value).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" });
}

export function DeleteSchoolDialog({ school, onClose, onDeleted, onDownloadBackup }: DeleteSchoolDialogProps) {
  const [summary, setSummary] = useState<SchoolDeletionSummary | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [ticked, setTicked] = useState<boolean[]>(ACKNOWLEDGEMENTS.map(() => false));
  const [typedName, setTypedName] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [summaryVersion, setSummaryVersion] = useState(0);

  const schoolId = school?.id;
  useEffect(() => {
    if (!schoolId) return;
    let active = true;
    SchoolsService.deletionSummary(schoolId)
      .then((data) => {
        if (!active) return;
        setSummary(data);
        setLoadError(null);
      })
      .catch((err) => active && setLoadError(errorMessage(err, "Could not load what will be deleted")));
    return () => {
      active = false;
    };
  }, [schoolId, summaryVersion]);

  if (!school) return null;

  const nameMatches = typedName.trim().replace(/\s+/g, " ").toLowerCase() === school.name.trim().replace(/\s+/g, " ").toLowerCase();
  const canDelete = Boolean(summary) && ticked.every(Boolean) && nameMatches && !isDeleting;

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await onDownloadBackup();
      setSummaryVersion((v) => v + 1);
    } finally {
      setIsDownloading(false);
    }
  }

  async function handleDelete() {
    if (!school || !canDelete) return;
    setIsDeleting(true);
    try {
      const result = await SchoolsService.remove(school.id, { confirm_name: typedName.trim(), backup_confirmed: true });
      if (result.files_failed) {
        toast.warning(`${result.name} deleted, but some uploaded files could not be removed from storage — they are logged on the server.`);
      } else {
        toast.success(`${result.name} permanently deleted (${result.rows_deleted} records, ${result.files_deleted} files).`);
      }
      onDeleted();
    } catch (err) {
      toast.error(errorMessage(err, "Failed to delete school"));
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <ResponsiveModalContainer isOpen onClose={isDeleting ? () => undefined : onClose} title={`Delete ${school.name}`}>
      <Div type="col" gap="md" className="px-4 py-4">
        <Div type="row" gap="sm" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-destructive">
          <AlertTriangle size={18} className="mt-0.5 shrink-0" />
          <P className="text-sm text-destructive">
            This permanently removes the school, every record linked to it and all of its uploaded files. There is no undo.
          </P>
        </Div>

        {loadError ? (
          <P className="text-sm text-destructive">{loadError}</P>
        ) : !summary ? (
          <Div type="row" justify="center" className="py-4">
            <Spinner />
          </Div>
        ) : (
          <>
            <Div type="grid" cols={3} gap="sm">
              {[
                { label: "Students", value: summary.students },
                { label: "Parents", value: summary.parents },
                { label: "Staff", value: summary.staff },
              ].map((item) => (
                <Div key={item.label} type="col" className="rounded-lg border border-border p-3">
                  <P className="text-lg font-semibold">{item.value}</P>
                  <P color="muted" className="text-xs">{item.label}</P>
                </Div>
              ))}
            </Div>

            <Div type="row" align="center" justify="between" gap="sm" className="rounded-lg border border-border p-3">
              <Div type="col">
                <P className="text-sm font-medium">Last backup</P>
                <P className={summary.last_backup_at ? "text-xs text-muted-foreground" : "text-xs font-medium text-destructive"}>
                  {formatBackupTime(summary.last_backup_at)}
                </P>
              </Div>
              <Button type="button" size="sm" variant="outline" loading={isDownloading} onClick={handleDownload}>
                <Download size={14} /> Download backup
              </Button>
            </Div>
            <P color="muted" className="-mt-2 text-xs">
              The backup is an Excel file with classes, students, parents, staff and fee payments. Uploaded documents are not part of it.
            </P>

            <Div type="col" gap="sm">
              {ACKNOWLEDGEMENTS.map((statement, index) => (
                <label key={statement} className="flex cursor-pointer items-start gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="mt-0.5 h-4 w-4 accent-destructive"
                    checked={ticked[index]}
                    onChange={(e) => setTicked((prev) => prev.map((v, i) => (i === index ? e.target.checked : v)))}
                  />
                  <span>{statement}</span>
                </label>
              ))}
            </Div>

            <Div type="col" gap="xs">
              <P color="muted" className="text-xs">
                Type <span className="font-semibold text-foreground">{school.name}</span> to confirm
              </P>
              <Input value={typedName} onChange={(e) => setTypedName(e.target.value)} placeholder={school.name} autoComplete="off" />
            </Div>
          </>
        )}
      </Div>
      <Div type="row" justify="end" gap="sm" className="border-t border-border/30 px-4 py-3">
        <Button type="button" variant="outline" onClick={onClose} disabled={isDeleting}>
          Cancel
        </Button>
        <Button type="button" variant="destructive" onClick={handleDelete} disabled={!canDelete} loading={isDeleting}>
          Delete permanently
        </Button>
      </Div>
    </ResponsiveModalContainer>
  );
}
