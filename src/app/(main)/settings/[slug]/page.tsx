'use client';

import { notFound } from 'next/navigation';
import { Div } from '@/components/ui/layout';
import { H1, P } from '@/components/ui/typography';
import { SETTINGS_ITEMS } from '@/constants/settings';

interface SettingsSlugPageProps {
  params: { slug: string };
}

export default function SettingsSlugPage({ params }: SettingsSlugPageProps) {
  const item = SETTINGS_ITEMS.find((s) => s.slug === params.slug);
  if (!item) notFound();

  return (
    <Div type="col" gap="lg">
      {/* Page header */}
      <Div type="col" gap="xs">
        <Div type="row" align="center" gap="sm">
          <Div
            type="row"
            align="center"
            justify="center"
            className="h-8 w-8 rounded-lg bg-muted text-muted-foreground shrink-0"
          >
            <item.icon size={16} />
          </Div>
          <H1>{item.label}</H1>
        </Div>
        <P color="muted">{item.description}</P>
      </Div>

      {/* ── Drop your real content here ─────────────────────────────── */}
      <Div
        type="col"
        className="rounded-xl border border-border bg-card p-6 min-h-[300px] items-center justify-center"
      >
        <P color="muted" className="text-xs">
          {item.label} content goes here.
        </P>
      </Div>
    </Div>
  );
}