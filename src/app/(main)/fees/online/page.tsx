"use client";

import { useMemo, useState } from "react";
import { BadgeCheck, Ban, Mail, MessageCircle, QrCode, RefreshCw } from "lucide-react";
import {
  Badge,
  Button,
  DataTable,
  FormField,
  Input,
  PageCol,
  PageHeader,
  RowActions,
  SegmentedControl,
  Switch,
  Tabs,
  type ColumnDef,
} from "@/components/ui";
import { useFeeCollection } from "@/hooks/useFeeCollection";
import { useSessionState } from "@/hooks/useSessionState";
import { usePermissions } from "@/hooks/usePermissions";
import type { OnlinePaymentMode, UpiPaymentClaim } from "@/services/parent-portal.service";
import type { ClaimStatus, PaymentCollectionSettings } from "@/services/fee-collection.service";
import { cn } from "@/lib/utils";

const PAGE_TABS = [
  { value: "verify", label: "UPI payments" },
  { value: "settings", label: "Collection settings" },
  { value: "reminders", label: "Fee reminders" },
] as const;

type PageTab = (typeof PAGE_TABS)[number]["value"];

const STATUS_OPTIONS = [
  { value: "PENDING_VERIFICATION", label: "To verify" },
  { value: "PAID", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
] as const;

const rupees = (value: string | number) => `₹${Number(value).toLocaleString("en-IN")}`;

export default function OnlineFeePaymentsPage() {
  const vm = useFeeCollection();
  const [tab, setTab] = useSessionState<PageTab>("fees-online:tab", "verify");

  return (
    <PageCol>
      <PageHeader
        title="Online payments & reminders"
        subtitle="Parents pay straight into the school's own account — no platform in between."
      />
      <Tabs
        options={PAGE_TABS}
        value={tab}
        onChange={(next) => {
          setTab(next);
          if (next === "verify") vm.reloadClaims();
          if (next === "reminders") vm.reloadReminders();
        }}
        className="w-full max-w-xl"
      />
      {tab === "verify" && <VerifyTab vm={vm} />}
      {tab === "settings" && <SettingsTab vm={vm} />}
      {tab === "reminders" && <RemindersTab vm={vm} />}
    </PageCol>
  );
}

type Vm = ReturnType<typeof useFeeCollection>;

function VerifyTab({ vm }: { vm: Vm }) {
  const { hasPermission } = usePermissions();
  const canReview = hasPermission("fees.approve");

  const columns = useMemo<ColumnDef<UpiPaymentClaim>[]>(
    () => [
      { accessorKey: "student_name", header: "Student", meta: { primary: true } },
      {
        id: "fee",
        header: "Fee",
        cell: ({ row }) => [row.original.fee_type_name, row.original.bill_month].filter(Boolean).join(" · ") || "—",
      },
      { id: "amount", header: "Amount", cell: ({ row }) => rupees(row.original.amount) },
      {
        id: "utr",
        header: "UPI ref (UTR)",
        cell: ({ row }) => <span className="font-mono text-xs">{row.original.utr ?? "—"}</span>,
      },
      {
        id: "submitted",
        header: "Submitted",
        cell: ({ row }) => new Date(row.original.updated_at ?? row.original.created_at).toLocaleString("en-IN"),
      },
      {
        id: "status",
        header: "Status",
        meta: { mobile: "badge" },
        cell: ({ row }) =>
          row.original.status === "PAID" ? (
            <Badge variant="success">Confirmed</Badge>
          ) : row.original.status === "REJECTED" ? (
            <Badge variant="danger">Not received</Badge>
          ) : (
            <Badge variant="warning">To verify</Badge>
          ),
      },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) =>
          row.original.status === "PENDING_VERIFICATION" && canReview ? (
            <RowActions
              actions={[
                {
                  label: "Money received — record payment",
                  icon: <BadgeCheck size={14} />,
                  disabled: vm.reviewingId === row.original.id,
                  confirm: {
                    title: "Confirm money received",
                    description: `Confirm ${rupees(row.original.amount)} with UTR ${row.original.utr} is in the school bank account? This records the fee payment.`,
                    confirmLabel: "Record payment",
                  },
                  onClick: () => void vm.review(row.original, "approve"),
                },
                {
                  label: "Not received — reject",
                  icon: <Ban size={14} />,
                  variant: "destructive",
                  disabled: vm.reviewingId === row.original.id,
                  confirm: {
                    title: "Payment not received?",
                    description: `Mark UTR ${row.original.utr} as not received? The parent will see that the school could not find it.`,
                    confirmLabel: "Mark not received",
                  },
                  onClick: () => void vm.review(row.original, "reject", "Not found in the school bank statement"),
                },
              ]}
            />
          ) : null,
      },
    ],
    [canReview, vm],
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          options={STATUS_OPTIONS}
          value={vm.status}
          onChange={(value) => vm.setStatus(value as ClaimStatus)}
          ariaLabel="Payment status"
        />
        <div className="flex items-center gap-3">
          <p className="text-xs text-muted-foreground">Match each UTR with your bank statement before confirming.</p>
          <Button size="sm" variant="outline" onClick={vm.reloadClaims} loading={vm.isLoadingClaims}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={vm.claims}
        isLoading={vm.isLoadingClaims}
        emptyText={vm.status === "PENDING_VERIFICATION" ? "No UPI payments waiting for you" : "Nothing here yet"}
      />
    </div>
  );
}

function SettingsTab({ vm }: { vm: Vm }) {
  if (!vm.settings) return null;
  return <SettingsForm key={JSON.stringify(vm.settings)} settings={vm.settings} vm={vm} />;
}

const MODE_CARDS: { value: OnlinePaymentMode; title: string; text: string; icon: typeof QrCode }[] = [
  {
    value: "UPI_DIRECT",
    title: "UPI to school account",
    text: "Parents pay your UPI ID from any app. Zero charges. You confirm each payment by its UTR.",
    icon: QrCode,
  },
  {
    value: "DISABLED",
    title: "Off",
    text: "Parents see fees but pay at the school office.",
    icon: Ban,
  },
];

function SettingsForm({ settings, vm }: { settings: PaymentCollectionSettings; vm: Vm }) {
  const [mode, setMode] = useState<OnlinePaymentMode>(settings.online_payment_mode);
  const [upiId, setUpiId] = useState(settings.upi_id ?? "");
  const [payeeName, setPayeeName] = useState(settings.upi_payee_name ?? "");

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-4">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {MODE_CARDS.map(({ value, title, text, icon: Icon }) => (
            <button
              key={value}
              type="button"
              onClick={() => setMode(value)}
              className={cn(
                "flex flex-col gap-1.5 rounded-xl border p-3 text-left transition-colors",
                mode === value ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border hover:bg-muted/50",
              )}
            >
              <span className="flex items-center gap-2 text-sm font-semibold">
                <Icon size={16} className="text-primary" /> {title}
              </span>
              <span className="text-xs text-muted-foreground">{text}</span>
            </button>
          ))}
        </div>

        {mode === "UPI_DIRECT" && (
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <FormField label="School UPI ID" required hint="Use the school's bank or merchant UPI ID">
              <Input placeholder="schoolname@okhdfcbank" value={upiId} onChange={(e) => setUpiId(e.target.value.trim())} />
            </FormField>
            <FormField label="Name shown to parents">
              <Input placeholder="Sunrise Public School" value={payeeName} onChange={(e) => setPayeeName(e.target.value)} />
            </FormField>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            loading={vm.isSavingSettings}
            onClick={() =>
              void vm.saveSettings({
                online_payment_mode: mode,
                upi_id: upiId || null,
                upi_payee_name: payeeName || null,
              })
            }
          >
            Save settings
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 rounded-2xl border border-border bg-muted/30 p-4 text-sm">
        <p className="font-semibold">Where does the money go?</p>
        <ul className="list-disc space-y-1.5 pl-5 text-muted-foreground">
          <li>Always into the school&apos;s own bank account — the platform never holds fee money.</li>
          <li>UPI to a bank/merchant UPI ID has no transaction charges (zero MDR).</li>
          <li>Parents can always pay at the school office too.</li>
        </ul>
      </div>
    </div>
  );
}

function RemindersTab({ vm }: { vm: Vm }) {
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const markOpened = (key: string) => setOpened((current) => new Set(current).add(key));
  const list = vm.reminders;

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-[repeat(3,minmax(0,1fr))_minmax(0,1.4fr)]">
        <Stat label="Students with dues" value={list?.students ?? "—"} />
        <Stat label="Parents to remind" value={list?.parents ?? "—"} />
        <Stat label="Total due" value={list ? rupees(list.total_due) : "—"} />
        <label className="flex items-center justify-between gap-3 rounded-xl border border-border bg-card px-3 py-2.5 text-sm">
          <span>Only bills past their due date</span>
          <Switch checked={vm.overdueOnly} onCheckedChange={(checked) => vm.setOverdueOnly(checked)} />
        </label>
      </div>

      <p className="text-xs text-muted-foreground">
        Tap a button to open WhatsApp or your email app with the parent and message already filled in — then press send there.
      </p>

      {list && list.recipients.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border px-4 py-10 text-center text-sm text-muted-foreground">
          No parents with unpaid fees.
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-2 lg:grid-cols-2">
          {list?.recipients.map((r) => {
            const key = `${r.student_id}:${r.phone}`;
            return (
              <div key={key} className="flex flex-col gap-2 rounded-xl border border-border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">
                    {r.parent_name} <span className="font-normal text-muted-foreground">· parent of {r.student_name}</span>
                    <span className="ml-1.5 text-rose-600">{rupees(r.amount_due)} due</span>
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {r.phone}
                    {r.email ? ` · ${r.email}` : ""}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {opened.has(key) && <Badge variant="success">Opened</Badge>}
                  <a href={r.whatsapp_url} target="_blank" rel="noreferrer" onClick={() => markOpened(key)}>
                    <Button size="sm" type="button">
                      <MessageCircle size={14} /> WhatsApp
                    </Button>
                  </a>
                  {r.email_url && (
                    <a href={r.email_url} onClick={() => markOpened(key)}>
                      <Button size="sm" variant="outline" type="button">
                        <Mail size={14} /> Email
                      </Button>
                    </a>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-xl bg-muted/50 px-3 py-2.5">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="text-lg font-bold">{value}</p>
    </div>
  );
}
