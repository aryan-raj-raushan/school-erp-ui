"use client";

import { useState } from "react";
import { useMyLeave } from "@/hooks/useLeave";
import { LEAVE_PAGE, LEAVE_STATUS_BADGE } from "@/constants";
import {
  Div,
  H1,
  P,
  Button,
  Input,
  Table,
  TableHead,
  TableHeadRow,
  TableHeaderCell,
  TableBody,
  TableRow,
  TableCell,
  TableEmptyRow,
  Badge,
  Spinner,
  FormField,
  FilterLabel,
  MiniStat,
  Icon,
  ResponsiveModalContainer,
  ResponsiveSelect,
} from "@/components/ui";
import { Plus } from "lucide-react";

type Tab = "requests" | "balance";

export default function TeacherLeaveView() {
  const [activeTab, setActiveTab] = useState<Tab>("requests");

  const {
    years,
    selectedAcademicYearId,
    setSelectedAcademicYearId,
    leaveTypes,
    myRequests,
    myBalances,
    isLoading,
    isSaving,
    showApplyModal, setShowApplyModal,
    applyForm,
    handleApply,
  } = useMyLeave();

  const { register, handleSubmit, formState: { errors } } = applyForm;

  const pending = myRequests.filter((r) => r.status === "PENDING").length;
  const approved = myRequests.filter((r) => r.status === "APPROVED").length;

  return (
    <Div type="col" gap="lg">
      {/* Header */}
      <Div type="row" justify="between" align="center">
        <H1>{LEAVE_PAGE.title}</H1>
        <Button onClick={() => setShowApplyModal(true)}>
          <Icon icon={Plus} type="btn-icon" />
          {LEAVE_PAGE.applyButton}
        </Button>
      </Div>

      {/* Stats */}
      <Div type="row" gap="sm">
        <MiniStat label="Total Requests" value={myRequests.length} />
        <MiniStat label="Pending" value={pending} color={pending > 0 ? "yellow" : "default"} />
        <MiniStat label="Approved" value={approved} color="green" />
      </Div>

      {/* AY filter for balance tab */}
      <Div variant="card" padding="p-4">
        <Div type="row" gap="md" align="center">
          <FilterLabel noWrap>Academic Year (for balance)</FilterLabel>
          <ResponsiveSelect
            value={selectedAcademicYearId}
            onChange={(e) => setSelectedAcademicYearId(e.target.value)}
            customPlaceholder="Select year"
            options={years.map((y) => ({ value: y.id, label: `${y.name}${y.is_current ? " (Current)" : ""}` }))}
          />
        </Div>
      </Div>

      {/* Tabs */}
      <Div type="row" gap="sm">
        {(["requests", "balance"] as Tab[]).map((tab) => (
          <Button
            key={tab}
            size="sm"
            variant={activeTab === tab ? "default" : "outline"}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "requests" ? LEAVE_PAGE.tabs.myRequests : LEAVE_PAGE.tabs.myBalance}
          </Button>
        ))}
      </Div>

      {/* My Requests */}
      {activeTab === "requests" && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>#</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.type}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.from}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.to}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.days}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.reason}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.status}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableEmptyRow colSpan={7}><Spinner /></TableEmptyRow>
            ) : myRequests.length === 0 ? (
              <TableEmptyRow colSpan={7}>{LEAVE_PAGE.empty}</TableEmptyRow>
            ) : (
              myRequests.map((req, i) => (
                <TableRow key={req.id}>
                  <TableCell>{i + 1}</TableCell>
                  <TableCell primary>{req.leave_type?.name ?? "—"}</TableCell>
                  <TableCell>{req.from_date}</TableCell>
                  <TableCell>{req.to_date}</TableCell>
                  <TableCell>{req.total_days}</TableCell>
                  <TableCell>{req.reason}</TableCell>
                  <TableCell>
                    <Badge variant={LEAVE_STATUS_BADGE[req.status]}>{req.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* My Balance */}
      {activeTab === "balance" && (
        <Table>
          <TableHead>
            <TableHeadRow>
              <TableHeaderCell>{LEAVE_PAGE.table.type}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.total}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.used}</TableHeaderCell>
              <TableHeaderCell>{LEAVE_PAGE.table.remaining}</TableHeaderCell>
            </TableHeadRow>
          </TableHead>
          <TableBody>
            {!selectedAcademicYearId ? (
              <TableEmptyRow colSpan={4}>{LEAVE_PAGE.balanceEmpty}</TableEmptyRow>
            ) : myBalances.length === 0 ? (
              <TableEmptyRow colSpan={4}>No leave balances found.</TableEmptyRow>
            ) : (
              myBalances.map((bal) => (
                <TableRow key={bal.id}>
                  <TableCell primary>{bal.leave_type?.name ?? "—"}</TableCell>
                  <TableCell>{bal.allocated}</TableCell>
                  <TableCell>
                    <P color={bal.used > 0 ? "red" : "muted"}>{bal.used}</P>
                  </TableCell>
                  <TableCell>
                    <P color={(bal.allocated - bal.used) <= 2 ? "red" : "green"}>{bal.allocated - bal.used}</P>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      )}

      {/* Apply Leave Modal */}
      <ResponsiveModalContainer isOpen={showApplyModal} title={LEAVE_PAGE.apply.title} onClose={() => setShowApplyModal(false)}>
          <form onSubmit={handleSubmit(handleApply)}>
            <Div type="col" gap="md" className="px-4 py-4">
              <FormField label={LEAVE_PAGE.apply.leaveType} error={errors.leave_type_id?.message}>
                <ResponsiveSelect
                  {...register("leave_type_id")}
                  customPlaceholder="Select leave type"
                  options={leaveTypes.map((lt) => ({ value: lt.id, label: `${lt.name} (max ${lt.max_days} days)` }))}
                />
              </FormField>
              <Div type="grid" cols={2} gap="md">
                <FormField label={LEAVE_PAGE.apply.fromDate} error={errors.from_date?.message}>
                  <Input type="date" {...register("from_date")} />
                </FormField>
                <FormField label={LEAVE_PAGE.apply.toDate} error={errors.to_date?.message}>
                  <Input type="date" {...register("to_date")} />
                </FormField>
              </Div>
              <FormField label={LEAVE_PAGE.apply.reason} error={errors.reason?.message}>
                <Input {...register("reason")} placeholder="Reason for leave" />
              </FormField>
              <Div type="row" justify="end" gap="sm">
                <Button type="button" variant="outline" onClick={() => setShowApplyModal(false)}>
                  {LEAVE_PAGE.apply.cancel}
                </Button>
                <Button type="submit" loading={isSaving}>
                  {LEAVE_PAGE.apply.submit}
                </Button>
              </Div>
            </Div>
          </form>
      </ResponsiveModalContainer>
    </Div>
  );
}
