import { Div } from './layout';
import { P } from './typography';

interface InfoRowProps {
  label: string;
  value: string;
}

export function InfoRow({ label, value }: InfoRowProps) {
  return (
    <Div type="row" justify="between" gap="md">
      <P color="muted">{label}</P>
      <P color="default">{value}</P>
    </Div>
  );
}
