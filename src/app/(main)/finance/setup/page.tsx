'use client';

import { useMemo } from 'react';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import {
  Div, Button, Span, P, FormField, Input,
  PageHeader, PageCol,
  Badge, Spinner,
  ResponsiveSelect, ResponsiveModalContainer,
  DataTable, type ColumnDef, RowActions,
} from '@/components/ui';
import { Tabs } from '@/components/ui/tabs';
import { useFinanceSetup, FINANCE_SETUP_TABS } from '@/hooks/useFinanceSetup';

export default function FinanceSetupPage() {
  const {
    tab, setTab,
    showAccountModal, showHeadModal,
    accounts, loadingAccounts,
    accountForm, setAccountForm, editingAccount,
    deleteAccount,
    openAddAccount, openEditAccount, closeAccountModal, handleAccountSubmit,
    heads, loadingHeads,
    headForm, setHeadForm, editingHead,
    deleteHead,
    openAddHead, openEditHead, closeHeadModal, handleHeadSubmit,
    submitting, ACCOUNT_TYPES, HEAD_TYPES,
  } = useFinanceSetup();

  const accountColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Account Name',
        meta: { primary: true },
      },
      {
        accessorKey: 'account_type',
        header: 'Type',
        cell: ({ row }) => <Badge variant="info">{row.original.account_type}</Badge>,
      },
      {
        accessorKey: 'current_balance',
        header: 'Balance',
        cell: ({ row }) => (
          <Span color="default" className="font-semibold">
            ₹{parseFloat(row.original.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
          </Span>
        ),
      },
      {
        accessorKey: 'opening_balance',
        header: 'Opening Balance',
        cell: ({ row }) =>
          `₹${parseFloat(row.original.opening_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
      },
      {
        accessorKey: 'account_start_date',
        header: 'Start Date',
        cell: ({ row }) =>
          new Date(row.original.account_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
      {
        accessorKey: 'is_enabled',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? 'success' : 'default'}>
            {row.original.is_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => openEditAccount(row.original),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: {
                  description: `Are you sure you want to delete account "${row.original.name}"?`,
                },
                onClick: () => deleteAccount(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [openEditAccount, deleteAccount],
  );

  const headColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Head Name',
        meta: { primary: true },
      },
      {
        accessorKey: 'head_type',
        header: 'Type',
        cell: ({ row }) => (
          <Badge variant={row.original.head_type === 'Income' ? 'success' : 'warning'}>
            {row.original.head_type}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Created Date',
        cell: ({ row }) =>
          new Date(row.original.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
      },
      {
        accessorKey: 'is_enabled',
        header: 'Status',
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? 'success' : 'default'}>
            {row.original.is_enabled ? 'Enabled' : 'Disabled'}
          </Badge>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Edit',
                icon: <Pencil size={14} />,
                onClick: () => openEditHead(row.original),
              },
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: {
                  description: `Are you sure you want to delete head "${row.original.name}"?`,
                },
                onClick: () => deleteHead(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [openEditHead, deleteHead],
  );

  return (
    <PageCol>
      <PageHeader
        title="Finance Setup"
        subtitle="Manage finance accounts and income/expense heads"
        actions={
          tab === 'accounts'
            ? <Button onClick={openAddAccount}><Plus size={16} /> Add Account</Button>
            : <Button onClick={openAddHead}><Plus size={16} /> Add Head</Button>
        }
      />

      <Tabs options={FINANCE_SETUP_TABS} value={tab} onChange={setTab} />

      {tab === 'accounts' && (
        <DataTable
          columns={accountColumns}
          data={accounts}
          isLoading={loadingAccounts}
          emptyText="No finance accounts found. Add one to get started."
          fillViewport
        />
      )}

      {tab === 'heads' && (
        <DataTable
          columns={headColumns}
          data={heads}
          isLoading={loadingHeads}
          emptyText="No income/expense heads found. Add one to get started."
          fillViewport
        />
      )}

      <ResponsiveModalContainer isOpen={showAccountModal} title={editingAccount ? 'Edit Finance Account' : 'Add Finance Account'} onClose={closeAccountModal}>
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            <FormField label="Account Name" required>
              <Input
                placeholder="Enter name"
                value={accountForm.name}
                onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))}
              />
            </FormField>
            <FormField label="Account Type" required>
              <ResponsiveSelect
                value={accountForm.account_type}
                onChange={e => setAccountForm(f => ({ ...f, account_type: e.target.value }))}
                options={ACCOUNT_TYPES.map(t => ({ value: t, label: t }))}
              />
            </FormField>
            {!editingAccount && (
              <FormField label="Opening Balance">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  value={accountForm.opening_balance ?? 0}
                  onChange={e => setAccountForm(f => ({ ...f, opening_balance: parseFloat(e.target.value) || 0 }))}
                />
                <P size="xs" className="mt-1">Cannot be modified after creation</P>
              </FormField>
            )}
            {!editingAccount && (
              <FormField label="Account Start Date" required>
                <Input
                  type="date"
                  value={accountForm.account_start_date}
                  onChange={e => setAccountForm(f => ({ ...f, account_start_date: e.target.value }))}
                />
              </FormField>
            )}
            <Div type="row" gap="sm" align="center">
              <input
                type="checkbox"
                id="acc-enabled"
                checked={accountForm.is_enabled ?? true}
                onChange={e => setAccountForm(f => ({ ...f, is_enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="acc-enabled" className="text-sm text-foreground">Enabled</label>
            </Div>
          </Div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="ghost" onClick={closeAccountModal}>Cancel</Button>
          <Button onClick={handleAccountSubmit} disabled={submitting}>
            {submitting ? <Spinner /> : editingAccount ? 'Update' : 'Create'}
          </Button>
        </div>
      </ResponsiveModalContainer>

      <ResponsiveModalContainer isOpen={showHeadModal} title={editingHead ? 'Edit Finance Head' : 'Add Income / Expense Head'} onClose={closeHeadModal}>
        <div className="px-4 py-4">
          <Div type="col" gap="md">
            <FormField label="Head Name" required>
              <Input
                placeholder="Enter name"
                value={headForm.name}
                onChange={e => setHeadForm(f => ({ ...f, name: e.target.value }))}
              />
            </FormField>
            <FormField label="Head Type" required>
              <ResponsiveSelect
                value={headForm.head_type}
                onChange={e => setHeadForm(f => ({ ...f, head_type: e.target.value }))}
                options={HEAD_TYPES.map(t => ({ value: t, label: t }))}
              />
            </FormField>
            <Div type="row" gap="sm" align="center">
              <input
                type="checkbox"
                id="head-enabled"
                checked={headForm.is_enabled ?? true}
                onChange={e => setHeadForm(f => ({ ...f, is_enabled: e.target.checked }))}
                className="h-4 w-4 rounded border-border"
              />
              <label htmlFor="head-enabled" className="text-sm text-foreground">Enabled</label>
            </Div>
          </Div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
          <Button variant="ghost" onClick={closeHeadModal}>Cancel</Button>
          <Button onClick={handleHeadSubmit} disabled={submitting}>
            {submitting ? <Spinner /> : editingHead ? 'Update' : 'Create'}
          </Button>
        </div>
      </ResponsiveModalContainer>
    </PageCol>
  );
}
