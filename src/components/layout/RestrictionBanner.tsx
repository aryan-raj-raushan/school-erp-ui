'use client';

import Link from 'next/link';
import { AuthContext } from '@/types';
import { useAuthStore } from '@/store/auth.store';
import { useSchoolBrandStore } from '@/store/school.store';
import { Div, P, Button } from '@/components/ui';

const LEVEL_COPY: Record<string, { title: string; className: string }> = {
  SOFT: {
    title: 'Some modules are restricted due to an overdue invoice.',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  PARTIAL: {
    title: 'This school is in read-only mode due to an overdue invoice.',
    className: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/30',
  },
  COMPLETE: {
    title: "This school's access has been suspended due to an overdue invoice.",
    className: 'bg-destructive/10 text-destructive border-destructive/30',
  },
};

export function RestrictionBanner() {
  const context = useAuthStore((s) => s.context);
  const brand = useSchoolBrandStore((s) => s.brand);

  if (context !== AuthContext.SCHOOL) return null;
  const level = brand?.restriction_level;
  if (!level || level === 'NONE') return null;

  const copy = LEVEL_COPY[level];
  if (!copy) return null;

  return (
    <Div
      type="row"
      gap="sm"
      className={`items-center justify-between border-b px-4 py-2 ${copy.className}`}
    >
      <P className="text-sm font-medium">{copy.title}</P>
      <Link href="/invoices">
        <Button size="sm" variant="outline">View Invoices</Button>
      </Link>
    </Div>
  );
}
