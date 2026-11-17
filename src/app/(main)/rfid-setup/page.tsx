"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, UserCheck, Link2Off, Bell } from "lucide-react";
import { Div } from "@/components/ui/layout";
import { H3, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-card";
import { FormField } from "@/components/ui/form";
import { ResponsiveSelect } from "@/components/ui/responsive-select";
import { ResponsiveModalContainer } from "@/components/ui/responsive-bottom-sheet";
import { Badge } from "@/components/ui/badge";
import { useRfidEvents } from "@/hooks/useRfidEvents";
import { useAssignRfidModal } from "@/hooks/useAssignRfidModal";
import type { RfidScanEvent } from "@/services/rfid.service";
import { PageHeader, BottomSheet, MobileSelectField, SegmentedControl } from "@/components/ui";
import { useIsMobile } from "@/hooks/use-mobile";
import { formatPersonName } from "@/constants/person.constants";
import { confirmAction } from "@/components/ui/confirm-dialog";

function AssignModal({
  event,
  onClose,
  assignCard,
}: {
  event: RfidScanEvent;
  onClose: () => void;
  assignCard: (rfidCardId: string, personType: "staff" | "student", personId: string) => Promise<void>;
}) {
  const isMobile = useIsMobile();
  const [tab, setTab] = useState<"student" | "staff">("student");
  const [assigning, setAssigning] = useState(false);

  const {
    academicYear, isLoadingOverview, loadError,
    classes, sections, studentList, isLoadingStudents, staffList,
    classId, setClassId,
    sectionId, setSectionId,
    studentId, setStudentId,
    staffId, setStaffId,
  } = useAssignRfidModal();

  async function handleAssign() {
    const id = tab === "student" ? studentId : staffId;
    if (!id) return;
    setAssigning(true);
    try {
      await assignCard(event.r, tab, id);
      onClose();
    } finally {
      setAssigning(false);
    }
  }

  const canAssign = tab === "student" ? !!studentId : !!staffId;
  const classOptions = classes.map((c) => ({ value: c.id, label: `${c.name} · ${c.unassigned} without card` }));
  const sectionOptions = sections.map((sec) => ({ value: sec.id, label: `${sec.name} · ${sec.unassigned} without card` }));
  const studentOptions = studentList.map((st) => ({
    value: st.id,
    label: `${st.first_name} ${st.last_name ?? ""}${st.roll_number ? ` — Roll ${st.roll_number}` : ""}`.trim(),
  }));
  const staffOptions = staffList.map((st) => ({
    value: st.id,
    label: `${formatPersonName(st)}${st.employee_code ? ` (${st.employee_code})` : ""}`,
  }));
  const studentPlaceholder = !classId
    ? "Select a class first"
    : isLoadingStudents
      ? "Loading…"
      : studentOptions.length
        ? "Select student"
        : "Everyone here already has a card";
  const yearNotice = loadError ? (
    <P className="text-sm text-destructive">{loadError}</P>
  ) : (
    <P color="muted" className="text-xs">
      {isLoadingOverview
        ? "Loading…"
        : `Academic year: ${academicYear?.name ?? "—"} (current). Only students and staff without a card are listed.`}
    </P>
  );

  if (isMobile) {
    return (
      <BottomSheet
        isOpen
        onClose={onClose}
        title="Assign smart card"
        maxHeight="92dvh"
        footer={
          <Div type="row" className="flex gap-3">
            <Button variant="outline" size="lg" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button size="lg" className="flex-[2]" onClick={handleAssign} disabled={!canAssign} loading={assigning}>
              Assign
            </Button>
          </Div>
        }
      >
        <Div className="flex flex-col gap-3 pt-1">
          <Div className="rounded-2xl bg-muted/50 p-3">
            <P className="text-xs text-muted-foreground">Smart card ID</P>
            <P color="default" className="font-mono text-[15px] font-medium">{event.r}</P>
          </Div>
          <SegmentedControl
            ariaLabel="Assign to"
            value={tab}
            onChange={setTab}
            options={[
              { value: "student", label: "Student" },
              { value: "staff", label: "Staff" },
            ]}
          />
          {yearNotice}
          {tab === "student" ? (
            <>
              <MobileSelectField
                label="Class"
                placeholder={classOptions.length || isLoadingOverview ? "Select class" : "Every student already has a card"}
                disabled={!classOptions.length}
                value={classId}
                onChange={setClassId}
                options={classOptions}
              />
              {sectionOptions.length > 0 && (
                <MobileSelectField
                  label="Section"
                  placeholder="All sections"
                  disabled={!classId}
                  value={sectionId}
                  onChange={setSectionId}
                  options={sectionOptions}
                />
              )}
              <MobileSelectField
                label="Student"
                placeholder={studentPlaceholder}
                disabled={!classId || !studentOptions.length}
                value={studentId}
                onChange={setStudentId}
                options={studentOptions}
              />
            </>
          ) : (
            <MobileSelectField
              label="Staff member"
              placeholder={staffOptions.length || isLoadingOverview ? "Select staff" : "Every staff member already has a card"}
              disabled={!staffOptions.length}
              value={staffId}
              onChange={setStaffId}
              options={staffOptions}
            />
          )}
        </Div>
      </BottomSheet>
    );
  }

  return (
    <ResponsiveModalContainer isOpen={true} onClose={onClose} title="Assign Smart Card">
      <Div className="px-4 py-4">
        <Div type="col" gap="md">
          <Div type="col" gap="xs">
            <P size="xs" color="muted">Smart Card ID</P>
            <P color="default" className="font-mono font-medium">{event.r}</P>
          </Div>

          <Div type="row" gap="xs">
            {(["student", "staff"] as const).map((t) => (
              <Button
                key={t}
                size="xs"
                variant={tab === t ? "default" : "ghost"}
                onClick={() => setTab(t)}
                className="capitalize rounded-full"
              >
                {t}
              </Button>
            ))}
          </Div>

          {yearNotice}

          {tab === "student" && (
            <Div type="col" gap="sm">
              <FormField label="Class">
                <ResponsiveSelect
                  value={classId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassId(e.target.value)}
                  disabled={!classOptions.length}
                  customPlaceholder={classOptions.length || isLoadingOverview ? "Select class" : "Every student already has a card"}
                  options={classOptions}
                />
              </FormField>

              {sectionOptions.length > 0 && (
                <FormField label="Section">
                  <ResponsiveSelect
                    value={sectionId}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSectionId(e.target.value)}
                    disabled={!classId}
                    customPlaceholder="All sections"
                    options={sectionOptions}
                  />
                </FormField>
              )}

              <FormField label="Student">
                <ResponsiveSelect
                  value={studentId}
                  onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStudentId(e.target.value)}
                  disabled={!classId || !studentOptions.length}
                  customPlaceholder={studentPlaceholder}
                  options={studentOptions}
                />
              </FormField>
            </Div>
          )}

          {tab === "staff" && (
            <FormField label="Staff Member">
              <ResponsiveSelect
                value={staffId}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStaffId(e.target.value)}
                disabled={!staffOptions.length}
                customPlaceholder={staffOptions.length || isLoadingOverview ? "Select staff" : "Every staff member already has a card"}
                options={staffOptions}
              />
            </FormField>
          )}
        </Div>
      </Div>
      <Div type="row" className="flex justify-end gap-2 px-4 py-3 border-t border-border/30">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} disabled={!canAssign} loading={assigning}>
          Assign
        </Button>
      </Div>
    </ResponsiveModalContainer>
  );
}

export default function RfidSetupPage() {
  const { events, isLoading, refetch, assignCard, unassignCard } = useRfidEvents();
  const [assigningEvent, setAssigningEvent] = useState<RfidScanEvent | null>(null);
  const [seenCount, setSeenCount] = useState(0);

  // Deduplicate: one row per unique card ID, keeping the latest tap (events are newest-first)
  const uniqueEvents = Array.from(
    new Map(events.map((e) => [e.r, e])).values()
  );

  const newCount = uniqueEvents.length - seenCount;

  function handleRefresh() {
    refetch().then(() => setSeenCount(uniqueEvents.length));
  }

  // Mark all as seen on first load
  useEffect(() => {
    if (!isLoading && seenCount === 0 && uniqueEvents.length > 0) {
      setSeenCount(uniqueEvents.length);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  async function handleUnassign(event: RfidScanEvent) {
    if (!event.personType || !event.personId) return;
    const confirmed = await confirmAction({
      title: "Unassign this smart card?",
      description: `Card ${event.r} will no longer mark attendance for ${event.personName ?? "this person"}.`,
      confirmLabel: "Unassign",
      destructive: true,
    });
    if (!confirmed) return;
    await unassignCard(event.personType, event.personId);
  }

  return (
    <Div type="col" gap="lg">
     <PageHeader title="Smart Attendance"/>

      <FormCard title="Card Taps">
        <Div type="col" gap="sm">
          <Div type="row" justify="between" align="center">
            <Div type="row" gap="sm" align="center">
              <P color="muted">{uniqueEvents.length} card(s)</P>
              {newCount > 0 && (
                <Badge variant="info">
                  <Bell size={10} className="mr-1" />
                  {newCount} new tap{newCount > 1 ? "s" : ""}
                </Badge>
              )}
            </Div>
            <Button size="sm" variant="outline" onClick={handleRefresh} loading={isLoading}>
              <RefreshCw size={13} className="mr-1.5" />
              Refresh
            </Button>
          </Div>

          {uniqueEvents.length === 0 ? (
            <P color="muted">No taps received yet. Tap a card on a reader mapped to your school, then click Refresh.</P>
          ) : (
            <Div type="col" gap="sm">
              {uniqueEvents.map((event) => (
                <Div key={event.r} className="rounded-lg border border-border/50 p-3">
                  <Div type="row" justify="between" align="center">
                    <Div type="col" gap="xs">
                      <Div type="row" gap="sm" align="center">
                        <H3 color="default" className="font-mono">{event.r}</H3>
                        {event.personName && (
                          <Badge variant={event.personType === "staff" ? "primary" : "info"}>
                            {event.personType}
                          </Badge>
                        )}
                      </Div>
                      {event.personName ? (
                        <P size="xs" color="default" className="font-medium">{event.personName}</P>
                      ) : (
                        <P size="xs" color="muted">Unassigned</P>
                      )}
                      <P size="xs" color="muted">
                        {event.d} · {new Date(event.receivedAt).toLocaleString()}
                      </P>
                    </Div>

                    <Div type="row" gap="xs">
                      {event.personName ? (
                        <Button size="icon-xs" variant="ghost" onClick={() => handleUnassign(event)} title="Unassign">
                          <Link2Off size={14} />
                        </Button>
                      ) : (
                        <Button size="xs" variant="outline" onClick={() => setAssigningEvent(event)}>
                          <UserCheck size={12} className="mr-1" />
                          Assign
                        </Button>
                      )}
                    </Div>
                  </Div>
                </Div>
              ))}
            </Div>
          )}
        </Div>
      </FormCard>

      {assigningEvent && (
        <AssignModal
          event={assigningEvent}
          onClose={() => setAssigningEvent(null)}
          assignCard={assignCard}
        />
      )}
    </Div>
  );
}
