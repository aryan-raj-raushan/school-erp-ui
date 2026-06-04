'use client';

import { CalendarDays, BookOpen, Users } from 'lucide-react';
import type { DashboardStatKey } from '@/constants';
import { Div } from './layout';
import { H2, P } from './typography';
import { motion } from 'framer-motion';

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
    <motion.button
      onClick={onClick}
      whileHover={{ y: -4 }}
      whileTap={{ y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
    >
      <Div variant="glass" padding="p-5" type="row" justify="between" align="center">
        <Div type="col" gap="xs">
          <P color="muted">{label}</P>
          <H2>{value}</H2>
          <P color="muted">{sub}</P>
        </Div>
        {/* Theme-gradient icon circle — uses variant, no raw classnames */}
        <Div variant="theme-icon">
          {ICONS[iconKey]}
        </Div>
      </Div>
    </motion.button>
  );
}
