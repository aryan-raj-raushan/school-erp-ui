import Image from 'next/image';
import { Div } from './layout';
import { PageTitle, P } from './typography';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  illustration?: string;
}

export function PageHeader({ title, subtitle, actions, illustration }: PageHeaderProps) {
  return (
    <Div type="row" justify="between" align="center" gap="md" padding="mb-8">
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
          {subtitle && <P>{subtitle}</P>}
        </Div>
      </Div>
      {actions && (
        <Div type="row" gap="sm" align="center">
          {actions}
        </Div>
      )}
    </Div>
  );
}
