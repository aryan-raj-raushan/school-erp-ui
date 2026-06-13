'use client';

import { useDepartmentsPage } from '@/hooks/useDepartmentsPage';
import { DEPARTMENTS_PAGE } from '@/constants';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil, Trash2 } from 'lucide-react';

export default function DepartmentsPage() {
  const { departments, isLoading, removeDepartment, navigateToNew, navigateToEdit } = useDepartmentsPage();

  return (
    <Div type="col" gap="lg">
      <PageHeader
        title={DEPARTMENTS_PAGE.title}
        actions={<Button onClick={navigateToNew}>{DEPARTMENTS_PAGE.addButton}</Button>}
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{DEPARTMENTS_PAGE.table.name}</TableHeaderCell>
            <TableHeaderCell>{DEPARTMENTS_PAGE.table.address}</TableHeaderCell>
            <TableHeaderCell>{DEPARTMENTS_PAGE.table.description}</TableHeaderCell>
            <TableHeaderCell>{DEPARTMENTS_PAGE.table.enabled}</TableHeaderCell>
            <TableHeaderCell>{DEPARTMENTS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : departments.length === 0 ? (
            <TableEmptyRow colSpan={5}>{DEPARTMENTS_PAGE.empty}</TableEmptyRow>
          ) : (
            departments.map((dept) => (
              <TableRow key={dept.id}>
                <TableCell primary>{dept.name}</TableCell>
                <TableCell>{dept.address ?? '—'}</TableCell>
                <TableCell>{dept.description ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={dept.is_active ? 'success' : 'default'}>
                    {dept.is_active ? 'Enabled' : 'Disabled'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => navigateToEdit(dept.id)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => removeDepartment(dept.id)}>
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </Div>
  );
}
