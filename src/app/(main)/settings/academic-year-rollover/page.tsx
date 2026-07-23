"use client";

import { useAcademicYearAdmin } from "@/hooks/useAcademicYearAdmin";
import {
  PageCol,
  PageHeader,
  Div,
  Button,
  Badge,
  DataTable,
  Spinner,
  P,
  type ColumnDef,
  ResponsiveModalContainer,
  ResponsiveSelect,
  PageHeaderConfig,
} from "@/components/ui";
import type { AcademicYear } from "@/types";
import { useIsMobile } from "@/hooks/use-mobile";

type FrozenYear = AcademicYear & { is_frozen?: boolean };

export default function AcademicYearPage() {
  const isMobile = useIsMobile();
  const {
    years,
    isLoading,
    actionId,
    freeze,
    unfreeze,
    rollover,
    rolloverFromId,
    setRolloverFromId,
    rolloverToId,
    setRolloverToId,
    isRolloverOpen,
    setIsRolloverOpen,
  } = useAcademicYearAdmin();

  const columns: ColumnDef<AcademicYear>[] = [
    { header: "Name", accessorKey: "name" },
    { header: "Start", accessorKey: "start_date" },
    { header: "End", accessorKey: "end_date" },
    {
      header: "Status",
      id: "status",
      cell: ({ row }) => (
        <Div type="row" gap="sm">
          {row.original.is_current && <Badge variant="success">Current</Badge>}
          {(row.original as FrozenYear).is_frozen && (
            <Badge variant="danger">Frozen</Badge>
          )}
        </Div>
      ),
    },
    {
      header: "Actions",
      id: "actions",
      cell: ({ row }) => {
        const isFrozen = (row.original as FrozenYear).is_frozen;
        return (
          <Div type="row" gap="sm">
            {isFrozen ? (
              <Button
                size="sm"
                variant="outline"
                loading={actionId === row.original.id}
                onClick={() => unfreeze(row.original.id)}
              >
                Unfreeze
              </Button>
            ) : (
              <Button
                size="sm"
                variant="destructive"
                loading={actionId === row.original.id}
                onClick={() => freeze(row.original.id)}
              >
                Freeze
              </Button>
            )}
          </Div>
        );
      },
    },
  ];

  const pageHeaderConfig: PageHeaderConfig = {
    title: "Academic Years",
    subtitle: "Manage academic years, freeze attendance, and rollover",
    actions: [
      {
        label: "Rollover Year",

        onClick: () => setIsRolloverOpen(true),
      },
    ],
    backButton: isMobile,
  };

  return (
    <PageCol>
      <PageHeader {...pageHeaderConfig} />

      {isLoading ? <Spinner /> : <DataTable columns={columns} data={years} />}

      <ResponsiveModalContainer
        isOpen={isRolloverOpen}
        title="Academic Year Rollover"
        onClose={() => setIsRolloverOpen(false)}
      >
        <Div className="px-4 py-4">
          <Div type="col" gap="md">
            <P>
              Copies leave policies and carries forward balances to the target
              year.
            </P>
            <P>From year:</P>
            <ResponsiveSelect
              value={rolloverFromId}
              onChange={(e) => setRolloverFromId(e.target.value)}
              customPlaceholder="Select source year"
              options={years.map((y) => ({ value: y.id, label: y.name }))}
            />
            <P>To year:</P>
            <ResponsiveSelect
              value={rolloverToId}
              onChange={(e) => setRolloverToId(e.target.value)}
              customPlaceholder="Select target year"
              options={years.map((y) => ({ value: y.id, label: y.name }))}
            />
          </Div>
        </Div>
        <Div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="outline" onClick={() => setIsRolloverOpen(false)}>
            Cancel
          </Button>
          <Button onClick={rollover}>Run Rollover</Button>
        </Div>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
