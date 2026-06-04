import { Div } from './layout';
import { PageTitle, P } from './typography';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  return (
    <Div type="row" justify="between" align="start" gap="md" padding="mb-8">
      <Div type="col" gap="xs">
        <PageTitle>{title}</PageTitle>
        {subtitle && <P>{subtitle}</P>}
      </Div>
      {actions && (
        <Div type="row" gap="sm" align="center">
          {actions}
        </Div>
      )}
    </Div>
  );
}
