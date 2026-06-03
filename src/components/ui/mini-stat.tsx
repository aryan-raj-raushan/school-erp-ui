import * as React from 'react';
import { Div } from './layout';
import { P } from './typography';

type StatColor = 'default' | 'green' | 'red' | 'yellow';

interface MiniStatProps {
  label: string;
  value: React.ReactNode;
  color?: StatColor;
}

export function MiniStat({ label, value, color = 'default' }: MiniStatProps) {
  const labelColor = color === 'default' ? 'muted' : color;
  const valueColor = color === 'default' ? 'default' : color;

  return (
    <Div color={color} type="col" gap="xs">
      <P size="xs" color={labelColor as any}>{label}</P>
      <P size="sm" weight="semibold" color={valueColor as any}>{value as string}</P>
    </Div>
  );
}
