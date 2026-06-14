'use client';

import { Plus, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, Button, Span, P, FormField, Input, Select,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon,
} from '@/components/ui';
import { Tabs } from '@/components/ui/tabs';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
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

  return (
    <Div type="col" gap="lg">
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
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>Account Name</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Balance</TableHeaderCell>
              <TableHeaderCell>Opening Balance</TableHeaderCell>
              <TableHeaderCell>Start Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {loadingAccounts ? (
              <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
            ) : accounts.length === 0 ? (
              <TableEmptyRow colSpan={7}>No finance accounts found. Add one to get started.</TableEmptyRow>
            ) : accounts.map(a => (
              <TableRow key={a.id}>
                <TableCell primary>{a.name}</TableCell>
                <TableCell>
                  <Badge variant="info">{a.account_type}</Badge>
                </TableCell>
                <TableCell>
                  <Span color="default" className="font-semibold">₹{parseFloat(a.current_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Span>
                </TableCell>
                <TableCell>₹{parseFloat(a.opening_balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</TableCell>
                <TableCell>{new Date(a.account_start_date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                <TableCell>
                  <Badge variant={a.is_enabled ? 'success' : 'default'}>{a.is_enabled ? 'Enabled' : 'Disabled'}</Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openEditAccount(a)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteAccount(a.id)}>
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {tab === 'heads' && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>Head Name</TableHeaderCell>
              <TableHeaderCell>Type</TableHeaderCell>
              <TableHeaderCell>Created Date</TableHeaderCell>
              <TableHeaderCell>Status</TableHeaderCell>
              <TableHeaderCell>Actions</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {loadingHeads ? (
              <TableEmptyRow colSpan={5}><Spinner /></TableEmptyRow>
            ) : heads.length === 0 ? (
              <TableEmptyRow colSpan={5}>No income/expense heads found. Add one to get started.</TableEmptyRow>
            ) : heads.map(h => (
              <TableRow key={h.id}>
                <TableCell primary>{h.name}</TableCell>
                <TableCell>
                  <Badge variant={h.head_type === 'Income' ? 'success' : 'warning'}>{h.head_type}</Badge>
                </TableCell>
                <TableCell>{new Date(h.created_at).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</TableCell>
                <TableCell>
                  <Badge variant={h.is_enabled ? 'success' : 'default'}>{h.is_enabled ? 'Enabled' : 'Disabled'}</Badge>
                </TableCell>
                <TableCell>
                  <Div type="row" gap="xs">
                    <Button size="sm" variant="ghost" onClick={() => openEditHead(h)}>
                      <Icon icon={Pencil} type="sm" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => deleteHead(h.id)}>
                      <Icon icon={Trash2} type="sm-danger" />
                    </Button>
                  </Div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {showAccountModal && (
        <Modal title={editingAccount ? 'Edit Finance Account' : 'Add Finance Account'} onClose={closeAccountModal} size="md">
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Account Name" required>
                <Input
                  placeholder="Enter name"
                  value={accountForm.name}
                  onChange={e => setAccountForm(f => ({ ...f, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Account Type" required>
                <Select
                  value={accountForm.account_type}
                  onChange={e => setAccountForm(f => ({ ...f, account_type: e.target.value }))}
                >
                  {ACCOUNT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
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
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeAccountModal}>Cancel</Button>
            <Button onClick={handleAccountSubmit} disabled={submitting}>
              {submitting ? <Spinner /> : editingAccount ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {showHeadModal && (
        <Modal title={editingHead ? 'Edit Finance Head' : 'Add Income / Expense Head'} onClose={closeHeadModal} size="md">
          <ModalBody>
            <Div type="col" gap="md">
              <FormField label="Head Name" required>
                <Input
                  placeholder="Enter name"
                  value={headForm.name}
                  onChange={e => setHeadForm(f => ({ ...f, name: e.target.value }))}
                />
              </FormField>
              <FormField label="Head Type" required>
                <Select
                  value={headForm.head_type}
                  onChange={e => setHeadForm(f => ({ ...f, head_type: e.target.value }))}
                >
                  {HEAD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </Select>
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
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={closeHeadModal}>Cancel</Button>
            <Button onClick={handleHeadSubmit} disabled={submitting}>
              {submitting ? <Spinner /> : editingHead ? 'Update' : 'Create'}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </Div>
  );
}
