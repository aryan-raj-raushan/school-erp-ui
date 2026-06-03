"use client";

import { useFeeGenerate } from "@/hooks/useFees";
import { FEE_GENERATE_PAGE, FEE_STATUS_BADGE, PAYMENT_MODE_OPTIONS } from "@/constants";
import {
  Div, H1, P, Button, Select, Input,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  Badge, Spinner, Modal, FormField, FilterLabel, MiniStat, Icon,
} from "@/components/ui";
import { Plus, Trash2, CreditCard } from "lucide-react";

export default function FeeGeneratePage() {
  const {
    years, selectedAcademicYearId, setSelectedAcademicYearId,
    classes, sections, feeTypes, students, receipts,
    selectedClassId, selectedSectionId, selectedStudentId, setSelectedStudentId,
    handleClassChange, setSelectedSectionId,
    isLoading, isSaving,
    showModal, setShowModal,
    showPaymentModal, setShowPaymentModal,
    form, fields, append, remove,
    paymentForm,
    openGenerateModal, setFeeTypeName,
    handleGenerate, openPaymentModal, handlePayment,
  } = useFeeGenerate();

  const { register, handleSubmit, formState: { errors }, watch, setValue } = form;
  const { register: pReg, handleSubmit: pSubmit, formState: { errors: pErrors } } = paymentForm;

  const totalAmount = (watch('fee_items') ?? []).reduce(
    (sum, item) => sum + (Number(item.amount) || 0), 0,
  );
  const pendingCount = receipts.filter((r) => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(r.status)).length;
  const paidCount = receipts.filter((r) => r.status === 'PAID').length;

  return (
    <Div type="col" gap="lg">
      <Div type="row" justify="between" align="center">
        <H1>{FEE_GENERATE_PAGE.title}</H1>
        {selectedSectionId && (
          <Button onClick={() => { setSelectedStudentId(''); openGenerateModal(); }}>
            <Icon icon={Plus} type="btn-icon" />
            {FEE_GENERATE_PAGE.generateButton}
          </Button>
        )}
      </Div>

      {/* Filters */}
      <Div variant="card" padding="p-4">
        <Div type="grid" cols={4} gap="md">
          <Div type="col" gap="xs">
            <FilterLabel>Academic Year</FilterLabel>
            <Select value={selectedAcademicYearId} onChange={(e) => setSelectedAcademicYearId(e.target.value)}>
              <option value="">Select year</option>
              {years.map((y) => <option key={y.id} value={y.id}>{y.name}{y.is_current ? ' (Current)' : ''}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Class</FilterLabel>
            <Select value={selectedClassId} onChange={(e) => handleClassChange(e.target.value)} disabled={!selectedAcademicYearId}>
              <option value="">Select class</option>
              {classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Section</FilterLabel>
            <Select value={selectedSectionId} onChange={(e) => setSelectedSectionId(e.target.value)} disabled={!selectedClassId}>
              <option value="">Select section</option>
              {sections.map((s) => <option key={s.id} value={s.id}>Section {s.name}</option>)}
            </Select>
          </Div>
          <Div type="col" gap="xs">
            <FilterLabel>Student</FilterLabel>
            <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)} disabled={!selectedSectionId}>
              <option value="">All students</option>
              {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name ?? ''}</option>)}
            </Select>
          </Div>
        </Div>
      </Div>

      {selectedSectionId && (
        <Div type="row" gap="sm">
          <MiniStat label="Total Records" value={receipts.length} />
          <MiniStat label="Pending / Overdue" value={pendingCount} color={pendingCount > 0 ? "yellow" : "default"} />
          <MiniStat label="Paid" value={paidCount} color="green" />
        </Div>
      )}

      <Table>
        <TableHead>
          <TableHeadRow>
            <TableHeaderCell>#</TableHeaderCell>
            <TableHeaderCell>{FEE_GENERATE_PAGE.table.student}</TableHeaderCell>
            <TableHeaderCell>{FEE_GENERATE_PAGE.table.total}</TableHeaderCell>
            <TableHeaderCell>Paid</TableHeaderCell>
            <TableHeaderCell>Balance</TableHeaderCell>
            <TableHeaderCell>{FEE_GENERATE_PAGE.table.status}</TableHeaderCell>
            <TableHeaderCell>{FEE_GENERATE_PAGE.table.dueDate}</TableHeaderCell>
            <TableHeaderCell>{FEE_GENERATE_PAGE.table.actions}</TableHeaderCell>
          </TableHeadRow>
        </TableHead>
        <TableBody>
          {isLoading ? (
            <TableEmptyRow colSpan={8}><Spinner /></TableEmptyRow>
          ) : !selectedSectionId ? (
            <TableEmptyRow colSpan={8}>{FEE_GENERATE_PAGE.empty}</TableEmptyRow>
          ) : receipts.length === 0 ? (
            <TableEmptyRow colSpan={8}>{FEE_GENERATE_PAGE.noRecords}</TableEmptyRow>
          ) : (
            receipts.map((r, i) => {
              const student = students.find((s) => s.id === r.student_id);
              return (
                <TableRow key={r.id} variant={r.status === 'OVERDUE' ? 'danger' : undefined}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{student ? `${student.first_name} ${student.last_name ?? ''}` : '—'}</TableCell>
                  <TableCell>₹{r.total_amount.toLocaleString()}</TableCell>
                  <TableCell><P color="green">₹{r.paid_amount.toLocaleString()}</P></TableCell>
                  <TableCell><P color={r.balance_amount > 0 ? "red" : "green"}>₹{r.balance_amount.toLocaleString()}</P></TableCell>
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
              );
            })
          )}
        </TableBody>
      </Table>

      {/* Generate Fee Modal */}
      {showModal && (
        <Modal title={FEE_GENERATE_PAGE.form.title} onClose={() => setShowModal(false)} size="lg">
          <form onSubmit={handleSubmit(handleGenerate)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={FEE_GENERATE_PAGE.form.student}>
                <Select value={selectedStudentId} onChange={(e) => setSelectedStudentId(e.target.value)}>
                  <option value="">Select student</option>
                  {students.map((s) => <option key={s.id} value={s.id}>{s.first_name} {s.last_name ?? ''}</option>)}
                </Select>
              </FormField>

              <Div type="col" gap="sm">
                <Div type="row" justify="between" align="center">
                  <P color="default" weight="medium">{FEE_GENERATE_PAGE.form.feeItems}</P>
                  <Button type="button" size="sm" variant="outline"
                    onClick={() => append({ fee_type_id: '', fee_type_name: '', amount: '' })}>
                    <Icon icon={Plus} type="sm-inline" />{FEE_GENERATE_PAGE.form.addItem}
                  </Button>
                </Div>
                {fields.map((field, index) => (
                  <Div key={field.id} variant="inset" type="row" gap="sm" align="center">
                    <Div grow>
                      <Select
                        value={form.watch(`fee_items.${index}.fee_type_id`)}
                        onChange={(e) => {
                          setValue(`fee_items.${index}.fee_type_id`, e.target.value);
                          setFeeTypeName(index, e.target.value);
                        }}
                      >
                        <option value="">Select fee type</option>
                        {feeTypes.map((ft) => <option key={ft.id} value={ft.id}>{ft.name}</option>)}
                      </Select>
                    </Div>
                    <Input type="number" width="sm" placeholder="₹ Amount" {...register(`fee_items.${index}.amount`)} />
                    {fields.length > 1 && (
                      <Button type="button" size="sm" variant="ghost" onClick={() => remove(index)}>
                        <Icon icon={Trash2} type="sm-danger" />
                      </Button>
                    )}
                  </Div>
                ))}
                {totalAmount > 0 && <P color="default" weight="semibold">Total: ₹{totalAmount.toLocaleString()}</P>}
              </Div>

              <Div type="grid" cols={2} gap="md">
                <FormField label={FEE_GENERATE_PAGE.form.discount}>
                  <Input type="number" {...register('discount_amount')} placeholder="0" />
                </FormField>
                <FormField label={FEE_GENERATE_PAGE.form.dueDate}>
                  <Input type="date" {...register('due_date')} />
                </FormField>
              </Div>
              <FormField label={FEE_GENERATE_PAGE.form.notes}>
                <Input {...register('notes')} placeholder="Optional notes" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>{FEE_GENERATE_PAGE.form.cancel}</Button>
                <Button type="submit" loading={isSaving}>{FEE_GENERATE_PAGE.form.submit}</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <Modal title={FEE_GENERATE_PAGE.payment.title} onClose={() => setShowPaymentModal(false)}>
          <form onSubmit={pSubmit(handlePayment)}>
            <Div type="col" gap="md" padding="px-6 py-5">
              <FormField label={FEE_GENERATE_PAGE.payment.amount} error={pErrors.amount?.message}>
                <Input type="number" {...pReg('amount')} placeholder="Enter amount" />
              </FormField>
              <FormField label={FEE_GENERATE_PAGE.payment.mode} error={pErrors.payment_mode?.message}>
                <Select {...pReg('payment_mode')}>
                  {PAYMENT_MODE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </Select>
              </FormField>
              <FormField label={FEE_GENERATE_PAGE.payment.transactionId}>
                <Input {...pReg('transaction_id')} placeholder="Optional transaction ID" />
              </FormField>
              <FormField label={FEE_GENERATE_PAGE.payment.notes}>
                <Input {...pReg('notes')} placeholder="Optional notes" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowPaymentModal(false)}>{FEE_GENERATE_PAGE.payment.cancel}</Button>
                <Button type="submit" loading={isSaving}>{FEE_GENERATE_PAGE.payment.submit}</Button>
              </Div>
            </Div>
          </form>
        </Modal>
      )}
    </Div>
  );
}
