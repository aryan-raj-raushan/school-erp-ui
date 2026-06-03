import { notFound } from 'next/navigation';
import { Div } from '@/components/ui/layout';
import { H1, P } from '@/components/ui/typography';
import { SETTINGS_ITEMS } from '@/constants/settings';

interface SettingsSlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SettingsSlugPage({
  params,
}: SettingsSlugPageProps) {
  const { slug } = await params;

  const item = SETTINGS_ITEMS.find((s) => s.slug === slug);

  if (!item) {
    notFound();
  }

  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <Div type="row" align="center" gap="sm">
          <Div
            type="row"
            align="center"
            justify="center"
            className="h-8 w-8 shrink-0 rounded-lg bg-muted text-muted-foreground"
          >
            <item.icon size={16} />
          </Div>
          <H1>{item.label}</H1>
        </Div>

        <P color="muted">{item.description}</P>
      </Div>

      <Div
        type="col"
        className="min-h-[300px] items-center justify-center rounded-xl border border-border bg-card p-6"
      >
        <P color="muted" className="text-xs">
          {item.label} content goes here.
        </P>
      </Div>
    </Div>
  );
}