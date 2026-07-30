"use client";

import { useMemo } from "react";
import { Plus, Trash2, Pencil, CheckCircle, X, Printer } from "lucide-react";
import {
  Div,
  Button,
  PageHeader,
  PageCol,
  Badge,
  Spinner,
  Icon,
  Input,
  Select,
  FormField,
  H2,
  P,
  Span,
  Label,
  DataTable,
  type ColumnDef,
  RowActions,
} from "@/components/ui";
import { Tabs } from "@/components/ui/tabs";
import { useSalary, SalaryTab } from "@/hooks/useSalary";

const TABS = [
  { value: "heads" as const, label: "Salary Heads" },
  { value: "templates" as const, label: "Structure Templates" },
  { value: "assignments" as const, label: "Assign Structure" },
  { value: "transactions" as const, label: "Monthly Salary" },
  { value: "process" as const, label: "Process / Approve" },
  { value: "payslip" as const, label: "Payslip" },
] satisfies { value: SalaryTab; label: string }[];

const STATUS_VARIANT: Record<
  string,
  "default" | "success" | "warning" | "danger"
> = {
  PENDING: "warning",
  PROCESSED: "success",
  PAID: "success",
};

export default function SalaryManagementPage() {
  const {
    activeTab,
    setActiveTab,
    staffList,
    financeAccounts,
    expenseHeads,
    submitting,
    heads,
    loadingHeads,
    editingHead,
    headForm,
    setHeadForm,
    startEditHead,
    cancelEditHead,
    submitHead,
    deleteHead,
    templates,
    loadingTemplates,
    editingTemplate,
    templateName,
    setTemplateName,
    templateEnabled,
    setTemplateEnabled,
    templateItems,
    startEditTemplate,
    cancelEditTemplate,
    submitTemplate,
    deleteTemplate,
    addTemplateItem,
    removeTemplateItem,
    updateTemplateItem,
    assignments,
    loadingAssignments,
    assignForm,
    setAssignForm,
    submitAssignment,
    deactivateAssignment,
    transactions,
    loadingTxns,
    txnForm,
    setTxnForm,
    activeAssignment,
    loadingAssignment,
    submitTransaction,
    deleteTxn,
    processTxn,
    pendingTxns,
    loadingPending,
    processMonth,
    setProcessMonth,
    processEmployeeId,
    setProcessEmployeeId,
    fetchPendingTransactions,
    payslipEmployeeId,
    setPayslipEmployeeId,
    payslipMonth,
    setPayslipMonth,
    payslipTxn,
    payslipAssignment,
    loadingPayslip,
    generatePayslip,
    SALARY_HEAD_TYPES,
    SALARY_PAYMENT_MODES,
  } = useSalary();

  const fmt = (n: string | number) =>
    `₹${parseFloat(String(n)).toLocaleString("en-IN", {
      minimumFractionDigits: 0,
    })}`;
  const fmtDate = (d: string) =>
    d
      ? new Date(d).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
      : "—";
  const staffName = (id: string) => {
    const s = staffList.find((x) => x.id === id);
    return s ? `${s.first_name} ${s.last_name ?? ""}`.trim() : id;
  };
  const templateTotal = (items: { default_amount: string }[]) =>
    items.reduce((sum, i) => sum + parseFloat(i.default_amount || "0"), 0);

  const headColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        accessorKey: "name",
        header: "Name",
        meta: { primary: true },
      },
      {
        accessorKey: "head_type",
        header: "Type",
        cell: ({ row }) => (
          <Badge
            variant={
              row.original.head_type === "Earning" ? "success" : "danger"
            }
          >
            {row.original.head_type}
          </Badge>
        ),
      },
      {
        accessorKey: "code",
        header: "Code",
        cell: ({ row }) => <Span color="muted">{row.original.code}</Span>,
      },
      {
        accessorKey: "created_at",
        header: "Created",
        cell: ({ row }) => fmtDate(row.original.created_at),
      },
      {
        accessorKey: "is_enabled",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_enabled ? "success" : "default"}>
            {row.original.is_enabled ? "Active" : "Disabled"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: "Edit",
                icon: <Pencil size={14} />,
                onClick: () => startEditHead(row.original),
              },
              {
                label: "Delete",
                icon: <Trash2 size={14} />,
                variant: "destructive",
                confirm: {
                  description: `Are you sure you want to delete salary head "${row.original.name}"?`,
                },
                onClick: () => deleteHead(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [fmtDate, startEditHead, deleteHead],
  );

  const assignmentColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "employee",
        header: "Employee",
        meta: { primary: true },
        cell: ({ row }) => staffName(row.original.employee_id),
      },
      {
        accessorKey: "template_name",
        header: "Template",
      },
      {
        id: "fixed_salary",
        header: "Fixed Salary",
        cell: ({ row }) => (
          <Div type="col" gap="xs">
            {row.original.items.map((item: any) => (
              <Div key={item.id} type="row" gap="sm">
                <Span color="muted">{item.head_name}</Span>
                <Span color="default">{fmt(item.default_amount)}</Span>
              </Div>
            ))}
            <P color="default" weight="semibold">
              Total: {fmt(templateTotal(row.original.items))}
            </P>
          </Div>
        ),
      },
      {
        accessorKey: "effective_from",
        header: "Effective From",
        cell: ({ row }) => fmtDate(row.original.effective_from ?? ""),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => row.original.remarks ?? "—",
      },
      {
        accessorKey: "is_active",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={row.original.is_active ? "success" : "default"}>
            {row.original.is_active ? "Active" : "Inactive"}
          </Badge>
        ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.is_active ? (
            <RowActions
              actions={[
                {
                  label: "Deactivate",
                  icon: <Trash2 size={14} />,
                  variant: "destructive",
                  confirm: {
                    description:
                      "Are you sure you want to deactivate this assignment?",
                  },
                  onClick: () => deactivateAssignment(row.original.id),
                },
              ]}
            />
          ) : null,
      },
    ],
    [staffName, fmtDate, fmt, deactivateAssignment],
  );

  const transactionColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "employee",
        header: "Employee",
        meta: { primary: true },
        cell: ({ row }) => staffName(row.original.employee_id),
      },
      {
        accessorKey: "total_amount",
        header: "Gross",
        cell: ({ row }) => fmt(row.original.total_amount),
      },
      {
        id: "deduction",
        header: "Deduction",
        cell: ({ row }) =>
          parseFloat(row.original.deduction_amount ?? "0") > 0 ? (
            <Span color="danger">− {fmt(row.original.deduction_amount)}</Span>
          ) : (
            <Span color="muted">—</Span>
          ),
      },
      {
        id: "net_paid",
        header: "Net Paid",
        cell: ({ row }) => (
          <Span color="default">
            {fmt(
              parseFloat(row.original.total_amount) -
                parseFloat(row.original.deduction_amount ?? "0"),
            )}
          </Span>
        ),
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => (
          <Badge variant={STATUS_VARIANT[row.original.status] ?? "default"}>
            {row.original.status}
          </Badge>
        ),
      },
      {
        accessorKey: "salary_month",
        header: "Month",
      },
      {
        accessorKey: "payment_mode",
        header: "Mode",
      },
      {
        accessorKey: "payment_release_date",
        header: "Release Date",
        cell: ({ row }) => fmtDate(row.original.payment_release_date),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.status === "PENDING" ? (
            <RowActions
              actions={[
                {
                  label: "Process",
                  icon: <CheckCircle size={14} className="text-emerald-500" />,
                  onClick: () => processTxn(row.original.id),
                },
                {
                  label: "Delete",
                  icon: <Trash2 size={14} />,
                  variant: "destructive",
                  confirm: {
                    description:
                      "Are you sure you want to delete this salary transaction?",
                  },
                  onClick: () => deleteTxn(row.original.id),
                },
              ]}
            />
          ) : null,
      },
    ],
    [staffName, fmt, fmtDate, processTxn, deleteTxn],
  );

  const pendingColumns = useMemo<ColumnDef<any>[]>(
    () => [
      {
        id: "index",
        header: "#",
        cell: ({ row }) => row.index + 1,
      },
      {
        id: "employee",
        header: "Employee",
        meta: { primary: true },
        cell: ({ row }) => staffName(row.original.employee_id),
      },
      {
        accessorKey: "salary_month",
        header: "Salary Month",
      },
      {
        accessorKey: "total_amount",
        header: "Gross",
        cell: ({ row }) => fmt(row.original.total_amount),
      },
      {
        id: "deduction",
        header: "Deduction",
        cell: ({ row }) =>
          parseFloat(row.original.deduction_amount ?? "0") > 0 ? (
            <Span color="danger">− {fmt(row.original.deduction_amount)}</Span>
          ) : (
            <Span color="muted">—</Span>
          ),
      },
      {
        id: "net_payable",
        header: "Net Payable",
        cell: ({ row }) => (
          <Span color="default">
            {fmt(
              parseFloat(row.original.total_amount) -
                parseFloat(row.original.deduction_amount ?? "0"),
            )}
          </Span>
        ),
      },
      {
        accessorKey: "payment_mode",
        header: "Mode",
      },
      {
        accessorKey: "payment_release_date",
        header: "Release Date",
        cell: ({ row }) => fmtDate(row.original.payment_release_date),
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => row.original.remarks ?? "—",
      },
      {
        id: "actions",
        header: "Action",
        cell: ({ row }) => (
          <RowActions
            actions={[
              {
                label: "Process",
                icon: <CheckCircle size={14} className="text-emerald-500" />,
                onClick: () => processTxn(row.original.id),
              },
            ]}
          />
        ),
      },
    ],
    [staffName, fmt, fmtDate, processTxn],
  );

  return (
    <PageCol>
      <PageHeader
        title="Salary & Payroll"
        subtitle="Manage salary heads, structures, assignments and monthly payroll"
      />

      <Tabs options={TABS} value={activeTab} onChange={setActiveTab} />

      {/* ─── SALARY HEADS ───────────────────────────────────────────────────────── */}
      {activeTab === "heads" && (
        <Div type="col" gap="lg">
          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              {editingHead ? "Edit Salary Head" : "Add Salary Head"}
            </P>
            <Div type="grid" cols={4} gap="md">
              <FormField label="Head Type">
                <Select
                  value={headForm.head_type}
                  onChange={(e) =>
                    setHeadForm((f) => ({
                      ...f,
                      head_type: e.target.value as "Earning" | "Deduction",
                    }))
                  }
                >
                  {SALARY_HEAD_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Salary Head Name">
                <Input
                  placeholder="e.g. Basic Salary"
                  value={headForm.name}
                  onChange={(e) =>
                    setHeadForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Head Code">
                <Input
                  placeholder="e.g. BASIC"
                  value={headForm.code}
                  onChange={(e) =>
                    setHeadForm((f) => ({ ...f, code: e.target.value }))
                  }
                />
              </FormField>
              <Div type="col" gap="sm" justify="end">
                <Label>
                  <Div type="row" gap="xs" align="center">
                    <input
                      type="checkbox"
                      checked={headForm.is_enabled}
                      onChange={(e) =>
                        setHeadForm((f) => ({
                          ...f,
                          is_enabled: e.target.checked,
                        }))
                      }
                    />
                    <Span>Enabled</Span>
                  </Div>
                </Label>
                <Div type="row" gap="sm">
                  {editingHead && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={cancelEditHead}
                    >
                      Cancel
                    </Button>
                  )}
                  <Button size="sm" loading={submitting} onClick={submitHead}>
                    {editingHead ? "Update Head" : "Add Head"}
                  </Button>
                </Div>
              </Div>
            </Div>
          </Div>

          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              All Salary Heads
            </P>
            <DataTable
              columns={headColumns}
              data={heads}
              isLoading={loadingHeads}
              emptyText="No salary heads. Add one above."
            />
          </Div>
        </Div>
      )}

      {/* ─── STRUCTURE TEMPLATES ────────────────────────────────────────────────── */}
      {activeTab === "templates" && (
        <Div type="col" gap="lg">
          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              {editingTemplate
                ? "Edit Template"
                : "Add Salary Structure Template"}
            </P>
            <Div type="grid" cols={2} gap="md">
              <FormField label="Template Name">
                <Input
                  placeholder="e.g. Senior Teacher"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </FormField>
              <Div type="col" justify="end">
                <Label>
                  <Div type="row" gap="xs" align="center">
                    <input
                      type="checkbox"
                      checked={templateEnabled}
                      onChange={(e) => setTemplateEnabled(e.target.checked)}
                    />
                    <Span>Enabled</Span>
                  </Div>
                </Label>
              </Div>
            </Div>

            <Div type="col" gap="sm">
              <Div type="row" justify="between" align="center">
                <P color="default" weight="medium">
                  Salary Heads & Amounts
                </P>
                <Button size="sm" variant="outline" onClick={addTemplateItem}>
                  <Icon icon={Plus} type="sm-inline" /> Add Head
                </Button>
              </Div>
              <Div type="col" gap="sm">
                {templateItems.map((item, idx) => (
                  <Div
                    key={idx}
                    type="row"
                    gap="sm"
                    align="center"
                    variant="inset"
                  >
                    <Div type="col" grow>
                      <Select
                        value={item.salary_head_id}
                        onChange={(e) =>
                          updateTemplateItem(
                            idx,
                            "salary_head_id",
                            e.target.value,
                          )
                        }
                      >
                        <option value="">Select Salary Head</option>
                        {heads
                          .filter((h) => h.is_enabled)
                          .map((h) => (
                            <option key={h.id} value={h.id}>
                              {h.name} [{h.code}] ({h.head_type})
                            </option>
                          ))}
                      </Select>
                    </Div>
                    <Input
                      width="sm"
                      type="number"
                      placeholder="Amount (₹)"
                      value={item.default_amount ?? ""}
                      onChange={(e) =>
                        updateTemplateItem(
                          idx,
                          "default_amount",
                          Number(e.target.value),
                        )
                      }
                    />
                    {templateItems.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeTemplateItem(idx)}
                      >
                        <Icon icon={X} type="sm-danger" />
                      </Button>
                    )}
                  </Div>
                ))}
              </Div>
              {templateItems.some((i) => i.salary_head_id) && (
                <Div type="row" justify="end">
                  <P color="default" weight="semibold">
                    Total:{" "}
                    {fmt(
                      templateItems.reduce(
                        (s, i) => s + (i.default_amount ?? 0),
                        0,
                      ),
                    )}
                  </P>
                </Div>
              )}
            </Div>

            <Div type="row" gap="sm" justify="end">
              {editingTemplate && (
                <Button variant="outline" onClick={cancelEditTemplate}>
                  Cancel
                </Button>
              )}
              <Button loading={submitting} onClick={submitTemplate}>
                {editingTemplate ? "Update Template" : "Create Template"}
              </Button>
            </Div>
          </Div>

          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              All Salary Structure Templates
            </P>
            {loadingTemplates ? (
              <Div type="row" justify="center" padding="py-8">
                <Spinner />
              </Div>
            ) : templates.length === 0 ? (
              <P color="muted">No templates yet.</P>
            ) : (
              <Div type="col" gap="md">
                {templates.map((tpl) => {
                  const earnings = tpl.items.filter(
                    (i) => i.head_type === "Earning",
                  );
                  const deductions = tpl.items.filter(
                    (i) => i.head_type === "Deduction",
                  );
                  return (
                    <Div
                      key={tpl.id}
                      type="col"
                      gap="sm"
                      variant="inset"
                      padding="p-4"
                    >
                      <Div type="row" justify="between" align="center">
                        <Div type="row" gap="sm" align="center">
                          <P color="default" weight="semibold">
                            {tpl.name}
                          </P>
                          <Badge
                            variant={tpl.is_enabled ? "success" : "default"}
                          >
                            {tpl.is_enabled ? "Active" : "Disabled"}
                          </Badge>
                        </Div>
                        <Div type="row" gap="xs">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => startEditTemplate(tpl)}
                          >
                            <Icon icon={Pencil} type="sm" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteTemplate(tpl.id)}
                          >
                            <Icon icon={Trash2} type="sm-danger" />
                          </Button>
                        </Div>
                      </Div>
                      <Div type="grid" cols={2} gap="md">
                        {earnings.length > 0 && (
                          <Div type="col" gap="xs">
                            <Span color="success">Earnings</Span>
                            {earnings.map((i) => (
                              <Div key={i.id} type="row" justify="between">
                                <Span color="muted">
                                  {i.head_name} [{i.head_code}]
                                </Span>
                                <Span color="success">
                                  {fmt(i.default_amount)}
                                </Span>
                              </Div>
                            ))}
                          </Div>
                        )}
                        {deductions.length > 0 && (
                          <Div type="col" gap="xs">
                            <Span color="danger">Deductions</Span>
                            {deductions.map((i) => (
                              <Div key={i.id} type="row" justify="between">
                                <Span color="muted">
                                  {i.head_name} [{i.head_code}]
                                </Span>
                                <Span color="danger">
                                  − {fmt(i.default_amount)}
                                </Span>
                              </Div>
                            ))}
                          </Div>
                        )}
                      </Div>
                      <Div type="row" justify="between">
                        <P color="muted">Net Salary</P>
                        <P color="default" weight="semibold">
                          {fmt(templateTotal(tpl.items))}
                        </P>
                      </Div>
                    </Div>
                  );
                })}
              </Div>
            )}
          </Div>
        </Div>
      )}

      {/* ─── ASSIGN STRUCTURE ───────────────────────────────────────────────────── */}
      {activeTab === "assignments" && (
        <Div type="col" gap="lg">
          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              Assign Salary Structure to Employee
            </P>
            <Div type="grid" cols={4} gap="md">
              <FormField label="Select Employee">
                <Select
                  value={assignForm.employee_id}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      employee_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Employee</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name ?? ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Salary Template">
                <Select
                  value={assignForm.template_id}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      template_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Template</option>
                  {templates
                    .filter((t) => t.is_enabled)
                    .map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                </Select>
              </FormField>
              <FormField label="Effective From">
                <Input
                  type="date"
                  value={assignForm.effective_from}
                  onChange={(e) =>
                    setAssignForm((f) => ({
                      ...f,
                      effective_from: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="Remarks">
                <Input
                  placeholder="Optional"
                  value={assignForm.remarks ?? ""}
                  onChange={(e) =>
                    setAssignForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                />
              </FormField>
            </Div>

            {assignForm.template_id &&
              (() => {
                const tpl = templates.find(
                  (t) => t.id === assignForm.template_id,
                );
                if (!tpl) return null;
                return (
                  <Div type="col" gap="sm" variant="inset" padding="p-4">
                    <P color="default" weight="medium">
                      Template Preview: {tpl.name}
                    </P>
                    {tpl.items.map((i) => (
                      <Div key={i.id} type="row" justify="between">
                        <Span color="muted">
                          {i.head_name} ({i.head_type})
                        </Span>
                        <Span
                          color={
                            i.head_type === "Earning" ? "success" : "danger"
                          }
                        >
                          {i.head_type === "Deduction" ? "− " : ""}
                          {fmt(i.default_amount)}
                        </Span>
                      </Div>
                    ))}
                    <Div type="row" justify="between">
                      <P color="default" weight="semibold">
                        Total
                      </P>
                      <P color="default" weight="semibold">
                        {fmt(templateTotal(tpl.items))}
                      </P>
                    </Div>
                  </Div>
                );
              })()}

            <Div type="row" justify="end">
              <Button loading={submitting} onClick={submitAssignment}>
                Assign Structure
              </Button>
            </Div>
          </Div>

          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              Assigned Salary Structure List
            </P>
            <DataTable
              columns={assignmentColumns}
              data={assignments}
              isLoading={loadingAssignments}
              emptyText="No assignments yet."
            />
          </Div>
        </Div>
      )}

      {/* ─── MONTHLY SALARY ─────────────────────────────────────────────────────── */}
      {activeTab === "transactions" && (
        <Div type="col" gap="lg">
          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              Create Monthly Salary
            </P>
            <Div type="grid" cols={3} gap="md">
              <FormField label="Select Employee">
                <Select
                  value={txnForm.employee_id}
                  onChange={(e) =>
                    setTxnForm((f) => ({ ...f, employee_id: e.target.value }))
                  }
                >
                  <option value="">Select Employee</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name ?? ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Salary Month">
                <Input
                  type="month"
                  value={txnForm.salary_month}
                  onChange={(e) =>
                    setTxnForm((f) => ({ ...f, salary_month: e.target.value }))
                  }
                />
              </FormField>
              <FormField label="Gross Amount (₹)">
                <Input
                  type="number"
                  placeholder="0"
                  value={txnForm.total_amount || ""}
                  onChange={(e) =>
                    setTxnForm((f) => ({
                      ...f,
                      total_amount: Number(e.target.value),
                    }))
                  }
                />
                {loadingAssignment && (
                  <P color="muted">Fetching salary structure…</P>
                )}
              </FormField>
              <FormField label="Additional Deduction (₹)">
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0"
                  value={txnForm.deduction_amount || ""}
                  onChange={(e) =>
                    setTxnForm((f) => ({
                      ...f,
                      deduction_amount: Number(e.target.value),
                    }))
                  }
                />
                <P color="muted">
                  Leave deduction, penalty, etc. Will map to leave later.
                </P>
              </FormField>
              <FormField label="Payment Mode">
                <Select
                  value={txnForm.payment_mode}
                  onChange={(e) =>
                    setTxnForm((f) => ({
                      ...f,
                      payment_mode: e.target.value as
                        | "CASH"
                        | "BANK"
                        | "CHEQUE"
                        | "UPI",
                    }))
                  }
                >
                  {SALARY_PAYMENT_MODES.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Payment Release Date">
                <Input
                  type="date"
                  value={txnForm.payment_release_date}
                  onChange={(e) =>
                    setTxnForm((f) => ({
                      ...f,
                      payment_release_date: e.target.value,
                    }))
                  }
                />
              </FormField>
              <FormField label="From Account">
                <Select
                  value={txnForm.from_account_id ?? ""}
                  onChange={(e) =>
                    setTxnForm((f) => ({
                      ...f,
                      from_account_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Account</option>
                  {financeAccounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} (₹
                      {parseFloat(a.current_balance).toLocaleString()})
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Finance Expense Head">
                <Select
                  value={txnForm.expense_head_id ?? ""}
                  onChange={(e) =>
                    setTxnForm((f) => ({
                      ...f,
                      expense_head_id: e.target.value,
                    }))
                  }
                >
                  <option value="">Select Expense Head</option>
                  {expenseHeads.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Remarks">
                <Input
                  placeholder="Optional"
                  value={txnForm.remarks ?? ""}
                  onChange={(e) =>
                    setTxnForm((f) => ({ ...f, remarks: e.target.value }))
                  }
                />
              </FormField>
            </Div>

            {(txnForm.total_amount > 0 ||
              (txnForm.deduction_amount ?? 0) > 0) && (
              <Div type="col" gap="xs" variant="inset" padding="p-4">
                <Div type="row" justify="between">
                  <Span color="muted">Gross</Span>
                  <Span color="default">{fmt(txnForm.total_amount)}</Span>
                </Div>
                <Div type="row" justify="between">
                  <Span color="danger">Deduction</Span>
                  <Span color="danger">
                    − {fmt(txnForm.deduction_amount ?? 0)}
                  </Span>
                </Div>
                <Div type="row" justify="between">
                  <P color="default" weight="semibold">
                    Net Payable
                  </P>
                  <P color="default" weight="semibold">
                    {fmt(
                      txnForm.total_amount - (txnForm.deduction_amount ?? 0),
                    )}
                  </P>
                </Div>
              </Div>
            )}

            {/* Active structure preview */}
            {txnForm.employee_id &&
              !loadingAssignment &&
              (activeAssignment ? (
                <Div type="col" gap="sm" variant="inset" padding="p-4">
                  <Div type="row" gap="sm" align="center">
                    <P color="default" weight="medium">
                      Active Structure: {activeAssignment.template_name}
                    </P>
                    <Span color="muted">
                      (effective{" "}
                      {activeAssignment.effective_from
                        ? fmtDate(activeAssignment.effective_from)
                        : "—"}
                      )
                    </Span>
                  </Div>
                  <Div type="grid" cols={2} gap="md">
                    {activeAssignment.items.filter(
                      (i) => i.head_type === "Earning",
                    ).length > 0 && (
                      <Div type="col" gap="xs">
                        <Span color="success">Earnings</Span>
                        {activeAssignment.items
                          .filter((i) => i.head_type === "Earning")
                          .map((i) => (
                            <Div key={i.id} type="row" justify="between">
                              <Span color="muted">{i.head_name}</Span>
                              <Span color="success">
                                {fmt(i.default_amount)}
                              </Span>
                            </Div>
                          ))}
                      </Div>
                    )}
                    {activeAssignment.items.filter(
                      (i) => i.head_type === "Deduction",
                    ).length > 0 && (
                      <Div type="col" gap="xs">
                        <Span color="danger">Deductions</Span>
                        {activeAssignment.items
                          .filter((i) => i.head_type === "Deduction")
                          .map((i) => (
                            <Div key={i.id} type="row" justify="between">
                              <Span color="muted">{i.head_name}</Span>
                              <Span color="danger">
                                − {fmt(i.default_amount)}
                              </Span>
                            </Div>
                          ))}
                      </Div>
                    )}
                  </Div>
                  <Div type="row" justify="between">
                    <P color="default" weight="semibold">
                      Net (auto-filled)
                    </P>
                    <P color="default" weight="semibold">
                      {fmt(txnForm.total_amount)}
                    </P>
                  </Div>
                  <P color="muted">
                    Amount auto-filled from structure. Override above if needed.
                  </P>
                </Div>
              ) : (
                <Div type="col" gap="xs" color="yellow" padding="p-3">
                  <P color="yellow">
                    No active salary structure assigned. Enter amount manually
                    or assign a structure first.
                  </P>
                </Div>
              ))}

            <Div type="row" justify="end">
              <Button loading={submitting} onClick={submitTransaction}>
                Create Salary
              </Button>
            </Div>
          </Div>

          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              Salary Transaction List
            </P>
            <DataTable
              columns={transactionColumns}
              data={transactions}
              isLoading={loadingTxns}
              emptyText="No salary transactions yet."
            />
          </Div>
        </Div>
      )}

      {/* ─── PROCESS / APPROVE ──────────────────────────────────────────────────── */}
      {activeTab === "process" && (
        <Div type="col" gap="lg">
          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              Approve Employee Monthly Salary
            </P>
            <Div type="grid" cols={3} gap="md">
              <FormField label="Salary Month">
                <Input
                  type="month"
                  value={processMonth}
                  onChange={(e) => setProcessMonth(e.target.value)}
                />
              </FormField>
              <FormField label="Select Employee (optional)">
                <Select
                  value={processEmployeeId}
                  onChange={(e) => setProcessEmployeeId(e.target.value)}
                >
                  <option value="">All Employees</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name ?? ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <Div type="col" justify="end">
                <Button
                  onClick={fetchPendingTransactions}
                  loading={loadingPending}
                >
                  Load Pending Salaries
                </Button>
              </Div>
            </Div>
          </Div>

          {pendingTxns.length > 0 && (
            <Div type="col" gap="md" variant="glass-sm" padding="p-5">
              <P color="default" weight="semibold">
                Pending Salary Approvals ({pendingTxns.length})
              </P>
              <DataTable
                columns={pendingColumns}
                data={pendingTxns}
                emptyText="No pending salary transactions."
              />
            </Div>
          )}

          {!loadingPending && pendingTxns.length === 0 && processMonth && (
            <Div variant="card-dashed">
              <P color="muted">
                No pending salary transactions for the selected filters.
              </P>
            </Div>
          )}
        </Div>
      )}

      {/* ─── PAYSLIP ────────────────────────────────────────────────────────────── */}
      {activeTab === "payslip" && (
        <Div type="col" gap="lg">
          <Div type="col" gap="md" variant="glass-sm" padding="p-5">
            <P color="default" weight="semibold">
              Generate Employee Payslip
            </P>
            <Div type="grid" cols={3} gap="md">
              <FormField label="Select Employee">
                <Select
                  value={payslipEmployeeId}
                  onChange={(e) => setPayslipEmployeeId(e.target.value)}
                >
                  <option value="">Select Employee</option>
                  {staffList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name ?? ""}
                      {s.employee_code ? ` (${s.employee_code})` : ""}
                    </option>
                  ))}
                </Select>
              </FormField>
              <FormField label="Salary Month">
                <Input
                  type="month"
                  value={payslipMonth}
                  onChange={(e) => setPayslipMonth(e.target.value)}
                />
              </FormField>
              <Div type="col" justify="end">
                <Button onClick={generatePayslip} loading={loadingPayslip}>
                  Generate Payslip
                </Button>
              </Div>
            </Div>
          </Div>

          {payslipTxn &&
            (() => {
              const staff = staffList.find(
                (s) => s.id === payslipTxn.employee_id,
              );
              const earnings =
                payslipAssignment?.items.filter(
                  (i) => i.head_type === "Earning",
                ) ?? [];
              const deductions =
                payslipAssignment?.items.filter(
                  (i) => i.head_type === "Deduction",
                ) ?? [];
              const totalEarnings = earnings.reduce(
                (s, i) => s + parseFloat(i.default_amount),
                0,
              );
              const totalDeductions = deductions.reduce(
                (s, i) => s + parseFloat(i.default_amount),
                0,
              );
              const grossPaid = parseFloat(payslipTxn.total_amount);
              const additionalDeduction = parseFloat(
                payslipTxn.deduction_amount ?? "0",
              );
              const netPaid = grossPaid - additionalDeduction;
              const [year, month] = payslipMonth.split("-");
              const monthLabel = new Date(
                Number(year),
                Number(month) - 1,
              ).toLocaleString("en-IN", { month: "long", year: "numeric" });

              return (
                <Div type="col" gap="md">
                  <Div type="row" justify="end" className="print:hidden">
                    <Button variant="outline" onClick={() => window.print()}>
                      <Printer size={14} className="mr-1" /> Print Payslip
                    </Button>
                  </Div>

                  <Div type="col" gap="lg" variant="glass-sm" padding="p-6">
                    {/* Header */}
                    <Div type="col" gap="xs" center>
                      <H2>SALARY PAYSLIP</H2>
                      <P color="muted">Pay Period: {monthLabel}</P>
                    </Div>

                    {/* Employee info */}
                    <Div type="grid" cols={2} gap="md">
                      <Div type="row" gap="sm">
                        <P color="muted">Employee Name</P>
                        <P color="default" weight="semibold">
                          {staff
                            ? `${staff.first_name} ${
                                staff.last_name ?? ""
                              }`.trim()
                            : payslipTxn.employee_id}
                        </P>
                      </Div>
                      <Div type="row" gap="sm">
                        <P color="muted">Employee Code</P>
                        <P color="default" weight="semibold">
                          {staff?.employee_code ?? "—"}
                        </P>
                      </Div>
                      <Div type="row" gap="sm">
                        <P color="muted">Designation</P>
                        <P color="default" weight="semibold">
                          {staff?.role?.replace(/_/g, " ") ?? "—"}
                        </P>
                      </Div>
                      <Div type="row" gap="sm">
                        <P color="muted">Joining Date</P>
                        <P color="default" weight="semibold">
                          {staff?.joining_date
                            ? fmtDate(staff.joining_date)
                            : "—"}
                        </P>
                      </Div>
                      <Div type="row" gap="sm">
                        <P color="muted">Payment Mode</P>
                        <P color="default" weight="semibold">
                          {payslipTxn.payment_mode}
                        </P>
                      </Div>
                      <Div type="row" gap="sm">
                        <P color="muted">Payment Date</P>
                        <P color="default" weight="semibold">
                          {fmtDate(payslipTxn.payment_release_date)}
                        </P>
                      </Div>
                      <Div type="row" gap="sm">
                        <P color="muted">Status</P>
                        <Badge
                          variant={
                            STATUS_VARIANT[payslipTxn.status] ?? "default"
                          }
                        >
                          {payslipTxn.status}
                        </Badge>
                      </Div>
                      {payslipAssignment && (
                        <Div type="row" gap="sm">
                          <P color="muted">Structure</P>
                          <P color="default" weight="semibold">
                            {payslipAssignment.template_name}
                          </P>
                        </Div>
                      )}
                    </Div>

                    {/* Earnings / Deductions */}
                    {payslipAssignment &&
                      (earnings.length > 0 || deductions.length > 0) && (
                        <Div type="grid" cols={2} gap="md">
                          <Div
                            type="col"
                            gap="sm"
                            variant="inset"
                            padding="p-4"
                          >
                            <Span color="success">Earnings</Span>
                            {earnings.map((i) => (
                              <Div key={i.id} type="row" justify="between">
                                <Span color="muted">
                                  {i.head_name} [{i.head_code}]
                                </Span>
                                <Span color="success">
                                  {fmt(i.default_amount)}
                                </Span>
                              </Div>
                            ))}
                            <Div type="row" justify="between">
                              <P color="default" weight="semibold">
                                Total Earnings
                              </P>
                              <P color="success" weight="semibold">
                                {fmt(totalEarnings)}
                              </P>
                            </Div>
                          </Div>
                          <Div
                            type="col"
                            gap="sm"
                            variant="inset"
                            padding="p-4"
                          >
                            <Span color="danger">Deductions</Span>
                            {deductions.length === 0 ? (
                              <P color="muted">No deductions</P>
                            ) : (
                              deductions.map((i) => (
                                <Div key={i.id} type="row" justify="between">
                                  <Span color="muted">
                                    {i.head_name} [{i.head_code}]
                                  </Span>
                                  <Span color="danger">
                                    {fmt(i.default_amount)}
                                  </Span>
                                </Div>
                              ))
                            )}
                            <Div type="row" justify="between">
                              <P color="default" weight="semibold">
                                Total Deductions
                              </P>
                              <P color="danger" weight="semibold">
                                {fmt(totalDeductions)}
                              </P>
                            </Div>
                          </Div>
                        </Div>
                      )}

                    {/* Net summary */}
                    <Div type="col" gap="xs" variant="inset" padding="p-5">
                      <Div type="row" justify="between">
                        <Span color="muted">Gross Salary</Span>
                        <Span color="default">{fmt(grossPaid)}</Span>
                      </Div>
                      {additionalDeduction > 0 && (
                        <Div type="row" justify="between">
                          <Span color="danger">Additional Deduction</Span>
                          <Span color="danger">
                            − {fmt(additionalDeduction)}
                          </Span>
                        </Div>
                      )}
                      <Div type="row" justify="between">
                        <H2>NET SALARY PAID</H2>
                        <H2>{fmt(netPaid)}</H2>
                      </Div>
                    </Div>

                    {/* Signature */}
                    <Div type="grid" cols={2} gap="lg">
                      <Div type="col" gap="xs" align="center">
                        <Div variant="gradient-bar" />
                        <P color="muted">Employee Signature</P>
                      </Div>
                      <Div type="col" gap="xs" align="center">
                        <Div variant="gradient-bar" />
                        <P color="muted">Authorised Signatory</P>
                      </Div>
                    </Div>

                    <Div center>
                      <P color="muted">
                        This is a computer-generated payslip and does not
                        require a physical signature.
                      </P>
                    </Div>
                  </Div>
                </Div>
              );
            })()}

          {!payslipTxn && !loadingPayslip && (
            <Div variant="card-dashed">
              <P color="muted">
                Select employee and month, then click Generate Payslip.
              </P>
            </Div>
          )}
        </Div>
      )}
    </PageCol>
  );
}
