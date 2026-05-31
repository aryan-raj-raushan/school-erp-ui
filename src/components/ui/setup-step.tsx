'use client';

import { useRouter } from 'next/navigation';
import { Div } from './layout';
import { P } from './typography';
import { Button } from './button';

interface SetupStepProps {
  n: number;
  done: boolean;
  label: string;
  route: string;
  goLabel?: string;
}

export function SetupStep({ n, done, label, route, goLabel = 'Go' }: SetupStepProps) {
  const router = useRouter();
  return (
    <Div type="row" align="center" gap="md">
      <Div
        type="row"
        align="center"
        justify="center"
        className={`h-7 w-7 rounded-full text-xs font-bold shrink-0 ${
          done ? 'bg-emerald-500 text-white' : 'bg-muted text-muted-foreground'
        }`}
      >
        {done ? '✓' : String(n)}
      </Div>
      <P color={done ? 'muted' : 'default'}>{label}</P>
      {!done && (
        <Button size="sm" variant="outline" onClick={() => router.push(route)}>
          {goLabel}
        </Button>
      )}
    </Div>
  );
}
