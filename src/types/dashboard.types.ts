import type { LucideIcon } from 'lucide-react';

export type DashAccent =
  | 'violet'
  | 'blue'
  | 'emerald'
  | 'amber'
  | 'pink'
  | 'indigo'
  | 'rose'
  | 'teal'
  | 'sky';

export interface DashKpi {
  key: string;
  label: string;
  value: string;
  sub: string;
  icon: LucideIcon;
  accent: DashAccent;
  href: string;
}

export interface DashAction {
  label: string;
  icon: LucideIcon;
  href: string;
  accent: DashAccent;
}

export interface DashListItem {
  id: string;
  title: string;
  meta: string;
}

export type DashAlertTone = 'warn' | 'danger' | 'info';

export interface DashAlert {
  id: string;
  label: string;
  value: string;
  tone: DashAlertTone;
  href: string;
}

export interface DashSlice {
  name: string;
  value: number;
}

export interface DashBarRow {
  label: string;
  value: number;
}

export interface DashTrendPoint {
  label: string;
  present: number;
  absent: number;
}

export interface DashHeroChip {
  icon: LucideIcon;
  label: string;
}

export interface DashHeroStat {
  label: string;
  value: string;
  sub: string;
  percent: number | null;
}
