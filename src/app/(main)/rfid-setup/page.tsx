"use client";

import React, { useState, useEffect } from "react";
import { RefreshCw, UserCheck, Link2Off, Bell } from "lucide-react";
import { Div } from "@/components/ui/layout";
import { H1, H3, P } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { FormCard } from "@/components/ui/form-card";
import { FormField, Select } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Modal, ModalBody, ModalFooter } from "@/components/ui/modal";
import { useRfidEvents } from "@/hooks/useRfidEvents";
import { useAssignRfidModal } from "@/hooks/useAssignRfidModal";
import type { RfidScanEvent } from "@/services/rfid.service";

function AssignModal({
  event,
  onClose,
  assignCard,
}: {
  event: RfidScanEvent;
  onClose: () => void;
  assignCard: (rfidCardId: string, personType: "staff" | "student", personId: string) => Promise<void>;
}) {
  const [tab, setTab] = useState<"student" | "staff">("student");
  const [assigning, setAssigning] = useState(false);

  const {
    years, classes, sections, studentList, staffList,
    yearId, setYearId,
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

  return (
    <Modal onClose={onClose} title="Assign RFID Card" size="md">
      <ModalBody>
        <Div type="col" gap="md">
          <Div type="col" gap="xs">
            <P size="xs" color="muted">RFID Card ID</P>
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

          {tab === "student" && (
            <Div type="col" gap="sm">
              <FormField label="Academic Year">
                <Select value={yearId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setYearId(e.target.value)}>
                  <option value="">Select academic year</option>
                  {years.map((y) => (
                    <option key={y.id} value={y.id}>{y.name}{y.is_current ? " (Current)" : ""}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Class">
                <Select value={classId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setClassId(e.target.value)} disabled={!yearId}>
                  <option value="">Select class</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Section">
                <Select value={sectionId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSectionId(e.target.value)} disabled={!classId}>
                  <option value="">Select section</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </Select>
              </FormField>

              <FormField label="Student">
                <Select value={studentId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStudentId(e.target.value)} disabled={!sectionId}>
                  <option value="">Select student</option>
                  {studentList.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.first_name} {s.last_name ?? ""}
                    </option>
                  ))}
                </Select>
              </FormField>
            </Div>
          )}

          {tab === "staff" && (
            <FormField label="Staff Member">
              <Select value={staffId} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStaffId(e.target.value)}>
                <option value="">Select staff</option>
                {staffList.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.first_name} {s.last_name ?? ""}{s.employee_code ? ` (${s.employee_code})` : ""}
                  </option>
                ))}
              </Select>
            </FormField>
          )}
        </Div>
      </ModalBody>
      <ModalFooter>
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button onClick={handleAssign} disabled={!canAssign} loading={assigning}>
          Assign
        </Button>
      </ModalFooter>
    </Modal>
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
    await unassignCard(event.personType, event.personId);
  }

  return (
    <Div type="col" gap="lg">
      <H1>RFID Setup</H1>

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
            <P color="muted">No taps received yet. Tap a card then click Refresh.</P>
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
