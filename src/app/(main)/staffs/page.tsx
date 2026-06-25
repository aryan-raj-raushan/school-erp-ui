'use client';

import { useStaffsPage } from '@/hooks/useStaffsPage';
import { STAFF_STATUS_BADGE, STAFF_STATUS_OPTIONS } from '@/constants';
import {
  Div, P, Button, Input, Select,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  TablePagination, Modal, ModalBody, ModalFooter, FormField, Badge, Spinner, FileInput,
  PageCol, FilterBar, PageHeader,
} from '@/components/ui';
import { Pencil, Eye, UserX, UserCheck, Mail, Trash2, Plus } from 'lucide-react';

export default function StaffsPage() {
  const {
    staffList, pagination, filters, isLoading,
    removeStaff, offboardStaff, reonboardStaff, resendInvite,
    updateFilters, navigateToNew, navigateToView, navigateToEdit,
    showBulkModal, openBulkModal, closeBulkModal,
    bulkJob, bulkFileRef, isImporting, bulkImport, checkBulkStatus,
    downloadTemplate, isAdmin, systemRoles,
  } = useStaffsPage();

  return (
    <PageCol>
      <PageHeader
        title="Staff"
        subtitle={pagination ? `${pagination.total} staff members` : 'Loading...'}
        illustration="/illustrations/staffs.svg"
        actions={
          <>
            <Button variant="outline" onClick={downloadTemplate}>Download Template</Button>
            <Button variant="outline" onClick={openBulkModal}>Bulk Import</Button>
            {isAdmin && <Button onClick={navigateToNew}><Plus size={16} />Add Staff</Button>}
          </>
        }
      />

      <FilterBar>
        <Input
          width="md"
          placeholder="Search by name or phone"
          value={filters.search ?? ''}
          onChange={(e) => updateFilters({ search: e.target.value })}
        />
        <Select
          width="sm"
          value={filters.status ?? ''}
          onChange={(e) => updateFilters({ status: (e.target.value as any) || undefined })}
        >
          {STAFF_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </Select>
        <Select
          width="sm"
          value={filters.role ?? ''}
          onChange={(e) => updateFilters({ role: (e.target.value as any) || undefined })}
        >
          <option value="">All Roles</option>
          {systemRoles.map((r) => (
            <option key={r.id} value={r.name.toUpperCase().replace(/ /g, '_')}>{r.name}</option>
          ))}
        </Select>
      </FilterBar>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>Name</TableHeaderCell>
            <TableHeaderCell>Role</TableHeaderCell>
            <TableHeaderCell>Email</TableHeaderCell>
            <TableHeaderCell>Phone</TableHeaderCell>
            <TableHeaderCell>Status</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : staffList.length === 0 ? (
            <TableEmptyRow colSpan={6}>No staff members found.</TableEmptyRow>
          ) : (
            staffList.map((s) => (
              <TableRow key={s.id}>
                <TableCell primary>
                  <Div type="row" align="center" gap="sm">
                    {s.profile_image && (
                      <img src={s.profile_image} alt="" className="w-8 h-8 rounded-full object-cover" />
                    )}
                    {s.first_name} {s.last_name ?? ''}
                  </Div>
                </TableCell>
                <TableCell>{s.role ?? '—'}</TableCell>
                <TableCell>{s.email ?? '—'}</TableCell>
                <TableCell>{s.phone_number ?? '—'}</TableCell>
                <TableCell>
                  <Badge variant={s.is_active ? 'success' : 'default'}>
                    {s.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => navigateToView(s.id)} title="View">
                      <Eye size={14} />
                    </Button>
                    {isAdmin && (
                      <>
                        <Button size="sm" variant="ghost" onClick={() => navigateToEdit(s.id)} title="Edit">
                          <Pencil size={14} />
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => resendInvite(s.id)} title="Resend Invite">
                          <Mail size={14} />
                        </Button>
                        {s.is_active ? (
                          <Button size="sm" variant="ghost" onClick={() => offboardStaff(s.id)} title="Offboard">
                            <UserX size={14} />
                          </Button>
                        ) : (
                          <Button size="sm" variant="ghost" onClick={() => reonboardStaff(s.id)} title="Re-onboard">
                            <UserCheck size={14} />
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => removeStaff(s.id)} title="Delete">
                          <Trash2 size={14} className="text-destructive" />
                        </Button>
                      </>
                    )}
                  </Div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination
          total={pagination.total}
          page={pagination.page}
          totalPages={pagination.totalPages}
        />
      )}

      {showBulkModal && (
        <Modal onClose={closeBulkModal} title="Bulk Import Staff">
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Excel File *">
                <FileInput ref={bulkFileRef} type="file" accept=".xlsx,.xls,.csv" />
              </FormField>
              {bulkJob && (
                <Div type="col" gap="xs">
                  <P>Job ID: {bulkJob.jobId}</P>
                  <P>Status: {bulkJob.status}</P>
                  {bulkJob.processed != null && <P>Processed: {bulkJob.processed} / {bulkJob.total}</P>}
                  {bulkJob.failed != null && bulkJob.failed > 0 && <P>Failed: {bulkJob.failed}</P>}
                </Div>
              )}
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="outline" onClick={closeBulkModal}>Cancel</Button>
            {bulkJob && <Button variant="outline" onClick={checkBulkStatus}>Check Status</Button>}
            <Button loading={isImporting} onClick={bulkImport}>Import</Button>
          </ModalFooter>
        </Modal>
      )}
    </PageCol>
  );
}
