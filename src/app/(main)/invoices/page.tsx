'use client';

import { useMemo, useState } from 'react';
import { INVOICES_PAGE, INVOICE_STATUS_BADGE, PAYMENT_METHOD_FORM_OPTIONS } from '@/constants';
import { useInvoices } from '@/hooks/useInvoices';
import type { Invoice, PaymentMethod } from '@/types';
import {
  Div, P, Button, Input,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow, TablePagination,
  Badge, Spinner,
  PageHeader, PageCol,
  FormField, ResponsiveSelect,
  ResponsiveModalContainer,
} from '@/components/ui';

function fmtDate(v?: string | null): string {
  return v ? new Date(v).toLocaleDateString() : '—';
}

const PROOF_REQUIRED_METHODS: PaymentMethod[] = ['QR_CODE', 'BANK_TRANSFER'];

export default function InvoicesPage() {
  const {
    invoices, pagination, isLoading,
    viewingInvoice, isDetailLoading, openInvoice, closeInvoice,
    isDownloading, downloadPdf,
    showPayModal, openPayModal, closePayModal, isPaying,
    submitManualPayment, payWithRazorpay,
  } = useInvoices();

  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState('');
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [notes, setNotes] = useState('');

  const balanceDue = useMemo(() => {
    if (!viewingInvoice) return '0.00';
    return (Number(viewingInvoice.total_amount) - Number(viewingInvoice.amount_paid)).toFixed(2);
  }, [viewingInvoice]);

  function handleOpenPayModal() {
    setMethod('CASH');
    setAmount(balanceDue);
    setProofFile(null);
    setNotes('');
    openPayModal();
  }

  function handlePaySubmit() {
    if (method === 'RAZORPAY') {
      payWithRazorpay();
      return;
    }
    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) return;
    submitManualPayment(method, numericAmount, proofFile, notes || undefined);
  }

  return (
    <PageCol>
      <PageHeader title={INVOICES_PAGE.title} subtitle={INVOICES_PAGE.description} />

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>{INVOICES_PAGE.table.number}</TableHeaderCell>
            <TableHeaderCell>{INVOICES_PAGE.table.period}</TableHeaderCell>
            <TableHeaderCell>{INVOICES_PAGE.table.total}</TableHeaderCell>
            <TableHeaderCell>{INVOICES_PAGE.table.paid}</TableHeaderCell>
            <TableHeaderCell>{INVOICES_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{INVOICES_PAGE.table.dueDate}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={6}><Spinner /></TableEmptyRow>
          ) : invoices.length === 0 ? (
            <TableEmptyRow colSpan={6}>{INVOICES_PAGE.empty}</TableEmptyRow>
          ) : (
            invoices.map((invoice: Invoice) => (
              <TableRow key={invoice.id} onClick={() => openInvoice(invoice.id)} className="cursor-pointer">
                <TableCell primary>{invoice.invoice_number}</TableCell>
                <TableCell>
                  {fmtDate(invoice.billing_period_start)} – {fmtDate(invoice.billing_period_end)}
                </TableCell>
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

      {(viewingInvoice || isDetailLoading) && (
        <ResponsiveModalContainer
          isOpen={!!viewingInvoice || isDetailLoading}
          onClose={closeInvoice}
          title={viewingInvoice ? `${INVOICES_PAGE.detail.title} — ${viewingInvoice.invoice_number}` : INVOICES_PAGE.detail.title}
        >
          <div className="px-4 py-4">
            {isDetailLoading || !viewingInvoice ? (
              <Spinner />
            ) : (
              <Div type="col" gap="lg">
                <Div type="row" gap="sm" className="items-center justify-between">
                  <Badge variant={INVOICE_STATUS_BADGE[viewingInvoice.status]}>{viewingInvoice.status}</Badge>
                  <P color="muted">Due {fmtDate(viewingInvoice.due_date)}</P>
                </Div>

                <Div type="col" gap="sm">
                  <P color="muted">{INVOICES_PAGE.detail.lineItems}</P>
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
                    <P color="muted">{INVOICES_PAGE.detail.subtotal}</P>
                    <P>₹{viewingInvoice.subtotal}</P>
                  </Div>
                  {Number(viewingInvoice.tax_amount) > 0 && (
                    <Div type="row" className="justify-between">
                      <P color="muted">{INVOICES_PAGE.detail.tax}</P>
                      <P>₹{viewingInvoice.tax_amount}</P>
                    </Div>
                  )}
                  {Number(viewingInvoice.discount_amount) > 0 && (
                    <Div type="row" className="justify-between">
                      <P color="muted">{INVOICES_PAGE.detail.discount}</P>
                      <P>-₹{viewingInvoice.discount_amount}</P>
                    </Div>
                  )}
                  <Div type="row" className="justify-between">
                    <P>{INVOICES_PAGE.detail.total}</P>
                    <P>₹{viewingInvoice.total_amount}</P>
                  </Div>
                  <Div type="row" className="justify-between">
                    <P color="muted">{INVOICES_PAGE.detail.amountPaid}</P>
                    <P>₹{viewingInvoice.amount_paid}</P>
                  </Div>
                  <Div type="row" className="justify-between">
                    <P>{INVOICES_PAGE.detail.balanceDue}</P>
                    <P>₹{balanceDue}</P>
                  </Div>
                </Div>
              </Div>
            )}
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button type="button" variant="outline" onClick={closeInvoice}>{INVOICES_PAGE.detail.close}</Button>
            {viewingInvoice && (
              <Button
                type="button"
                variant="outline"
                loading={isDownloading}
                onClick={() => downloadPdf(viewingInvoice.id)}
              >
                {INVOICES_PAGE.detail.downloadPdf}
              </Button>
            )}
            {viewingInvoice && Number(balanceDue) > 0 && viewingInvoice.status !== 'VOID' && (
              <Button type="button" onClick={handleOpenPayModal}>{INVOICES_PAGE.detail.payNow}</Button>
            )}
          </div>
        </ResponsiveModalContainer>
      )}

      {showPayModal && viewingInvoice && (
        <ResponsiveModalContainer isOpen={showPayModal} onClose={closePayModal} title={INVOICES_PAGE.payForm.title}>
          <div className="px-4 py-4">
            <Div type="col" gap="md">
              <FormField label={INVOICES_PAGE.payForm.method}>
                <ResponsiveSelect
                  value={method}
                  onChange={(e) => setMethod(e.target.value as PaymentMethod)}
                  options={PAYMENT_METHOD_FORM_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
                />
              </FormField>

              {method !== 'RAZORPAY' && (
                <>
                  <FormField label={INVOICES_PAGE.payForm.amount}>
                    <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
                  </FormField>
                  <FormField
                    label={INVOICES_PAGE.payForm.proof}
                    hint={PROOF_REQUIRED_METHODS.includes(method) ? INVOICES_PAGE.payForm.proofHint : undefined}
                  >
                    <Input type="file" accept="image/*,application/pdf" onChange={(e) => setProofFile(e.target.files?.[0] ?? null)} />
                  </FormField>
                  <FormField label={INVOICES_PAGE.payForm.notes}>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} />
                  </FormField>
                </>
              )}

              {method === 'RAZORPAY' && (
                <P color="muted">{`₹${balanceDue} will be collected via Razorpay Checkout.`}</P>
              )}
            </Div>
          </div>
          <div className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
            <Button type="button" variant="outline" onClick={closePayModal}>{INVOICES_PAGE.payForm.cancel}</Button>
            <Button type="button" loading={isPaying} onClick={handlePaySubmit}>
              {method === 'RAZORPAY' ? INVOICES_PAGE.payForm.payWithRazorpay : INVOICES_PAGE.payForm.submit}
            </Button>
          </div>
        </ResponsiveModalContainer>
      )}
    </PageCol>
  );
}
