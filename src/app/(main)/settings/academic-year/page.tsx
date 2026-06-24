'use client';

import { CalendarDays } from 'lucide-react';
import { Div } from '@/components/ui/layout';
import { H1, P } from '@/components/ui/typography';

export default function AcademicYearSettingsPage() {
  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <Div type="row" align="center" gap="sm">
          <Div variant="icon-muted">
            <CalendarDays size={16} />
          </Div>
          <H1>Academic Year</H1>
        </Div>
        <P color="muted">Manage academic years, start &amp; end dates, and active terms.</P>
      </Div>

      <Div variant="card" type="col" align="center" justify="center" padding="p-6 min-h-[300px]">
        <P color="muted" size="xs">Academic Year content goes here.</P>
      </Div>
    </Div>
  );
}
