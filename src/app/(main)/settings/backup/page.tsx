"use client";

import { useEffect, useState } from "react";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { BackupService } from "@/services/backup.service";
import { saveBlob } from "@/lib/save-blob";
import { useAuthStore } from "@/store/auth.store";
import { Role } from "@/types";
import { Div, P, H3, Button, PageHeader, PageCol, type PageHeaderConfig } from "@/components/ui";

const SHEETS = [
  "School profile",
  "Classes & Sections",
  "Students (admission, roll and registration numbers)",
  "Parents",
  "Staff",
  "Fee payments",
];

export default function SchoolBackupPage() {
  const role = useAuthStore((s) => s.user?.role);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const canDownload = role === Role.SCHOOL_ADMIN;

  useEffect(() => setIsMounted(true), []);

  const download = async () => {
    setIsDownloading(true);
    try {
      const blob = await BackupService.downloadOwn();
      saveBlob(blob, `school_backup_${new Date().toISOString().slice(0, 10)}.xlsx`);
      toast.success("Backup downloaded");
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Failed to download backup");
    } finally {
      setIsDownloading(false);
    }
  };

  const pageHeaderConfig: PageHeaderConfig = {
    title: "School Backup",
    subtitle: "Download a copy of your school's core data as an Excel file.",
    backButton: true,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />
      <Div variant="card" type="col" gap="md" padding="p-6">
        <H3>What is included</H3>
        <ul className="list-disc pl-5 text-sm text-muted-foreground">
          {SHEETS.map((sheet) => (
            <li key={sheet}>{sheet}</li>
          ))}
        </ul>
        {!isMounted ? null : canDownload ? (
          <Button className="w-fit" onClick={() => void download()} loading={isDownloading}>
            <Download /> Download Excel backup
          </Button>
        ) : (
          <P size="sm" color="muted">Only the School Admin can download a backup.</P>
        )}
      </Div>
    </PageCol>
  );
}
