'use client';

import { DoorOpen } from 'lucide-react';
import { Div } from '@/components/ui/layout';
import { H1, P } from '@/components/ui/typography';

export default function RoomNameSettingsPage() {
  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <Div type="row" align="center" gap="sm">
          <Div variant="icon-muted">
            <DoorOpen size={16} />
          </Div>
          <H1>Room Name</H1>
        </Div>
        <P color="muted">Add and organise rooms used for scheduling and allocation.</P>
      </Div>

      <Div variant="card" type="col" align="center" justify="center" padding="p-6 min-h-[300px]">
        <P color="muted" size="xs">Room Name content goes here.</P>
      </Div>
    </Div>
  );
}
