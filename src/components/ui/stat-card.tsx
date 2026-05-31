'use client';

import { CalendarDays, BookOpen, Users } from 'lucide-react';
import type { DashboardStatKey } from '@/constants';
import { Div } from './layout';
import { H2, P } from './typography';

const ICONS: Record<DashboardStatKey, React.ReactNode> = {
  'academic-years': <CalendarDays size={20} />,
  classes: <BookOpen size={20} />,
  students: <Users size={20} />,
};

interface StatCardProps {
  iconKey: DashboardStatKey;
  label: string;
  value: string;
  sub: string;
  onClick: () => void;
}

export function StatCard({ iconKey, label, value, sub, onClick }: StatCardProps) {
  return (
    <button
      onClick={onClick}
      className="rounded-xl border border-border bg-card p-5 text-left hover:bg-muted/40 transition-colors w-full"
    >
      <Div type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <P color="muted">{label}</P>
          <H2>{value}</H2>
          <P color="muted">{sub}</P>
        </Div>
        <Div type="row" align="center" justify="center" className="h-10 w-10 rounded-lg bg-muted text-muted-foreground">
          {ICONS[iconKey]}
        </Div>
      </Div>
    </button>
  );
}
