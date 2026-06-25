'use client';

import { useRolesPage } from '@/hooks/useRolesPage';
import {
  Div, Button,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Pencil, Trash2, Lock, Plus } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { Role } from '@/types';

export default function RolesPage() {
  const { roles, isLoading, removeRole, navigateToNew, navigateToEdit } = useRolesPage();
  const user = useAuthStore((s) => s.user);
  const isSchoolAdmin = user?.role === Role.SCHOOL_ADMIN;

  return (
    <PageCol>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Create custom roles (Driver, HOD, etc.) and assign granular permissions to each"
        actions={
          isSchoolAdmin && (
            <Button onClick={navigateToNew}>
              <Plus size={16} />
              Add New
            </Button>
          )
        }
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Role Name</TableHeaderCell>
            <TableHeaderCell>Slug</TableHeaderCell>
            <TableHeaderCell>Type</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
          ) : roles.length === 0 ? (
            <TableEmptyRow colSpan={5}>No roles found.</TableEmptyRow>
          ) : (
            roles.map((r) => (
              <TableRow key={r.id}>
                <TableCell primary>
                  <Div type="row" align="center" gap="xs">
                    {r.is_system && <Icon icon={Lock} type="sm" />}
                    {r.name}
                  </Div>
                </TableCell>
                <TableCell><code className="text-xs">{r.slug}</code></TableCell>
                <TableCell>
                  <Badge variant={r.is_system ? 'info' : 'default'}>
                    {r.is_system ? 'System' : 'Custom'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={r.is_active ? 'success' : 'default'}>
                    {r.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => navigateToEdit(r.id)} title="Edit">
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    {!r.is_system && isSchoolAdmin && (
                      <Button size="sm" variant="ghost" onClick={() => removeRole(r.id)} title="Delete">
                        <Icon icon={Trash2} type="sm-danger" />
                      </Button>
                    )}
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </PageCol>
  );
}
