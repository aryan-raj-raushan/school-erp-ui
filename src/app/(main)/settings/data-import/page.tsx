"use client";

import { PageCol, PageHeader, type PageHeaderConfig, WorkbookImport, Div, P } from "@/components/ui";
import { useWorkbookImport } from "@/hooks/useWorkbookImport";
import { usePermissions } from "@/hooks/usePermissions";
import { PERMISSIONS } from "@/constants/permissions.registry";

const pageHeaderConfig: PageHeaderConfig = {
  title: "Data Import",
  subtitle: "Add students, staff and finance records from one Excel workbook.",
  backButton: true,
};

export default function DataImportPage() {
  const workbookImport = useWorkbookImport();
  const { hasAnyPermission } = usePermissions();

  const canImport = hasAnyPermission(
    PERMISSIONS.students.create,
    PERMISSIONS.staff.create,
    PERMISSIONS.finance.create,
  );

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />
      {canImport ? (
        <WorkbookImport controller={workbookImport} />
      ) : (
        <Div variant="card" padding="p-6">
          <P>You need permission to add students, staff or finance records to import data.</P>
        </Div>
      )}
    </PageCol>
  );
}
