import { APP } from '@/constants';
import { Div } from '@/components/ui/layout';
import { H1, P } from '@/components/ui/typography';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Div
      type="col"
      align="center"
      justify="center"
      padding="min-h-screen bg-background px-4"
    >
      <Div type="col" padding="w-full max-w-md" gap="none">
        <Div type="col" align="center" padding="mb-8" gap="xs">
          <H1>{APP.name}</H1>
          <P color="muted">{APP.tagline}</P>
        </Div>
        <Div variant="card" padding="p-8">
          {children}
        </Div>
      </Div>
    </Div>
  );
}
