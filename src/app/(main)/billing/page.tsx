'use client';

import { useMemo, useState } from 'react';
import { BILLING_PAGE, INVOICE_STATUS_BADGE, ONE_TIME_CHARGE_TYPE_OPTIONS, PENDING_PAYMENTS_SECTION } from '@/constants';
import { useBilling } from '@/hooks/useBilling';
import { useSchools } from '@/hooks/useSchools';
import type { Invoice, InvoicePayment } from '@/types';
import {
  Div, P, Button, Input,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  FormField, Badge, Spinner,
  PageHeader, PageCol,
  ResponsiveSelect, ResponsiveModalContainer,
} from '@/components/ui';

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString() : '—';
}

export default function BillingPage() {
  const {
    invoices, pagination, isLoading,
    activeSubscriptions,
    showGenerateModal, openGenerateModal, closeGenerateModal, generateForm, handleGenerateSubmit, isGenerating,
    extraItems, addExtraItemRow, updateExtraItemRow, removeExtraItemRow,
    showChargeModal, openChargeModal, closeChargeModal, chargeForm, handleChargeSubmit, isAddingCharge,
    schoolInvoiceOptions,
    pendingPayments, isPendingLoading, approvePayment, rejectPayment,
    rejectingPaymentId, setRejectingPaymentId,
    viewingInvoice, isDetailLoading, openInvoice, closeInvoice,
    canAddItems, addItemToInvoice, isAddingItem,
  } = useBilling();
  const { schools } = useSchools();
  const [rejectReason, setRejectReason] = useState('');
  const [newItemDescription, setNewItemDescription] = useState('');
  const [newItemAmount, setNewItemAmount] = useState('');
  const [newItemQty, setNewItemQty] = useState('1');

  const schoolNameById = useMemo(() => new Map(schools.map((s) => [s.id, s.name])), [schools]);
  const targetInvoiceId = chargeForm.watch('target_invoice_id');

  function handleReject(payment: InvoicePayment) {
    if (!rejectReason.trim()) return;
    rejectPayment(payment, rejectReason.trim());
    setRejectReason('');
  }

  function handleAddItem() {
    const amount = Number(newItemAmount);
    if (!newItemDescription.trim() || !amount || amount <= 0) return;
    addItemToInvoice({
      description: newItemDescription.trim(),
      amount,
      quantity: Number(newItemQty) || 1,
    });
    setNewItemDescription('');
    setNewItemAmount('');
    setNewItemQty('1');
  }

  return (
    <PageCol>
      <PageHeader
        title={BILLING_PAGE.title}
        subtitle={pagination ? `${pagination.total} invoices` : BILLING_PAGE.description}
        actions={
          <Div type="row" gap="sm">
            <Button variant="outline" onClick={openChargeModal}>{BILLING_PAGE.addCharge}</Button>
            <Button onClick={openGenerateModal}>{BILLING_PAGE.generateInvoice}</Button>
          </Div>
        }
      />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{BILLING_PAGE.table.number}</TableHeaderCell>
            <TableHeaderCell>{BILLING_PAGE.table.school}</TableHeaderCell>
            <TableHeaderCell>{BILLING_PAGE.table.total}</TableHeaderCell>
            <TableHeaderCell>{BILLING_PAGE.table.paid}</TableHeaderCell>
            <TableHeaderCell>{BILLING_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{BILLING_PAGE.table.dueDate}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : invoices.length === 0 ? (
            <TableEmptyRow colSpan={6}>{BILLING_PAGE.empty}</TableEmptyRow>
          ) : (
            invoices.map((invoice: Invoice) => (
              <TableRow key={invoice.id} onClick={() => openInvoice(invoice.id)} className="cursor-pointer">
                <TableCell primary>{invoice.invoice_number}</TableCell>
                <TableCell>{schoolNameById.get(invoice.school_id) ?? invoice.school_id.slice(0, 8)}</TableCell>
                <TableCell>₹{invoice.total_amount}</TableCell>
                <TableCell>₹{invoice.amount_paid}</TableCell>
                <TableCell>
                  <Badge variant={INVOICE_STATUS_BADGE[invoice.status]}>{invoice.status}</Badge>
                </TableCell>
                <TableCell>{fmtDate(invoice.due_date)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {pagination && pagination.totalPages > 1 && (
        <TablePagination total={pagination.total} page={pagination.page} totalPages={pagination.totalPages} />
      )}

      <PageHeader title={PENDING_PAYMENTS_SECTION.title} />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{PENDING_PAYMENTS_SECTION.table.school}</TableHeaderCell>
            <TableHeaderCell>{PENDING_PAYMENTS_SECTION.table.method}</TableHeaderCell>
            <TableHeaderCell>{PENDING_PAYMENTS_SECTION.table.amount}</TableHeaderCell>
            <TableHeaderCell>{PENDING_PAYMENTS_SECTION.table.proof}</TableHeaderCell>
            <TableHeaderCell>{PENDING_PAYMENTS_SECTION.table.submitted}</TableHeaderCell>
            <TableHeaderCell>Actions</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isPendingLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : pendingPayments.length === 0 ? (
            <TableEmptyRow colSpan={6}>{PENDING_PAYMENTS_SECTION.empty}</TableEmptyRow>
          ) : (
            pendingPayments.map((payment) => (
              <TableRow key={payment.id}>
                <TableCell primary>{schoolNameById.get(payment.school_id) ?? payment.school_id.slice(0, 8)}</TableCell>
                <TableCell>{payment.payment_method}</TableCell>
                <TableCell>₹{payment.amount}</TableCell>
                <TableCell>
                  {payment.proof_url ? (
                    <a href={payment.proof_url} target="_blank" rel="noopener noreferrer" className="underline">
                      {PENDING_PAYMENTS_SECTION.viewProof}
                    </a>
                  ) : '—'}
                </TableCell>
                <TableCell>{fmtDate(payment.created_at)}</TableCell>
                <TableCell>
                  {rejectingPaymentId === payment.id ? (
                    <Div type="col" gap="xs">
                      <Input
                        width="sm"
                        placeholder={PENDING_PAYMENTS_SECTION.rejectPrompt}
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                      <Div type="row" gap="xs">
                        <Button size="sm" variant="ghost" onClick={() => handleReject(payment)}>
                          {PENDING_PAYMENTS_SECTION.rejectSubmit}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => { setRejectingPaymentId(null); setRejectReason(''); }}>
                          {PENDING_PAYMENTS_SECTION.rejectCancel}
                        </Button>
                      </Div>
                    </Div>
                  ) : (
                    <Div type="row" gap="sm">
                      <Button size="sm" onClick={() => approvePayment(payment)}>{PENDING_PAYMENTS_SECTION.approve}</Button>
                      <Button size="sm" variant="outline" onClick={() => setRejectingPaymentId(payment.id)}>
                        {PENDING_PAYMENTS_SECTION.reject}
                      </Button>
                    </Div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {showGenerateModal && (
        <ResponsiveModalContainer isOpen={showGenerateModal} onClose={closeGenerateModal} title={BILLING_PAGE.generateForm.title}>
          <form onSubmit={handleGenerateSubmit}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                <FormField label={BILLING_PAGE.generateForm.subscription} error={generateForm.formState.errors.subscription_id?.message}>
                  <ResponsiveSelect
                    {...generateForm.register('subscription_id', { required: true })}
                    customPlaceholder="Select subscription"
                    options={activeSubscriptions.map((s) => ({
                      value: s.id,
                      label: `${schoolNameById.get(s.school_id) ?? s.school_id.slice(0, 8)} — ${s.plan_name}`,
                    }))}
                  />
                </FormField>
                <FormField label={BILLING_PAGE.generateForm.dueDate}>
                  <Input type="date" {...generateForm.register('due_date')} />
                </FormField>
                <FormField label={BILLING_PAGE.generateForm.notes}>
                  <Input {...generateForm.register('notes')} />
                </FormField>

                <Div type="col" gap="sm">
                  <Div type="row" className="items-center justify-between">
                    <P color="muted">{BILLING_PAGE.generateForm.extraItems}</P>
                    <Button type="button" size="sm" variant="outline" onClick={addExtraItemRow}>
                      {BILLING_PAGE.generateForm.addItem}
                    </Button>
                  </Div>
                  {extraItems.map((item, index) => (
                    <Div key={index} type="row" gap="sm" className="items-end">
                      <Input
                        placeholder={BILLING_PAGE.generateForm.itemDescription}
                        value={item.description}
                        onChange={(e) => updateExtraItemRow(index, { description: e.target.value })}
                      />
                      <Input
                        type="number"
                        width="sm"
                        placeholder={BILLING_PAGE.generateForm.itemAmount}
                        value={item.amount || ''}
                        onChange={(e) => updateExtraItemRow(index, { amount: Number(e.target.value) })}
                      />
                      <Input
                        type="number"
                        width="xs"
                        placeholder={BILLING_PAGE.generateForm.itemQuantity}
                        value={item.quantity ?? 1}
                        onChange={(e) => updateExtraItemRow(index, { quantity: Number(e.target.value) })}
                      />
                      <Button type="button" size="sm" variant="ghost" onClick={() => removeExtraItemRow(index)}>
                        {BILLING_PAGE.generateForm.remove}
                      </Button>
                    </Div>
                  ))}
                </Div>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeGenerateModal}>{BILLING_PAGE.generateForm.cancel}</Button>
              <Button type="submit" loading={isGenerating}>{BILLING_PAGE.generateForm.submit}</Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}

      {showChargeModal && (
        <ResponsiveModalContainer isOpen={showChargeModal} onClose={closeChargeModal} title={BILLING_PAGE.chargeForm.title}>
          <form onSubmit={handleChargeSubmit}>
            <div className="px-4 py-4">
              <Div type="col" gap="md">
                <FormField label={BILLING_PAGE.chargeForm.school} error={chargeForm.formState.errors.school_id?.message}>
                  <ResponsiveSelect
                    {...chargeForm.register('school_id', { required: true })}
                    customPlaceholder="Select school"
                    options={schools.map((s) => ({ value: s.id, label: s.name }))}
                  />
                </FormField>
                <FormField label={BILLING_PAGE.chargeForm.chargeType} error={chargeForm.formState.errors.charge_type?.message}>
                  <ResponsiveSelect
                    {...chargeForm.register('charge_type', { required: true })}
                    customPlaceholder="Select charge type"
                    options={ONE_TIME_CHARGE_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                  />
                </FormField>
                <FormField label={BILLING_PAGE.chargeForm.description}>
                  <Input {...chargeForm.register('description')} />
                </FormField>
                <Div type="row" gap="sm">
                  <FormField label={BILLING_PAGE.chargeForm.amount} error={chargeForm.formState.errors.amount?.message}>
                    <Input type="number" {...chargeForm.register('amount', { required: true, valueAsNumber: true })} />
                  </FormField>
                  <FormField label={BILLING_PAGE.chargeForm.quantity}>
                    <Input
                      type="number"
                      width="sm"
                      min={1}
                      defaultValue={1}
                      {...chargeForm.register('quantity', { valueAsNumber: true, min: 1 })}
                    />
                  </FormField>
                </Div>
                <FormField label={BILLING_PAGE.chargeForm.targetInvoice} hint={BILLING_PAGE.chargeForm.targetInvoiceHint}>
                  <ResponsiveSelect
                    {...chargeForm.register('target_invoice_id')}
                    customPlaceholder={BILLING_PAGE.chargeForm.targetInvoicePlaceholder}
                    options={schoolInvoiceOptions.map((inv) => ({
                      value: inv.id,
                      label: `${inv.invoice_number} — ₹${(Number(inv.total_amount) - Number(inv.amount_paid)).toFixed(2)} due`,
                    }))}
                  />
                </FormField>
              </Div>
            </div>
            <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
              <Button type="button" variant="outline" onClick={closeChargeModal}>{BILLING_PAGE.chargeForm.cancel}</Button>
              <Button type="submit" loading={isAddingCharge}>
                {targetInvoiceId ? BILLING_PAGE.chargeForm.submitToExisting : BILLING_PAGE.chargeForm.submit}
              </Button>
            </div>
          </form>
        </ResponsiveModalContainer>
      )}

      {(viewingInvoice || isDetailLoading) && (
        <ResponsiveModalContainer
          isOpen={!!viewingInvoice || isDetailLoading}
          onClose={closeInvoice}
          title={viewingInvoice ? `${BILLING_PAGE.detail.title} — ${viewingInvoice.invoice_number}` : BILLING_PAGE.detail.title}
        >
          <div className="px-4 py-4">
            {isDetailLoading || !viewingInvoice ? (
              <Spinner />
            ) : (
              <Div type="col" gap="lg">
                <Div type="row" gap="sm" className="items-center justify-between">
                  <Badge variant={INVOICE_STATUS_BADGE[viewingInvoice.status]}>{viewingInvoice.status}</Badge>
                  <P color="muted">{schoolNameById.get(viewingInvoice.school_id) ?? viewingInvoice.school_id.slice(0, 8)}</P>
                </Div>

                <Div type="col" gap="sm">
                  <P color="muted">{BILLING_PAGE.detail.lineItems}</P>
                  <Table>
                    <TableHead>
                      <TableHeadRow>
                        <TableHeaderCell>Description</TableHeaderCell>
                        <TableHeaderCell>Qty</TableHeaderCell>
                        <TableHeaderCell>Amount</TableHeaderCell>
                      </TableHeadRow>
                    </TableHead>
                    <TableBody>
                      {viewingInvoice.line_items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell primary>{item.description}</TableCell>
                          <TableCell>{item.quantity}</TableCell>
                          <TableCell>₹{item.amount}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Div>

                <Div type="col" gap="xs">
                  <Div type="row" className="justify-between">
                    <P>{BILLING_PAGE.detail.total}</P>
                    <P>₹{viewingInvoice.total_amount}</P>
                  </Div>
                  <Div type="row" className="justify-between">
                    <P color="muted">{BILLING_PAGE.detail.amountPaid}</P>
                    <P>₹{viewingInvoice.amount_paid}</P>
                  </Div>
                  <Div type="row" className="justify-between">
                    <P>{BILLING_PAGE.detail.balanceDue}</P>
                    <P>₹{(Number(viewingInvoice.total_amount) - Number(viewingInvoice.amount_paid)).toFixed(2)}</P>
                  </Div>
                </Div>

                {canAddItems(viewingInvoice) ? (
                  <Div type="col" gap="sm">
                    <P color="muted">{BILLING_PAGE.detail.addItem}</P>
                    <Div type="row" gap="sm" className="items-end">
                      <Input
                        placeholder={BILLING_PAGE.generateForm.itemDescription}
                        value={newItemDescription}
                        onChange={(e) => setNewItemDescription(e.target.value)}
                      />
                      <Input
                        type="number"
                        width="sm"
                        placeholder={BILLING_PAGE.generateForm.itemAmount}
                        value={newItemAmount}
                        onChange={(e) => setNewItemAmount(e.target.value)}
                      />
                      <Input
                        type="number"
                        width="xs"
                        placeholder={BILLING_PAGE.generateForm.itemQuantity}
                        value={newItemQty}
                        onChange={(e) => setNewItemQty(e.target.value)}
                      />
                      <Button type="button" size="sm" loading={isAddingItem} onClick={handleAddItem}>
                        {BILLING_PAGE.detail.addItemSubmit}
                      </Button>
                    </Div>
                  </Div>
                ) : (
                  <P color="muted" className="text-xs">{BILLING_PAGE.detail.finalNotice}</P>
                )}
              </Div>
            )}
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button type="button" variant="outline" onClick={closeInvoice}>{BILLING_PAGE.detail.close}</Button>
          </div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
