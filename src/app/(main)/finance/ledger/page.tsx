'use client';

import { useMemo } from 'react';
import { Trash2, Search, TrendingUp, TrendingDown, ArrowRightLeft } from 'lucide-react';
import {
  Div, Button, Span, P,
  PageHeader, PageCol,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Icon, FormField, Input, FormCard,
  ResponsiveSelect,
  DataTable, type ColumnDef, RowActions,
} from '@/components/ui';
import { Tabs } from '@/components/ui/tabs';
import { useFinanceLedger, LEDGER_TABS } from '@/hooks/useFinanceLedger';

export default function FinanceLedgerPage() {
  const {
    activeTab, setActiveTab,
    accounts, expenseHeads, incomeHeads, staffList, studentList,
    expenses, loadingExpenses, expenseForm, setExpenseForm, submitExpense, deleteExpense,
    incomeList, loadingIncome, incomeForm, setIncomeForm, submitIncome, deleteIncome,
    transfers, loadingTransfers, transferForm, setTransferForm, submitTransfer, deleteTransfer,
    statement, loadingStatement, statementFilters, setStatementFilters, loadStatement,
    register, loadingRegister, registerFilters, setRegisterFilters, loadRegister,
    profitLoss, loadingPL, plFilters, setPlFilters, loadProfitLoss,
    submitting,
    fmt, fmtDate,
  } = useFinanceLedger();

  const expenseColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'expense_head_name',
        header: 'For (Head)',
        meta: { primary: true },
        cell: ({ row }) => row.original.expense_head_name ?? '—',
      },
      {
        accessorKey: 'from_account_name',
        header: 'Account',
        cell: ({ row }) => row.original.from_account_name ?? '—',
      },
      {
        accessorKey: 'total_amount',
        header: 'Total Amount',
        cell: ({ row }) => (
          <Span color="danger" className="font-medium">{fmt(row.original.total_amount)}</Span>
        ),
      },
      {
        accessorKey: 'date_of_expense',
        header: 'Date of Expense',
        cell: ({ row }) => fmtDate(row.original.date_of_expense),
      },
      {
        accessorKey: 'created_at',
        header: 'Entry Date',
        cell: ({ row }) => fmtDate(row.original.created_at),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => row.original.remarks ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: { description: 'Are you sure you want to delete this expense record?' },
                onClick: () => deleteExpense(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [fmt, fmtDate, deleteExpense],
  );

  const incomeColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'income_head_name',
        header: 'Head',
        meta: { primary: true },
        cell: ({ row }) => row.original.income_head_name ?? '—',
      },
      {
        accessorKey: 'to_account_name',
        header: 'Account',
        cell: ({ row }) => row.original.to_account_name ?? '—',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <Span className="text-green-600 font-medium">{fmt(row.original.amount)}</Span>
        ),
      },
      {
        accessorKey: 'date_of_income',
        header: 'Date of Income',
        cell: ({ row }) => fmtDate(row.original.date_of_income),
      },
      {
        accessorKey: 'created_at',
        header: 'Entry Date',
        cell: ({ row }) => fmtDate(row.original.created_at),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => row.original.remarks ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: { description: 'Are you sure you want to delete this income record?' },
                onClick: () => deleteIncome(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [fmt, fmtDate, deleteIncome],
  );

  const transferColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        accessorKey: 'from_account_name',
        header: 'From Account',
        meta: { primary: true },
        cell: ({ row }) => row.original.from_account_name ?? '—',
      },
      {
        accessorKey: 'to_account_name',
        header: 'To Account',
        cell: ({ row }) => row.original.to_account_name ?? '—',
      },
      {
        accessorKey: 'amount',
        header: 'Amount',
        cell: ({ row }) => (
          <Span color="default" className="font-medium">{fmt(row.original.amount)}</Span>
        ),
      },
      {
        accessorKey: 'date_of_transaction',
        header: 'Value Date',
        cell: ({ row }) => fmtDate(row.original.date_of_transaction),
      },
      {
        accessorKey: 'created_at',
        header: 'Created Date',
        cell: ({ row }) => fmtDate(row.original.created_at),
      },
      {
        accessorKey: 'remarks',
        header: 'Remarks',
        cell: ({ row }) => row.original.remarks ?? '—',
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: 'Delete',
                icon: <Trash2 size={14} />,
                variant: 'destructive',
                confirm: { description: 'Are you sure you want to delete this transfer record?' },
                onClick: () => deleteTransfer(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [fmt, fmtDate, deleteTransfer],
  );

  return (
    <PageCol>
      <PageHeader
        title="Finance Ledger"
        subtitle="Record income, expenses, transfers and view reports"
      />

      <Tabs options={LEDGER_TABS} value={activeTab} onChange={setActiveTab} />

      {/* ─── EXPENSES ─────────────────────────────────────────────────────────── */}
      {activeTab === 'expenses' && (
        <Div type="col" gap="lg">
          <FormCard title="Record Finance Expense">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Expense Head" required>
                <ResponsiveSelect value={expenseForm.expense_head_id} onChange={e => setExpenseForm(f => ({ ...f, expense_head_id: e.target.value }))}
                  customPlaceholder="Select Expense Head"
                  options={expenseHeads.map(h => ({ value: h.id, label: h.name }))}
                />
              </FormField>
              <FormField label="From Account" required>
                <ResponsiveSelect value={expenseForm.from_account_id} onChange={e => setExpenseForm(f => ({ ...f, from_account_id: e.target.value }))}
                  customPlaceholder="Select Account"
                  options={accounts.map(a => ({ value: a.id, label: `${a.name} — ₹${parseFloat(a.current_balance).toLocaleString('en-IN')}` }))}
                />
              </FormField>
              <FormField label="Total Expense Amount" required>
                <Input type="number" min="0" step="0.01" placeholder="Enter Expense Amount" value={expenseForm.total_amount || ''} onChange={e => setExpenseForm(f => ({ ...f, total_amount: parseFloat(e.target.value) || 0 }))} />
              </FormField>
              <FormField label="Date of Expense" required>
                <Input type="date" value={expenseForm.date_of_expense} onChange={e => setExpenseForm(f => ({ ...f, date_of_expense: e.target.value }))} />
              </FormField>
              <FormField label="Select Employee">
                <ResponsiveSelect value={expenseForm.employee_id ?? ''} onChange={e => setExpenseForm(f => ({ ...f, employee_id: e.target.value || undefined }))}
                  customPlaceholder="Select Employee (optional)"
                  options={staffList.map(s => ({ value: s.id, label: `${s.first_name}${s.last_name ? ` ${s.last_name}` : ''}${s.employee_code ? ` (${s.employee_code})` : ''}` }))}
                />
              </FormField>
              <FormField label="Remarks" required>
                <Input placeholder="Enter Remarks" value={expenseForm.remarks ?? ''} onChange={e => setExpenseForm(f => ({ ...f, remarks: e.target.value }))} />
              </FormField>
            </Div>
            <Div className="mt-4 flex justify-end">
              <Button onClick={submitExpense} disabled={submitting}>
                {submitting ? <Spinner /> : 'Add Expense'}
              </Button>
            </Div>
          </FormCard>

          <Div type="col" gap="sm">
            <P color="default" weight="semibold">Latest 25 Expense Finance Records</P>
            <DataTable
              columns={expenseColumns}
              data={expenses}
              isLoading={loadingExpenses}
              emptyText="No expense records yet."
            />
          </Div>
        </Div>
      )}

      {/* ─── INCOME ───────────────────────────────────────────────────────────── */}
      {activeTab === 'income' && (
        <Div type="col" gap="lg">
          <FormCard title="Record Finance Income">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="Income Head" required>
                <ResponsiveSelect value={incomeForm.income_head_id} onChange={e => setIncomeForm(f => ({ ...f, income_head_id: e.target.value }))}
                  customPlaceholder="Select Income Head"
                  options={incomeHeads.map(h => ({ value: h.id, label: h.name }))}
                />
              </FormField>
              <FormField label="In Account" required>
                <ResponsiveSelect value={incomeForm.to_account_id} onChange={e => setIncomeForm(f => ({ ...f, to_account_id: e.target.value }))}
                  customPlaceholder="Select Account"
                  options={accounts.map(a => ({ value: a.id, label: `${a.name} — ₹${parseFloat(a.current_balance).toLocaleString('en-IN')}` }))}
                />
              </FormField>
              <FormField label="Amount" required>
                <Input type="number" min="0" step="0.01" placeholder="Enter Income Amount" value={incomeForm.amount || ''} onChange={e => setIncomeForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              </FormField>
              <FormField label="Date of Income" required>
                <Input type="date" value={incomeForm.date_of_income} onChange={e => setIncomeForm(f => ({ ...f, date_of_income: e.target.value }))} />
              </FormField>
              <FormField label="Select Student">
                <ResponsiveSelect value={incomeForm.student_id ?? ''} onChange={e => setIncomeForm(f => ({ ...f, student_id: e.target.value || undefined }))}
                  customPlaceholder="Select Student (optional)"
                  options={studentList.map(s => ({ value: s.id, label: `${s.first_name}${s.last_name ? ` ${s.last_name}` : ''}${s.admission_number ? ` — ${s.admission_number}` : ''}${s.class_name ? ` (${s.class_name}${s.section_name ? ` ${s.section_name}` : ''})` : ''}` }))}
                />
              </FormField>
              <FormField label="Remarks" required>
                <Input placeholder="Enter Remarks" value={incomeForm.remarks ?? ''} onChange={e => setIncomeForm(f => ({ ...f, remarks: e.target.value }))} />
              </FormField>
            </Div>
            <Div className="mt-4 flex justify-end">
              <Button onClick={submitIncome} disabled={submitting}>
                {submitting ? <Spinner /> : 'Add Income'}
              </Button>
            </Div>
          </FormCard>

          <Div type="col" gap="sm">
            <P color="default" weight="semibold">Latest 25 Income Finance Records</P>
            <DataTable
              columns={incomeColumns}
              data={incomeList}
              isLoading={loadingIncome}
              emptyText="No income records yet."
            />
          </Div>
        </Div>
      )}

      {/* ─── TRANSFERS ────────────────────────────────────────────────────────── */}
      {activeTab === 'transfers' && (
        <Div type="col" gap="lg">
          <FormCard title="Account Balance Transfer">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2 lg:grid-cols-3">
              <FormField label="From Account" required>
                <ResponsiveSelect value={transferForm.from_account_id} onChange={e => setTransferForm(f => ({ ...f, from_account_id: e.target.value }))}
                  customPlaceholder="Select Account"
                  options={accounts.map(a => ({ value: a.id, label: `${a.name} — ₹${parseFloat(a.current_balance).toLocaleString('en-IN')}` }))}
                />
              </FormField>
              <FormField label="To Account" required>
                <ResponsiveSelect value={transferForm.to_account_id} onChange={e => setTransferForm(f => ({ ...f, to_account_id: e.target.value }))}
                  customPlaceholder="Select Account"
                  options={accounts.filter(a => a.id !== transferForm.from_account_id).map(a => ({ value: a.id, label: `${a.name} — ₹${parseFloat(a.current_balance).toLocaleString('en-IN')}` }))}
                />
              </FormField>
              <FormField label="Amount" required>
                <Input type="number" min="0" step="0.01" placeholder="Enter Amount" value={transferForm.amount || ''} onChange={e => setTransferForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} />
              </FormField>
              <FormField label="Date of Transaction" required>
                <Input type="date" value={transferForm.date_of_transaction} onChange={e => setTransferForm(f => ({ ...f, date_of_transaction: e.target.value }))} />
              </FormField>
              <Div className="sm:col-span-2">
                <FormField label="Remarks" required>
                  <Input placeholder="Enter Remarks" value={transferForm.remarks ?? ''} onChange={e => setTransferForm(f => ({ ...f, remarks: e.target.value }))} />
                </FormField>
              </Div>
            </Div>
            <Div className="mt-4 flex justify-end">
              <Button onClick={submitTransfer} disabled={submitting}>
                {submitting ? <Spinner /> : <><ArrowRightLeft size={14} className="mr-1" />Transfer</>}
              </Button>
            </Div>
          </FormCard>

          <Div type="col" gap="sm">
            <P color="default" weight="semibold">Account Balance Transfer Transactions</P>
            <DataTable
              columns={transferColumns}
              data={transfers}
              isLoading={loadingTransfers}
              emptyText="No transfer records yet."
            />
          </Div>
        </Div>
      )}

      {/* ─── ACCOUNT STATEMENT ────────────────────────────────────────────────── */}
      {activeTab === 'statement' && (
        <Div type="col" gap="lg">
          <FormCard title="Account Statement">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-3">
              <FormField label="Account" required>
                <ResponsiveSelect value={statementFilters.account_id} onChange={e => setStatementFilters(f => ({ ...f, account_id: e.target.value }))}
                  customPlaceholder="Select Account"
                  options={accounts.map(a => ({ value: a.id, label: a.name }))}
                />
              </FormField>
              <FormField label="Start Date" required>
                <Input type="date" value={statementFilters.start_date} onChange={e => setStatementFilters(f => ({ ...f, start_date: e.target.value }))} />
              </FormField>
              <FormField label="End Date" required>
                <Input type="date" value={statementFilters.end_date} onChange={e => setStatementFilters(f => ({ ...f, end_date: e.target.value }))} />
              </FormField>
            </Div>
            <Div className="mt-4 flex justify-end">
              <Button onClick={loadStatement} disabled={loadingStatement}>
                {loadingStatement ? <Spinner /> : <><Search size={14} className="mr-1" />View Statement</>}
              </Button>
            </Div>
          </FormCard>

          {statement && (
            <Div type="col" gap="md">
              <Div className="rounded-xl border border-border/50 bg-card p-5">
                <Div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                  <Span color="default" className="font-semibold text-base">{statement.account.name}</Span>
                  <Span>Create Date: {fmtDate(statement.account.account_start_date)}</Span>
                  <Span>Opening Balance: {fmt(statement.opening_balance)}</Span>
                  <Span>Closing Balance: {fmt(statement.closing_balance)}</Span>
                  <Span color="default" className="font-medium">Current Balance: {fmt(statement.current_balance)}</Span>
                </Div>
              </Div>
              <P color="default" weight="semibold">
                Statement from {fmtDate(statementFilters.start_date)} to {fmtDate(statementFilters.end_date)}
              </P>
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>Txn Date</TableHeaderCell>
                    <TableHeaderCell>Value Date</TableHeaderCell>
                    <TableHeaderCell>Description</TableHeaderCell>
                    <TableHeaderCell>Debit (₹)</TableHeaderCell>
                    <TableHeaderCell>Credit (₹)</TableHeaderCell>
                    <TableHeaderCell>Balance (₹)</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {statement.entries.length === 0 ? (
                    <TableEmptyRow colSpan={6}>No transactions in this period.</TableEmptyRow>
                  ) : statement.entries.map((e, i) => (
                    <TableRow key={i}>
                      <TableCell>{fmtDate(e.txn_date)}</TableCell>
                      <TableCell>{fmtDate(e.value_date)}</TableCell>
                      <TableCell primary>{e.description}</TableCell>
                      <TableCell>{e.debit ? <Span color="danger">{parseFloat(e.debit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Span> : '—'}</TableCell>
                      <TableCell>{e.credit ? <Span className="text-green-600">{parseFloat(e.credit).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Span> : '—'}</TableCell>
                      <TableCell><Span color="default" className="font-medium">{parseFloat(e.balance).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Span></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Div>
          )}
        </Div>
      )}

      {/* ─── DAILY REGISTER ───────────────────────────────────────────────────── */}
      {activeTab === 'register' && (
        <Div type="col" gap="lg">
          <FormCard title="Finance Daily Register">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2 lg:grid-cols-4">
              <FormField label="Start Date">
                <Input type="date" value={registerFilters.start_date} onChange={e => setRegisterFilters(f => ({ ...f, start_date: e.target.value }))} />
              </FormField>
              <FormField label="End Date">
                <Input type="date" value={registerFilters.end_date} onChange={e => setRegisterFilters(f => ({ ...f, end_date: e.target.value }))} />
              </FormField>
              <FormField label="Account">
                <ResponsiveSelect value={registerFilters.account_id} onChange={e => setRegisterFilters(f => ({ ...f, account_id: e.target.value }))}
                  customPlaceholder="All Accounts"
                  options={accounts.map(a => ({ value: a.id, label: a.name }))}
                />
              </FormField>
              <FormField label="Head Type">
                <ResponsiveSelect value={registerFilters.head_type} onChange={e => setRegisterFilters(f => ({ ...f, head_type: e.target.value }))}
                  customPlaceholder="Income & Expense"
                  options={[
                    { value: 'Income', label: 'Income' },
                    { value: 'Expense', label: 'Expense' },
                  ]}
                />
              </FormField>
            </Div>
            <Div className="mt-4 flex justify-end">
              <Button onClick={loadRegister} disabled={loadingRegister}>
                {loadingRegister ? <Spinner /> : <><Search size={14} className="mr-1" />Load Register</>}
              </Button>
            </Div>
          </FormCard>

          {register.length > 0 && (
            <Div type="col" gap="sm">
              <P color="default" weight="semibold">
                Finance Register from {fmtDate(registerFilters.start_date)} to {fmtDate(registerFilters.end_date)}
              </P>
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>Transaction ID</TableHeaderCell>
                    <TableHeaderCell>Created Date</TableHeaderCell>
                    <TableHeaderCell>Transaction Date</TableHeaderCell>
                    <TableHeaderCell>Head</TableHeaderCell>
                    <TableHeaderCell>Type</TableHeaderCell>
                    <TableHeaderCell>Account</TableHeaderCell>
                    <TableHeaderCell>Amount</TableHeaderCell>
                    <TableHeaderCell>Remarks</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {register.map(r => (
                    <TableRow key={r.id}>
                      <TableCell><code className="text-xs">{r.id.slice(0, 8)}…</code></TableCell>
                      <TableCell>{fmtDate(r.created_at)}</TableCell>
                      <TableCell>{fmtDate(r.transaction_date)}</TableCell>
                      <TableCell primary>{r.head_name}</TableCell>
                      <TableCell>
                        <Badge variant={r.head_type === 'Income' ? 'success' : 'warning'}>{r.head_type}</Badge>
                      </TableCell>
                      <TableCell>{r.account_name}</TableCell>
                      <TableCell>
                        <Span className={r.type === 'income' ? 'text-green-600 font-medium' : 'text-destructive font-medium'}>
                          {r.type === 'income' ? '+' : '-'}{parseFloat(r.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Span>
                      </TableCell>
                      <TableCell>{r.remarks ?? '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Div>
          )}
          {register.length === 0 && !loadingRegister && (
            <Div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Select date range and click Load Register to view transactions.
            </Div>
          )}
        </Div>
      )}

      {/* ─── PROFIT & LOSS ────────────────────────────────────────────────────── */}
      {activeTab === 'profit-loss' && (
        <Div type="col" gap="lg">
          <FormCard title="Finance Profit & Loss">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2">
              <FormField label="Start Date" required>
                <Input type="date" value={plFilters.start_date} onChange={e => setPlFilters(f => ({ ...f, start_date: e.target.value }))} />
              </FormField>
              <FormField label="End Date" required>
                <Input type="date" value={plFilters.end_date} onChange={e => setPlFilters(f => ({ ...f, end_date: e.target.value }))} />
              </FormField>
            </Div>
            <Div className="mt-4 flex justify-end">
              <Button onClick={loadProfitLoss} disabled={loadingPL}>
                {loadingPL ? <Spinner /> : <><Search size={14} className="mr-1" />Calculate</>}
              </Button>
            </Div>
          </FormCard>

          {profitLoss && (
            <Div type="col" gap="lg">
              <Div type="grid" cols={1} gap="md" className="sm:grid-cols-3">
                <Div className="rounded-xl border border-border/50 bg-card p-5">
                  <Div type="row" gap="sm" align="center" className="text-green-600 mb-2">
                    <TrendingUp size={18} />
                    <Span className="text-sm font-medium">Total Income</Span>
                  </Div>
                  <P color="default" className="text-2xl font-bold">{fmt(profitLoss.total_income)}</P>
                </Div>
                <Div className="rounded-xl border border-border/50 bg-card p-5">
                  <Div type="row" gap="sm" align="center" className="text-destructive mb-2">
                    <TrendingDown size={18} />
                    <Span className="text-sm font-medium">Total Expense</Span>
                  </Div>
                  <P color="default" className="text-2xl font-bold">{fmt(profitLoss.total_expense)}</P>
                </Div>
                <Div className={`rounded-xl border p-5 ${parseFloat(profitLoss.net_profit) >= 0 ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950' : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950'}`}>
                  <P className="text-sm font-medium text-muted-foreground mb-2">Net {parseFloat(profitLoss.net_profit) >= 0 ? 'Profit' : 'Loss'}</P>
                  <P className={`text-2xl font-bold ${parseFloat(profitLoss.net_profit) >= 0 ? 'text-green-600' : 'text-destructive'}`}>
                    {fmt(Math.abs(parseFloat(profitLoss.net_profit)).toFixed(2))}
                  </P>
                </Div>
              </Div>

              <Div type="grid" cols={1} gap="lg" className="lg:grid-cols-2">
                <Div type="col" gap="sm">
                  <P weight="semibold" className="text-green-600 flex items-center gap-1"><TrendingUp size={14} /> Income Breakdown</P>
                  <Table>
                    <TableHead>
                      <TableHeadRow>
                        <TableHeaderCell>Head</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                      </TableHeadRow>
                    </TableHead>
                    <TableBody>
                      {profitLoss.income_heads.length === 0 ? (
                        <TableEmptyRow colSpan={2}>No income in this period.</TableEmptyRow>
                      ) : profitLoss.income_heads.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell primary>{h.head_name}</TableCell>
                          <TableCell><Span className="text-green-600 font-medium">{fmt(h.amount)}</Span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Div>
                <Div type="col" gap="sm">
                  <P weight="semibold" className="text-destructive flex items-center gap-1"><TrendingDown size={14} /> Expense Breakdown</P>
                  <Table>
                    <TableHead>
                      <TableHeadRow>
                        <TableHeaderCell>Head</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                      </TableHeadRow>
                    </TableHead>
                    <TableBody>
                      {profitLoss.expense_heads.length === 0 ? (
                        <TableEmptyRow colSpan={2}>No expenses in this period.</TableEmptyRow>
                      ) : profitLoss.expense_heads.map((h, i) => (
                        <TableRow key={i}>
                          <TableCell primary>{h.head_name}</TableCell>
                          <TableCell><Span color="danger" className="font-medium">{fmt(h.amount)}</Span></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Div>
              </Div>
            </Div>
          )}
          {!profitLoss && !loadingPL && (
            <Div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              Select date range and click Calculate to view Profit & Loss.
            </Div>
          )}
        </Div>
      )}
    </PageCol>
  );
}
