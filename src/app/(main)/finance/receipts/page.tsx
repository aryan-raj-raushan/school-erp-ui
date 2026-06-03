"use client";

import { useFeeReceipts } from "@/hooks/useFees";
import { FEE_RECEIPTS_PAGE, FEE_STATUS_BADGE, PAYMENT_MODE_OPTIONS } from "@/constants";
import {
  Div, H1, P, Button, Input, Select,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  TablePagination, Badge, Spinner, Modal, FormField, FilterLabel, Icon,
} from "@/components/ui";
import { CreditCard } from "lucide-react";

export default function FeeReceiptsPage() {
  const {
    receipts, pagination, studentIdFilter, setStudentIdFilter,
    page, setPage, isLoading, isSaving,
    showPaymentModal, setShowPaymentModal,
    paymentForm, openPaymentModal, handlePayment,
  } = useFeeReceipts();

  const { register, handleSubmit, formState: { errors } } = paymentForm;

  return (
    <Div type="col" gap="lg">
      <H1>{FEE_RECEIPTS_PAGE.title}</H1>

      <Div variant="card" padding="p-4">
        <Div type="row" gap="md" align="center">
          <FilterLabel noWrap>Filter by Student ID</FilterLabel>
          <Input
            placeholder="Student ID"
            value={studentIdFilter}
            onChange={(e) => { setStudentIdFilter(e.target.value); setPage(1); }}
            width="md"
          />
        </Div>
      </Div>

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.receipt}</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.total}</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.paid}</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.balance}</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.dueDate}</TableHeaderCell>
            <TableHeaderCell>{FEE_RECEIPTS_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
          ) : receipts.length === 0 ? (
            <TableEmptyRow colSpan={8}>{FEE_RECEIPTS_PAGE.empty}</TableEmptyRow>
          ) : (
            receipts.map((r, i) => (
              <TableRow key={r.id} variant={r.status === 'OVERDUE' ? 'danger' : undefined}>
                <TableCell>{((page - 1) * 20) + i + 1}</TableCell>
                <TableCell primary>{r.receipt_number ?? r.id.slice(0, 8)}</TableCell>
                <TableCell>₹{r.total_amount.toLocaleString()}</TableCell>
                <TableCell><P color="green">₹{r.paid_amount.toLocaleString()}</P></TableCell>
                <TableCell>
                  <P color={r.balance_amount > 0 ? "red" : "green"}>₹{r.balance_amount.toLocaleString()}</P>
                </TableCell>
                <TableCell><Badge variant={FEE_STATUS_BADGE[r.status]}>{r.status}</Badge></TableCell>
                <TableCell>{r.due_date ?? '—'}</TableCell>
                <TableCell>
                  {r.status !== 'PAID' && r.status !== 'WAIVED' && (
                    <Button size="sm" variant="outline" onClick={() => openPaymentModal(r.id)}>
                      <Icon icon={CreditCard} type="sm-inline" />Pay
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} />
      )}

      {showPaymentModal && (
        <Modal title="Record Payment" onClose={() => setShowPaymentModal(false)}>
          <form onSubmit={handleSubmit(handlePayment)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label="Amount *" error={errors.amount?.message}>
                <Input type="number" {...register('amount')} placeholder="Enter amount" />
              </FormField>
              <FormField label="Payment Mode *" error={errors.payment_mode?.message}>
                <Select {...register('payment_mode')}>
                  {PAYMENT_MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </FormField>
              <FormField label="Transaction ID">
                <Input {...register('transaction_id')} placeholder="Optional" />
              </FormField>
              <FormField label="Notes">
                <Input {...register('notes')} placeholder="Optional" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>Cancel</Button>
                <Button type="submit" loading={isSaving}>Record Payment</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
