'use client';

import { useAcademicYearAdmin } from '@/hooks/useAcademicYearAdmin';
import {
  PageCol,
  PageHeader,
  Div,
  Button,
  Select,
  Badge,
  DataTable,
  Modal,
  ModalBody,
  ModalFooter,
  Spinner,
  P,
  type ColumnDef,
} from '@/components/ui';
import type { AcademicYear } from '@/types';

type FrozenYear = AcademicYear & { is_frozen?: boolean };

export default function AcademicYearPage() {
  const {
    years, isLoading, actionId,
    freeze, unfreeze, rollover,
    rolloverFromId, setRolloverFromId,
    rolloverToId, setRolloverToId,
    isRolloverOpen, setIsRolloverOpen,
  } = useAcademicYearAdmin();

  const columns: ColumnDef<AcademicYear>[] = [
    { header: 'Name', accessorKey: 'name' },
    { header: 'Start', accessorKey: 'start_date' },
    { header: 'End', accessorKey: 'end_date' },
    {
      header: 'Status',
      id: 'status',
      cell: ({ row }) => (
        <Div type="row" gap="sm">
          {row.original.is_current && <Badge variant="success">Current</Badge>}
          {(row.original as FrozenYear).is_frozen && <Badge variant="danger">Frozen</Badge>}
        </Div>
      ),
    },
    {
      header: 'Actions',
      id: 'actions',
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

  return (
    <PageCol>
      <PageHeader
        title="Academic Years"
        subtitle="Manage academic years, freeze attendance, and rollover"
        actions={<Button onClick={() => setIsRolloverOpen(true)}>Rollover Year</Button>}
      />

      {isLoading ? (
        <Spinner />
      ) : (
        <DataTable columns={columns} data={years} />
      )}

      {isRolloverOpen && (
        <Modal title="Academic Year Rollover" onClose={() => setIsRolloverOpen(false)}>
          <ModalBody>
            <Div type="col" gap="md">
              <P>Copies leave policies and carries forward balances to the target year.</P>
              <P>From year:</P>
              <Select value={rolloverFromId} onChange={e => setRolloverFromId(e.target.value)}>
                <option value="">Select source year</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </Select>
              <P>To year:</P>
              <Select value={rolloverToId} onChange={e => setRolloverToId(e.target.value)}>
                <option value="">Select target year</option>
                {years.map(y => <option key={y.id} value={y.id}>{y.name}</option>)}
              </Select>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={() => setIsRolloverOpen(false)}>Cancel</Button>
            <Button onClick={rollover}>Run Rollover</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
