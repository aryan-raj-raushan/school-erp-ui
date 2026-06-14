'use client';

import {
  Printer, AlertTriangle, CreditCard, Users, FilePlus, LayoutGrid, FileText,
  Plus, User, Phone, Mail, BookOpen, Hash, Trash2, ChevronDown, ChevronRight, Zap, Tag,
} from 'lucide-react';
import { PageHeader } from '@/components/ui/page-header';
import {
  Div, P, Span, Button, Badge, Spinner, Label,
  Table, TableHead, TableHeadRow, TableHeaderCell, TableBody, TableRow, TableCell, TableEmptyRow,
  FormField, Select, Input,
  FormCard, SectionCard, WarnBanner,
} from '@/components/ui';
import { Tabs } from '@/components/ui/tabs';
import { Modal, ModalBody, ModalFooter } from '@/components/ui/modal';
import { useFeesPayments } from '@/hooks/useFeesPayments';
import { useFeesSetup } from '@/hooks/useFeesSetup';
import type { PaymentMode } from '@/services/fees.service';
import {
  FEE_PAYMENTS_TABS, FEE_BILL_STATUS_COLORS,
  buildMonthYearOpts, monthValueToLabel, billBalanceDue,
} from '@/constants/fee-payments.constants';

export default function FeePaymentsPage() {
  const {
    tab, setTab,
    studentFilter,
    selectedStudentId,
    payingBill, setPayingBill,
    payForm, setPayForm,
    addFeeModal, setAddFeeModal,
    addFeeForm, setAddFeeForm,
    monthlyFilter, setMonthlyFilter,
    payingDue, setPayingDue,
    createForm, setCreateForm,
    createClassId,
    structFilter, setStructFilter,
    receiptFilter, setReceiptFilter,
    discountForm, setDiscountForm,
    extraForm, setExtraForm,
    confirmDiscount, setConfirmDiscount,
    confirmExtra, setConfirmExtra,
    openPayBillModal, openPayDueModal, closePayModal, openAddFeeModal,
    handleSessionChange, handleClassChange, handleStudentChange,
    handleCreateSessionChange, handleCreateClassChange,
    handlePayBill, handleAddFee, handleMonthlyPay, handleCreateBill,
    handleBulkDiscount, handleBulkExtra,
    classStudents, loadingClassStudents,
    selectedStudent, studentParents,
    studentStructure, loadingStudentStructure,
    fetchStudentData, clearStudentSelection,
    generatingBills, generateStudentBills,
    billPaymentsMap, expandedBillId, loadingPaymentsFor,
    toggleBillPayments, deleteBillPayment,
    studentBills, loadingStudentBills,
    financeAccounts,
    monthlyDues, loadingMonthlyDues, fetchMonthlyDues,
    structureView, loadingStructureView, fetchStructureView,
    feePlans,
    allFeeTypes,
    demandReceipts, loadingDemandReceipt, fetchDemandReceipt,
    createStudents, loadingCreateStudents,
    regularPlanId, classFeeTypes,
    PAYMENT_MODES,
  } = useFeesPayments();

  const { academicYears, classes } = useFeesSetup();

  return (
    <Div type="col" gap="lg">
      <PageHeader title="Fee Payments" subtitle="Student payments, bulk operations, and demand receipts" />
      <Tabs options={FEE_PAYMENTS_TABS} value={tab} onChange={(v) => setTab(v as typeof tab)} />

      {/* ─── Student Payment ──────────────────────────────────────────────── */}
      {tab === 'student' && (
        <Div type="col" gap="lg">
          <FormCard title="Search Class Fee Payment">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-3">
              <FormField label="Session" required>
                <Select value={studentFilter.academic_year_id}
                  onChange={e => handleSessionChange(e.target.value)}>
                  <option value="">Select Session</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>
                      {y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class" required>
                <Select value={studentFilter.class_id}
                  onChange={e => handleClassChange(e.target.value)}>
                  <option value="">Select Class</option>
                  {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
                </Select>
              </FormField>
              <FormField label="Student" required>
                <Select value={selectedStudentId}
                  disabled={!studentFilter.class_id || loadingClassStudents}
                  onChange={e => handleStudentChange(e.target.value, studentFilter.academic_year_id, regularPlanId, studentFilter.class_id)}>
                  <option value="">
                    {loadingClassStudents ? 'Loading students…' : studentFilter.class_id ? `Select Student (${classStudents.length})` : 'Select class first'}
                  </option>
                  {classStudents.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.first_name}{s.last_name ? ` ${s.last_name}` : ''} [{s.admission_number}]
                    </option>
                  ))}
                </Select>
              </FormField>
            </Div>
          </FormCard>

          {(loadingStudentBills || loadingStudentStructure) && (
            <Div type="row" justify="center" padding="py-10"><Spinner /></Div>
          )}

          {selectedStudent && !loadingStudentBills && (() => {
            const father = studentParents.find(p => p.relation === 'FATHER') ?? studentParents[0] ?? null;
            return (
              <SectionCard
                title={<>{selectedStudent.first_name}{selectedStudent.last_name ? ` ${selectedStudent.last_name}` : ''}</>}
                subtitle={father ? `Father: ${father.first_name}${father.last_name ? ` ${father.last_name}` : ''}` : undefined}
              >
                <Div type="grid" cols={2} className="gap-px bg-border/30 sm:grid-cols-3 lg:grid-cols-6">
                  {([
                    { icon: Hash,     label: 'Reg ID',  value: selectedStudent.admission_number },
                    { icon: BookOpen, label: 'Roll No', value: selectedStudent.roll_number ?? 'N/A' },
                    { icon: Phone,    label: 'Phone',   value: selectedStudent.phone_number ?? father?.phone_number ?? 'N/A' },
                    { icon: Mail,     label: 'Email',   value: selectedStudent.email ?? father?.email ?? 'N/A' },
                    { icon: User,     label: 'Gender',  value: selectedStudent.gender ?? 'N/A' },
                    { icon: BookOpen, label: 'Status',  value: selectedStudent.status },
                  ] as const).map(({ icon: Icon, label, value }) => (
                    <Div key={label} type="row" align="center" gap="sm" className="bg-card px-4 py-3">
                      <Icon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                      <Div className="min-w-0">
                        <P size="xs" className="uppercase tracking-wide">{label}</P>
                        <P size="xs" color="default" weight="medium" className="truncate">{value}</P>
                      </Div>
                    </Div>
                  ))}
                </Div>
              </SectionCard>
            );
          })()}

          {selectedStudent && !loadingStudentStructure && studentStructure.length > 0 && (
            <SectionCard
              title={`${(classes as any[]).find(c => c.id === studentFilter.class_id)?.name ?? (classes as any[]).find(c => c.id === studentFilter.class_id)?.class_name ?? ''} Class Fee Structure`}
              subtitle={`${studentStructure.length} fee types`}
            >
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wide bg-muted/10">
                    <th className="px-5 py-2.5 text-left">Name</th>
                    <th className="px-5 py-2.5 text-left">Fee Type</th>
                    <th className="px-5 py-2.5 text-left">Schedule</th>
                    <th className="px-5 py-2.5 text-right">Fee Amount</th>
                    <th className="px-5 py-2.5 text-right">Total Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {studentStructure.map(s => {
                    const months = s.frequency === 'Monthly' ? (s.applicable_months?.length ?? 1) : 1;
                    const lineTotal = parseFloat(s.amount ?? '0') * months;
                    return (
                      <tr key={s.fee_type_id} className="border-b border-border/20 hover:bg-muted/10">
                        <td className="px-5 py-3 font-medium text-foreground">{s.fee_type_name}</td>
                        <td className="px-5 py-3 text-muted-foreground">{s.frequency}</td>
                        <td className="px-5 py-3 text-xs text-muted-foreground max-w-xs truncate">
                          {s.frequency === 'Monthly' ? (s.applicable_months?.join(', ') ?? '—') : 'Only Once'}
                        </td>
                        <td className="px-5 py-3 text-right text-foreground">₹{parseFloat(s.amount ?? '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                        <td className="px-5 py-3 text-right font-medium text-foreground">
                          × {months} = ₹{lineTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-muted/20 border-t border-border/40">
                    <td colSpan={4} className="px-5 py-3 text-sm font-semibold text-right text-foreground">Total Due Fee Amount</td>
                    <td className="px-5 py-3 text-right font-bold text-primary">
                      ₹{studentStructure.reduce((sum, s) => {
                        const months = s.frequency === 'Monthly' ? (s.applicable_months?.length ?? 1) : 1;
                        return sum + parseFloat(s.amount ?? '0') * months;
                      }, 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </SectionCard>
          )}

          {selectedStudent && !loadingStudentBills && (studentBills.length > 0 || studentStructure.length > 0) && (
            <SectionCard
              title={<>{selectedStudent.first_name}{selectedStudent.last_name ? ` ${selectedStudent.last_name}` : ''} — Fee Payment Details</>}
              subtitle={<>
                {studentBills.length} bill{studentBills.length !== 1 ? 's' : ''} ·{' '}Total due:{' '}
                <Span color="danger" className="font-medium">
                  ₹{studentBills.reduce((sum, b) => sum + billBalanceDue(b), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </Span>
              </>}
              actions={<>
                {studentStructure.length > 0 && (
                  <Button size="sm" variant="outline"
                    onClick={() => generateStudentBills(
                      { student_id: selectedStudent.id, academic_year_id: studentFilter.academic_year_id, fee_plan_id: regularPlanId, class_id: studentFilter.class_id },
                      () => fetchStudentData(selectedStudent, studentFilter.academic_year_id, regularPlanId, studentFilter.class_id),
                    )}
                    disabled={generatingBills || !regularPlanId}
                  >
                    {generatingBills ? <Spinner /> : <><Zap className="w-3.5 h-3.5 mr-1" />Generate Bills</>}
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={openAddFeeModal}>
                  <Plus className="w-3.5 h-3.5 mr-1" /> Add Fee
                </Button>
              </>}
            >
              {studentBills.length === 0 && (
                <Div type="col" align="center" center gap="sm" padding="p-8">
                  <Zap className="w-7 h-7 text-primary/50" />
                  <P color="default" weight="medium">No bills generated yet</P>
                  <P size="xs">Fee structure is configured. Click "Generate Bills" above to create them.</P>
                </Div>
              )}
              {studentBills.length > 0 && (
                <Div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wide bg-muted/10">
                        <th className="px-4 py-2.5 w-8"></th>
                        <th className="px-4 py-2.5 text-left">Fee Type</th>
                        <th className="px-4 py-2.5 text-left">Frequency</th>
                        <th className="px-4 py-2.5 text-left">Month / Year</th>
                        <th className="px-4 py-2.5 text-left">Due Date</th>
                        <th className="px-4 py-2.5 text-left">Status</th>
                        <th className="px-4 py-2.5 text-right">Total</th>
                        <th className="px-4 py-2.5 text-right">Paid</th>
                        <th className="px-4 py-2.5 text-right">Discount</th>
                        <th className="px-4 py-2.5 text-right">Due</th>
                        <th className="px-4 py-2.5 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentBills.map(b => {
                        const due = billBalanceDue(b);
                        const isExpanded = expandedBillId === b.id;
                        const payments = billPaymentsMap[b.id] ?? [];
                        return (
                          <>
                            <tr key={b.id} className="border-b border-border/20 hover:bg-muted/10">
                              <td className="px-2 py-3 text-center">
                                <Button variant="ghost" size="icon-sm" onClick={() => toggleBillPayments(b.id)} title="View payment history">
                                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                                </Button>
                              </td>
                              <td className="px-4 py-3 font-medium text-foreground">{b.fee_type_name}</td>
                              <td className="px-4 py-3 text-muted-foreground">{b.frequency}</td>
                              <td className="px-4 py-3 text-muted-foreground">{b.bill_month ?? '—'}</td>
                              <td className="px-4 py-3 text-muted-foreground">{b.due_date ?? '—'}</td>
                              <td className="px-4 py-3">
                                <Badge variant={FEE_BILL_STATUS_COLORS[b.status] ?? 'default'}>{b.status}</Badge>
                              </td>
                              <td className="px-4 py-3 text-right text-foreground">₹{parseFloat(b.total_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-right text-foreground">₹{parseFloat(b.paid_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className="px-4 py-3 text-right text-muted-foreground">₹{parseFloat(b.discount_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                              <td className={`px-4 py-3 text-right font-semibold ${due > 0 ? 'text-destructive' : 'text-muted-foreground'}`}>
                                ₹{due.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                              </td>
                              <td className="px-4 py-3 text-center">
                                {b.status !== 'PAID' && b.status !== 'WAIVED' && due > 0 && (
                                  <Button size="sm" onClick={() => openPayBillModal(b, due)}>
                                    <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay
                                  </Button>
                                )}
                              </td>
                            </tr>
                            {isExpanded && (
                              <tr key={`${b.id}-payments`} className="bg-muted/5">
                                <td colSpan={11} className="px-6 py-3">
                                  {loadingPaymentsFor === b.id ? (
                                    <Div type="row" align="center" gap="sm"><Spinner /><P size="xs">Loading payments…</P></Div>
                                  ) : payments.length === 0 ? (
                                    <P size="xs">No payments recorded for this bill.</P>
                                  ) : (
                                    <Div className="rounded-lg border border-border/40 overflow-hidden">
                                      <table className="w-full text-xs">
                                        <thead>
                                          <tr className="bg-muted/20 text-muted-foreground uppercase tracking-wide">
                                            <th className="px-3 py-2 text-left">Date</th>
                                            <th className="px-3 py-2 text-left">Mode</th>
                                            <th className="px-3 py-2 text-left">Txn ID</th>
                                            <th className="px-3 py-2 text-left">Remarks</th>
                                            <th className="px-3 py-2 text-right">Amount</th>
                                            <th className="px-3 py-2 text-center">Delete</th>
                                          </tr>
                                        </thead>
                                        <tbody>
                                          {payments.map(p => (
                                            <tr key={p.id} className="border-t border-border/20 hover:bg-muted/10">
                                              <td className="px-3 py-2">{p.payment_date}</td>
                                              <td className="px-3 py-2">{p.payment_mode}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{p.transaction_id ?? '—'}</td>
                                              <td className="px-3 py-2 text-muted-foreground">{p.remarks ?? '—'}</td>
                                              <td className="px-3 py-2 text-right font-medium text-success">₹{parseFloat(p.amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                              <td className="px-3 py-2 text-center">
                                                <Button
                                                  variant="ghost"
                                                  size="icon-sm"
                                                  onClick={() => deleteBillPayment(p.id, b.id, () => fetchStudentData(selectedStudent, studentFilter.academic_year_id, regularPlanId, studentFilter.class_id))}
                                                  className="text-destructive hover:text-destructive/80"
                                                  title="Delete this payment"
                                                >
                                                  <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                              </td>
                                            </tr>
                                          ))}
                                        </tbody>
                                      </table>
                                    </Div>
                                  )}
                                </td>
                              </tr>
                            )}
                          </>
                        );
                      })}
                    </tbody>
                  </table>
                </Div>
              )}
            </SectionCard>
          )}

          {selectedStudent && !loadingStudentBills && studentBills.length === 0 && studentStructure.length === 0 && (
            <Div variant="card-dashed">
              <P>No fee structure configured for this class. Go to Fee Setup → Class Fee Structure first.</P>
            </Div>
          )}

          {!selectedStudent && !loadingClassStudents && studentFilter.class_id && (
            <Div variant="card-dashed">
              <P>Select a student from the dropdown above to view their fee details.</P>
            </Div>
          )}
        </Div>
      )}

      {/* ─── Monthly Payment ──────────────────────────────────────────────── */}
      {tab === 'monthly' && (
        <Div type="col" gap="lg">
          <FormCard title="Monthly Dues by Class">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-3">
              <FormField label="Academic Year" required>
                <Select value={monthlyFilter.academic_year_id} onChange={e => setMonthlyFilter(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Academic Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class" required>
                <Select value={monthlyFilter.class_id} onChange={e => setMonthlyFilter(f => ({ ...f, class_id: e.target.value }))}>
                  <option value="">Select Class</option>
                  {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
                </Select>
              </FormField>
              <FormField label="Month" required>
                <Select value={monthlyFilter.month} onChange={e => setMonthlyFilter(f => ({ ...f, month: e.target.value }))}>
                  <option value="">Select Month</option>
                  {buildMonthYearOpts(monthlyFilter.academic_year_id, academicYears as any[]).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormField>
            </Div>
            <Div type="row" justify="end" padding="mt-4">
              <Button
                onClick={() => fetchMonthlyDues(monthlyFilter)}
                disabled={!monthlyFilter.academic_year_id || !monthlyFilter.class_id || !monthlyFilter.month || loadingMonthlyDues}
              >
                {loadingMonthlyDues ? <Spinner /> : <><Users size={14} className="mr-1" />Load Dues</>}
              </Button>
            </Div>
          </FormCard>

          {loadingMonthlyDues && <Div type="row" justify="center" padding="py-12"><Spinner /></Div>}

          {!loadingMonthlyDues && monthlyDues.length > 0 && (
            <SectionCard
              title={`${monthValueToLabel(monthlyFilter.month)} ${(classes as any[]).find(c => c.id === monthlyFilter.class_id)?.name ?? (classes as any[]).find(c => c.id === monthlyFilter.class_id)?.class_name ?? ''} Class Fee Payment Details`}
              subtitle={`${monthlyDues.length} student${monthlyDues.length !== 1 ? 's' : ''} · ${(academicYears as any[]).find(y => y.id === monthlyFilter.academic_year_id)?.name ?? ''}`}
            >
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>Reg ID</TableHeaderCell>
                    <TableHeaderCell>Student Name</TableHeaderCell>
                    <TableHeaderCell>Father Name</TableHeaderCell>
                    <TableHeaderCell>Phone Number</TableHeaderCell>
                    <TableHeaderCell>Month Name</TableHeaderCell>
                    <TableHeaderCell>Due Amount</TableHeaderCell>
                    <TableHeaderCell>Pay Now</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {monthlyDues.map(d => (
                    <TableRow key={d.student_id}>
                      <TableCell>{d.admission_number ?? '—'}</TableCell>
                      <TableCell primary>{d.student_name}</TableCell>
                      <TableCell>{d.father_name ?? '—'}</TableCell>
                      <TableCell>{d.phone ?? '—'}</TableCell>
                      <TableCell>{monthValueToLabel(monthlyFilter.month)}</TableCell>
                      <TableCell>
                        <Span className={parseFloat(d.due_amount) > 0 ? 'font-semibold text-destructive' : 'text-muted-foreground'}>
                          ₹{parseFloat(d.due_amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                        </Span>
                      </TableCell>
                      <TableCell>
                        {parseFloat(d.due_amount) > 0 && (
                          <Button size="sm" onClick={() => openPayDueModal(d)}>
                            <CreditCard className="w-3.5 h-3.5 mr-1" /> Pay
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          )}

          {!loadingMonthlyDues && monthlyDues.length === 0 && monthlyFilter.month && (
            <Div variant="card-dashed">
              <P>No dues found for the selected class and month.</P>
            </Div>
          )}
        </Div>
      )}

      {/* ─── Create Bill ──────────────────────────────────────────────────── */}
      {tab === 'create' && (
        <FormCard title="Create Manual Fee Bill">
          <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2">
            <FormField label="Academic Year" required>
              <Select value={createForm.academic_year_id}
                onChange={e => handleCreateSessionChange(e.target.value)}>
                <option value="">Select Academic Year</option>
                {(academicYears as any[]).map(y => (
                  <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Class" required>
              <Select value={createClassId} disabled={!createForm.academic_year_id}
                onChange={e => handleCreateClassChange(e.target.value, createForm.academic_year_id)}>
                <option value="">Select Class</option>
                {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
              </Select>
            </FormField>
            <FormField label="Student" required>
              <Select value={createForm.student_id} disabled={!createClassId || loadingCreateStudents}
                onChange={e => setCreateForm(f => ({ ...f, student_id: e.target.value }))}>
                <option value="">
                  {loadingCreateStudents ? 'Loading…' : createClassId ? `Select Student (${createStudents.length})` : 'Select class first'}
                </option>
                {createStudents.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.first_name}{s.last_name ? ` ${s.last_name}` : ''} [{s.admission_number}]
                  </option>
                ))}
              </Select>
            </FormField>
            <FormField label="Fee Type" required>
              <Select value={createForm.fee_type_id} onChange={e => setCreateForm(f => ({ ...f, fee_type_id: e.target.value }))}>
                <option value="">Select Fee Type</option>
                {allFeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Fee Plan">
              <Select value={createForm.fee_plan_id} onChange={e => setCreateForm(f => ({ ...f, fee_plan_id: e.target.value }))}>
                <option value="">No specific plan</option>
                {feePlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </Select>
            </FormField>
            <FormField label="Amount (₹)" required>
              <Input type="number" value={createForm.total_amount} onChange={e => setCreateForm(f => ({ ...f, total_amount: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
            </FormField>
            <FormField label="Bill Month">
              <Select value={createForm.bill_month} disabled={!createForm.academic_year_id}
                onChange={e => setCreateForm(f => ({ ...f, bill_month: e.target.value }))}>
                <option value="">One-time / No month</option>
                {buildMonthYearOpts(createForm.academic_year_id, academicYears as any[]).map(o => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </Select>
            </FormField>
            <FormField label="Due Date">
              <Input type="date" value={createForm.due_date} onChange={e => setCreateForm(f => ({ ...f, due_date: e.target.value }))} />
            </FormField>
          </Div>
          <Div type="row" justify="end" padding="mt-5">
            <Button
              onClick={handleCreateBill}
              disabled={!createForm.student_id || !createForm.academic_year_id || !createForm.fee_type_id || !createForm.total_amount}
            >
              <FilePlus className="w-3.5 h-3.5 mr-1" /> Create Bill
            </Button>
          </Div>
        </FormCard>
      )}

      {/* ─── Structure View ───────────────────────────────────────────────── */}
      {tab === 'structure' && (
        <Div type="col" gap="lg">
          <FormCard title="View Class Fee Structure">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-3">
              <FormField label="Academic Year" required>
                <Select value={structFilter.academic_year_id} onChange={e => setStructFilter(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Academic Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Fee Plan" required>
                <Select value={structFilter.fee_plan_id} onChange={e => setStructFilter(f => ({ ...f, fee_plan_id: e.target.value }))}>
                  <option value="">Select Fee Plan</option>
                  {feePlans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Class" required>
                <Select value={structFilter.class_id} onChange={e => setStructFilter(f => ({ ...f, class_id: e.target.value }))}>
                  <option value="">Select Class</option>
                  {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
                </Select>
              </FormField>
            </Div>
            <Div type="row" justify="end" padding="mt-4">
              <Button
                onClick={() => fetchStructureView(structFilter)}
                disabled={!structFilter.academic_year_id || !structFilter.fee_plan_id || !structFilter.class_id || loadingStructureView}
              >
                {loadingStructureView ? <Spinner /> : <><LayoutGrid size={14} className="mr-1" />View Structure</>}
              </Button>
            </Div>
          </FormCard>

          {loadingStructureView && <Div type="row" justify="center" padding="py-12"><Spinner /></Div>}

          {!loadingStructureView && structureView.length > 0 && (
            <SectionCard
              title="Fee Structure"
              subtitle={`${structureView.length} fee type${structureView.length !== 1 ? 's' : ''} · Total ₹${structureView.reduce((sum, s) => sum + parseFloat(s.amount ?? '0'), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}
            >
              <Table>
                <TableHead>
                  <TableHeadRow>
                    <TableHeaderCell>#</TableHeaderCell>
                    <TableHeaderCell>Fee Type</TableHeaderCell>
                    <TableHeaderCell>Frequency</TableHeaderCell>
                    <TableHeaderCell>Months / Schedule</TableHeaderCell>
                    <TableHeaderCell className="text-right">Amount (₹)</TableHeaderCell>
                  </TableHeadRow>
                </TableHead>
                <TableBody>
                  {structureView.map((s, idx) => (
                    <TableRow key={s.fee_type_id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell primary>{s.fee_type_name}</TableCell>
                      <TableCell>{s.frequency}</TableCell>
                      <TableCell>{s.frequency === 'Monthly' ? (s.applicable_months?.join(', ') || '—') : 'One-time'}</TableCell>
                      <TableCell className="text-right font-medium text-foreground">
                        ₹{parseFloat(s.amount ?? '0').toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </SectionCard>
          )}

          {!loadingStructureView && structureView.length === 0 && structFilter.class_id && (
            <Div variant="card-dashed">
              <P>No fee structure found for this class. Configure it in Fee Setup → Class Fee Structure.</P>
            </Div>
          )}
        </Div>
      )}

      {/* ─── Demand Receipt ───────────────────────────────────────────────── */}
      {tab === 'receipt' && (
        <Div type="col" gap="lg">
          <FormCard title="Generate Demand Receipts">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2">
              <FormField label="Academic Year" required>
                <Select value={receiptFilter.academic_year_id} onChange={e => setReceiptFilter(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Academic Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class" required>
                <Select value={receiptFilter.class_id} onChange={e => setReceiptFilter(f => ({ ...f, class_id: e.target.value }))}>
                  <option value="">Select Class</option>
                  {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
                </Select>
              </FormField>
              <FormField label="Month From" required>
                <Input value={receiptFilter.month_from} onChange={e => setReceiptFilter(f => ({ ...f, month_from: e.target.value }))} placeholder="YYYY-MM e.g. 2026-04" />
              </FormField>
              <FormField label="Month To" required>
                <Input value={receiptFilter.month_to} onChange={e => setReceiptFilter(f => ({ ...f, month_to: e.target.value }))} placeholder="YYYY-MM e.g. 2026-09" />
              </FormField>
            </Div>
            <Div type="row" justify="end" gap="sm" padding="mt-4">
              {demandReceipts.length > 0 && (
                <Button variant="outline" size="sm" onClick={() => window.print()}>
                  <Printer className="w-3.5 h-3.5 mr-1" /> Print
                </Button>
              )}
              <Button
                onClick={() => fetchDemandReceipt(receiptFilter)}
                disabled={!receiptFilter.academic_year_id || !receiptFilter.class_id || !receiptFilter.month_from || !receiptFilter.month_to || loadingDemandReceipt}
              >
                {loadingDemandReceipt ? <Spinner /> : <><FileText size={14} className="mr-1" />Generate</>}
              </Button>
            </Div>
          </FormCard>

          {loadingDemandReceipt && <Div type="row" justify="center" padding="py-12"><Spinner /></Div>}

          {!loadingDemandReceipt && demandReceipts.length > 0 && (
            <Div type="col" gap="sm">
              {demandReceipts.map(s => (
                <SectionCard
                  key={s.student_id}
                  title={s.student_name}
                  subtitle={`Admission: ${s.admission_number ?? '—'} · Roll: ${s.roll_no ?? '—'}${s.father_name ? ` · Father: ${s.father_name}` : ''}`}
                  actions={
                    <Div className="text-right">
                      <P size="xs">Total Due</P>
                      <P size="lg" color="danger" weight="bold">₹{parseFloat(s.total_due).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</P>
                    </Div>
                  }
                >
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border/40 text-xs text-muted-foreground uppercase tracking-wide bg-muted/10">
                        <th className="px-5 py-2 text-left">Fee</th>
                        <th className="px-5 py-2 text-left">Month</th>
                        <th className="px-5 py-2 text-right">Total</th>
                        <th className="px-5 py-2 text-right">Paid</th>
                        <th className="px-5 py-2 text-right">Due</th>
                        <th className="px-5 py-2 text-left">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {s.bills.map((b, i) => (
                        <tr key={i} className="border-b border-border/20 hover:bg-muted/10">
                          <td className="px-5 py-2.5 font-medium text-foreground">{b.fee_type_name}</td>
                          <td className="px-5 py-2.5 text-muted-foreground">{b.bill_month ?? '—'}</td>
                          <td className="px-5 py-2.5 text-right text-muted-foreground">₹{b.total_amount}</td>
                          <td className="px-5 py-2.5 text-right text-muted-foreground">₹{b.paid_amount}</td>
                          <td className="px-5 py-2.5 text-right font-semibold text-destructive">₹{b.due_amount}</td>
                          <td className="px-5 py-2.5 text-muted-foreground">{b.due_date ?? '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </SectionCard>
              ))}
            </Div>
          )}
        </Div>
      )}

      {/* ─── Bulk Discount ────────────────────────────────────────────────── */}
      {tab === 'discount' && (
        <Div type="col" gap="lg">
          <WarnBanner>
            Bulk discount is irreversible. An audit record is created for each affected bill.
            Applied discount cannot be reversed — proceed with caution.
          </WarnBanner>
          <FormCard title="Apply Bulk Discount">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2">
              <FormField label="Academic Year" required>
                <Select value={discountForm.academic_year_id} onChange={e => setDiscountForm(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Academic Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class (leave blank = all classes)">
                <Select value={discountForm.class_id} onChange={e => setDiscountForm(f => ({ ...f, class_id: e.target.value }))}>
                  <option value="">All Classes</option>
                  {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
                </Select>
              </FormField>
              <FormField label="Fee Type" required>
                <Select value={discountForm.fee_type_id} onChange={e => setDiscountForm(f => ({ ...f, fee_type_id: e.target.value }))}>
                  <option value="">Select Fee Type</option>
                  {classFeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Discount Amount (₹)" required>
                <Input type="number" value={discountForm.discount_amount} onChange={e => setDiscountForm(f => ({ ...f, discount_amount: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
              </FormField>
              <Div className="sm:col-span-2">
                <FormField label="Reason (for audit trail)">
                  <Input value={discountForm.reason} onChange={e => setDiscountForm(f => ({ ...f, reason: e.target.value }))} placeholder="e.g. Annual scholarship discount" />
                </FormField>
              </Div>
            </Div>
            <Div type="row" justify="end" padding="mt-5">
              <Button
                variant="destructive"
                onClick={() => setConfirmDiscount(true)}
                disabled={!discountForm.academic_year_id || !discountForm.fee_type_id || !discountForm.discount_amount}
              >
                <Tag className="w-3.5 h-3.5 mr-1" /> Apply Bulk Discount
              </Button>
            </Div>
          </FormCard>
        </Div>
      )}

      {/* ─── Bulk Extra ───────────────────────────────────────────────────── */}
      {tab === 'extra' && (
        <Div type="col" gap="lg">
          <WarnBanner>
            Bulk extra creates new fee bills for all matching students. This cannot be undone.
          </WarnBanner>
          <FormCard title="Apply Bulk Extra Payment">
            <Div type="grid" cols={1} gap="md" className="sm:grid-cols-2">
              <FormField label="Academic Year" required>
                <Select value={extraForm.academic_year_id} onChange={e => setExtraForm(f => ({ ...f, academic_year_id: e.target.value }))}>
                  <option value="">Select Academic Year</option>
                  {(academicYears as any[]).map(y => (
                    <option key={y.id} value={y.id}>{y.name ?? y.year_name}{y.is_current ? ' (Current)' : ''}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Class (leave blank = all classes)">
                <Select value={extraForm.class_id} onChange={e => setExtraForm(f => ({ ...f, class_id: e.target.value }))}>
                  <option value="">All Classes</option>
                  {(classes as any[]).map(c => <option key={c.id} value={c.id}>{c.name ?? c.class_name}</option>)}
                </Select>
              </FormField>
              <FormField label="Fee Type" required>
                <Select value={extraForm.fee_type_id} onChange={e => setExtraForm(f => ({ ...f, fee_type_id: e.target.value }))}>
                  <option value="">Select Fee Type</option>
                  {classFeeTypes.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </Select>
              </FormField>
              <FormField label="Amount (₹)" required>
                <Input type="number" value={extraForm.amount} onChange={e => setExtraForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
              </FormField>
              <FormField label="Bill Month">
                <Input value={extraForm.bill_month} onChange={e => setExtraForm(f => ({ ...f, bill_month: e.target.value }))} placeholder="e.g. 2026-04" />
              </FormField>
              <FormField label="Reason (optional)">
                <Input value={extraForm.reason} onChange={e => setExtraForm(f => ({ ...f, reason: e.target.value }))} placeholder="Optional reason" />
              </FormField>
            </Div>
            <Div type="row" justify="end" padding="mt-5">
              <Button
                variant="destructive"
                onClick={() => setConfirmExtra(true)}
                disabled={!extraForm.academic_year_id || !extraForm.fee_type_id || !extraForm.amount}
              >
                <Plus className="w-3.5 h-3.5 mr-1" /> Apply Bulk Extra
              </Button>
            </Div>
          </FormCard>
        </Div>
      )}

      {/* ─── Pay Bill Modal ───────────────────────────────────────────────── */}
      {(!!payingBill || !!payingDue) && (
        <Modal onClose={closePayModal} title="Cash / Offline Payment Details">
          <ModalBody>
            <Div type="col" gap="md">
              {payingBill && (
                <Div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                  <P color="default" weight="medium">{payingBill.fee_type_name}</P>
                  <P size="xs">{payingBill.bill_month ?? 'One-time'} · Status: {payingBill.status}</P>
                </Div>
              )}
              {payingDue && (
                <Div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                  <P color="default" weight="medium">{payingDue.student_name}</P>
                  <P size="xs">Month: {payingDue.month} · Due: ₹{payingDue.due_amount}</P>
                </Div>
              )}
              <FormField label="Select Finance Account">
                <Select value={payForm.to_account_id ?? ''} onChange={e => setPayForm(f => ({ ...f, to_account_id: e.target.value || undefined }))}>
                  <option value="">No account (offline record only)</option>
                  {financeAccounts.map(a => <option key={a.id} value={a.id}>{a.name} ({a.account_type})</option>)}
                </Select>
              </FormField>
              <FormField label="Paying Now Amount" required>
                <Input type="number" value={payForm.amount || ''} onChange={e => setPayForm(f => ({ ...f, amount: parseFloat(e.target.value) || 0 }))} min="0" step="0.01" placeholder="0.00" />
              </FormField>
              <FormField label="Payment Mode" required>
                <Select value={payForm.payment_mode} onChange={e => setPayForm(f => ({ ...f, payment_mode: e.target.value as PaymentMode }))}>
                  {PAYMENT_MODES.map(m => <option key={m} value={m}>{m}</option>)}
                </Select>
              </FormField>
              <Div type="grid" cols={2} gap="sm">
                <FormField label="Transaction No">
                  <Input value={payForm.transaction_id ?? ''} onChange={e => setPayForm(f => ({ ...f, transaction_id: e.target.value || undefined }))} placeholder="UTR / Ref No." />
                </FormField>
                <FormField label="Bank Name">
                  <Input value={payForm.bank_name ?? ''} onChange={e => setPayForm(f => ({ ...f, bank_name: e.target.value || undefined }))} placeholder="Optional" />
                </FormField>
              </Div>
              <Div type="grid" cols={2} gap="sm">
                <FormField label="Payment Date" required>
                  <Input type="date" value={payForm.payment_date} onChange={e => setPayForm(f => ({ ...f, payment_date: e.target.value }))} />
                </FormField>
                <FormField label="Remarks">
                  <Input value={payForm.remarks ?? ''} onChange={e => setPayForm(f => ({ ...f, remarks: e.target.value || undefined }))} placeholder="Optional" />
                </FormField>
              </Div>
              <Div type="grid" cols={3} gap="sm" className="rounded-lg bg-muted/20 border border-border/40 px-4 py-3">
                <Div type="col">
                  <P size="xs">Total</P>
                  <P color="default" weight="semibold">
                    ₹{(payingBill ? parseFloat(payingBill.total_amount) : parseFloat(payingDue?.due_amount ?? '0')).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </P>
                </Div>
                <Div type="col">
                  <P size="xs">Paying</P>
                  <P color="primary" weight="semibold">₹{(payForm.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</P>
                </Div>
                <Div type="col">
                  <P size="xs">Remaining Due</P>
                  <P weight="semibold" className={Math.max(0, (payingBill ? billBalanceDue(payingBill) : parseFloat(payingDue?.due_amount ?? '0')) - (payForm.amount || 0)) > 0 ? 'text-destructive' : 'text-success'}>
                    ₹{Math.max(0, (payingBill ? billBalanceDue(payingBill) : parseFloat(payingDue?.due_amount ?? '0')) - (payForm.amount || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </P>
                </Div>
              </Div>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={closePayModal}>Cancel</Button>
            <Button onClick={payingBill ? handlePayBill : handleMonthlyPay} disabled={!payForm.amount || !payForm.payment_date}>
              <CreditCard className="w-3.5 h-3.5 mr-1" /> Record Payment
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ─── Add Additional Fee Modal ─────────────────────────────────────── */}
      {addFeeModal && selectedStudent && (
        <Modal onClose={() => setAddFeeModal(false)} title="Add Additional Fee">
          <ModalBody>
            <Div type="col" gap="md">
              <Div className="rounded-lg border border-border/50 bg-muted/20 px-4 py-3">
                <P color="default" weight="medium">{selectedStudent.first_name}{selectedStudent.last_name ? ` ${selectedStudent.last_name}` : ''}</P>
                <P size="xs">Admission: {selectedStudent.admission_number}</P>
              </Div>
              <FormField label="Select Fee Type" required>
                <Select value={addFeeForm.fee_type_id} onChange={e => setAddFeeForm(f => ({ ...f, fee_type_id: e.target.value }))}>
                  <option value="">Select Fee Type</option>
                  {allFeeTypes.map(t => <option key={t.id} value={t.id}>{t.name} ({t.frequency})</option>)}
                </Select>
              </FormField>
              <FormField label="Month Year">
                <Select value={addFeeForm.bill_month} onChange={e => setAddFeeForm(f => ({ ...f, bill_month: e.target.value }))}>
                  <option value="">One-time / No month</option>
                  {buildMonthYearOpts(studentFilter.academic_year_id, academicYears as any[]).map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Fee Amount" required>
                <Input type="number" value={addFeeForm.amount} onChange={e => setAddFeeForm(f => ({ ...f, amount: e.target.value }))} placeholder="0.00" min="0" step="0.01" />
              </FormField>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setAddFeeModal(false)}>Cancel</Button>
            <Button onClick={handleAddFee} disabled={!addFeeForm.fee_type_id || !addFeeForm.amount}>
              <FilePlus className="w-3.5 h-3.5 mr-1" /> Add Fee
            </Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ─── Confirm Bulk Discount ────────────────────────────────────────── */}
      {confirmDiscount && (
        <Modal onClose={() => setConfirmDiscount(false)} title="Confirm Bulk Discount">
          <ModalBody>
            <Div type="row" align="start" gap="sm">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <Div type="col" gap="xs">
                <P color="default" weight="semibold">This action is irreversible.</P>
                <P>
                  A discount of <Span color="default" className="font-medium">₹{discountForm.discount_amount}</Span> will be applied
                  to all matching fee bills{discountForm.class_id ? '' : ' across all classes'}.
                  An audit record will be created per student.
                </P>
              </Div>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setConfirmDiscount(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkDiscount}>Yes, Apply Discount</Button>
          </ModalFooter>
        </Modal>
      )}

      {/* ─── Confirm Bulk Extra ───────────────────────────────────────────── */}
      {confirmExtra && (
        <Modal onClose={() => setConfirmExtra(false)} title="Confirm Bulk Extra Payment">
          <ModalBody>
            <Div type="row" align="start" gap="sm">
              <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
              <Div type="col" gap="xs">
                <P color="default" weight="semibold">This action is irreversible.</P>
                <P>
                  New fee bills of <Span color="default" className="font-medium">₹{extraForm.amount}</Span> will be created
                  for all matching students{extraForm.class_id ? '' : ' across all classes'}.
                  This cannot be undone.
                </P>
              </Div>
            </Div>
          </ModalBody>
          <ModalFooter>
            <Button variant="secondary" onClick={() => setConfirmExtra(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleBulkExtra}>Yes, Create Bills</Button>
          </ModalFooter>
        </Modal>
      )}
    </Div>
  );
}
