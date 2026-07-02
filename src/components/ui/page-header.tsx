import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Div, PageActions } from './layout';
import { PageTitle, P } from './typography';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  illustration?: string;
  /** Pins the header to the top of the scrolling container — use on long forms so actions stay reachable. */
  sticky?: boolean;
}

/**
 * Responsive page header.
 * Mobile: title stacks above actions.
 * sm+: title left, actions right (via .page-header CSS class).
 */
export function PageHeader({ title, subtitle, actions, illustration, sticky }: PageHeaderProps) {
  return (
    <Div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        sticky && 'sticky top-0 z-20 -mt-4 sm:-mt-5 md:-mt-5 bg-background/95 backdrop-blur-sm border-b border-border/60 py-3',
      )}
    >
      <Div type="row" align="center" gap="md">
        {illustration && (
          <Image
            src={illustration}
            alt=""
            width={56}
            height={56}
            className="shrink-0 select-none opacity-90"
            draggable={false}
          />
        )}
        <Div type="col" gap="xs">
          <PageTitle>{title}</PageTitle>
          {subtitle && <P color="muted">{subtitle}</P>}
        </Div>
      </Div>
      {actions && <PageActions>{actions}</PageActions>}
    </Div>
  );
}
