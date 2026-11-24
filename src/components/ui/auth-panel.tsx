import * as React from 'react';
import { BarChart3, CalendarCheck2, IndianRupee, ShieldCheck, Smartphone, Users } from 'lucide-react';
import { APP } from '@/constants';
import { Div } from './layout';
import { BrandLogo } from './brand-logo';
import { P } from './typography';

const HIGHLIGHTS = [
  { icon: CalendarCheck2, title: 'Smart attendance', text: 'RFID, app punch and manual marking in one register' },
  { icon: IndianRupee, title: 'Fees straight to your account', text: 'Parents pay by UPI, money lands with the school' },
  { icon: Smartphone, title: 'Parent app included', text: 'Homework, results and notices on every phone' },
] as const;

function PreviewStat({
  icon: Icon,
  label,
  value,
  className,
}: {
  icon: React.ComponentType<{ size?: number }>;
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div
      className={`flex items-center gap-3 rounded-2xl border border-white/50 bg-white/70 px-4 py-3 shadow-[0_18px_40px_-18px_rgba(0,0,0,0.35)] backdrop-blur-md ${className ?? ''}`}
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[var(--theme-gradient-from)] text-[var(--theme-active-text)]">
        <Icon size={18} />
      </span>
      <div>
        <p className="text-[11px] font-medium text-neutral-500">{label}</p>
        <p className="text-base font-bold text-neutral-900">{value}</p>
      </div>
    </div>
  );
}

export function AuthLeftPanel() {
  return (
    <div
      className="relative hidden w-[46%] max-w-[760px] shrink-0 flex-col justify-between overflow-hidden p-10 lg:flex xl:p-14"
      style={{ background: 'linear-gradient(150deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)' }}
    >
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/25 blur-2xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-white/20 blur-3xl" />

      <div className="relative flex items-center gap-3">
        <BrandLogo size={40} />
        <span className="text-lg font-bold text-neutral-900">{APP.name}</span>
      </div>

      <div className="relative flex flex-col gap-8">
        <div>
          <h2 className="max-w-md text-4xl font-extrabold leading-[1.1] tracking-tight text-neutral-900 xl:text-5xl">
            Run your whole school from one place.
          </h2>
          <p className="mt-4 max-w-md text-base text-neutral-800/80">
            Admissions, attendance, fees, exams and parents — connected, simple and fast.
          </p>
        </div>

        <div className="relative h-44 max-w-md">
          <PreviewStat icon={Users} label="Present today" value="96.4%" className="absolute left-0 top-0" />
          <PreviewStat icon={IndianRupee} label="Fees collected this month" value="₹4,28,500" className="absolute right-0 top-14" />
          <PreviewStat icon={BarChart3} label="Exam results published" value="12 classes" className="absolute bottom-0 left-10" />
        </div>

        <ul className="flex max-w-md flex-col gap-4">
          {HIGHLIGHTS.map(({ icon: Icon, title, text }) => (
            <li key={title} className="flex items-start gap-3">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/40 text-neutral-900">
                <Icon size={16} />
              </span>
              <span>
                <span className="block text-sm font-semibold text-neutral-900">{title}</span>
                <span className="block text-sm text-neutral-800/75">{text}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative flex items-center gap-2 text-xs font-medium text-neutral-800/70">
        <ShieldCheck size={14} /> Verified mobile sign-in · Data encrypted in transit
      </p>
    </div>
  );
}

export function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Div variant="auth-force-light" type="row" padding="h-dvh overflow-hidden bg-background">
      {children}
    </Div>
  );
}

export function AuthRightPanel({ children }: { children: React.ReactNode }) {
  return (
    <Div type="col" grow padding="min-w-0 overflow-y-auto overflow-x-hidden" style={{ WebkitOverflowScrolling: 'touch' }}>
      <div
        className="relative shrink-0 overflow-hidden px-6 pb-14 lg:hidden"
        style={{
          background: 'linear-gradient(150deg, var(--theme-gradient-from) 0%, var(--theme-gradient-to) 100%)',
          paddingTop: 'calc(var(--sat, 0px) + 1.75rem)',
        }}
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-white/25 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <BrandLogo size={44} />
          <div>
            <p className="text-lg font-bold leading-tight text-neutral-900">{APP.name}</p>
            <p className="text-xs text-neutral-800/75">Smart school management</p>
          </div>
        </div>
      </div>

      <div
        className="relative -mt-8 flex w-full flex-1 flex-col items-center rounded-t-[28px] bg-background px-5 pt-7 sm:px-8 lg:mt-0 lg:justify-center lg:rounded-none lg:px-14 lg:pt-10"
        style={{ paddingBottom: 'calc(var(--sab, 0px) + 2rem)' }}
      >
        <div className="w-full max-w-[460px]">{children}</div>
      </div>
    </Div>
  );
}

interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Div type="col" gap="lg">
      <Div type="col" gap="xs">
        <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {subtitle && <P color="muted" size="sm">{subtitle}</P>}
      </Div>
      {children}
    </Div>
  );
}

export function AuthOrSeparator() {
  return (
    <Div type="row" align="center" gap="sm">
      <Div grow padding="h-px bg-border/60" />
      <P color="muted" size="xs">or</P>
      <Div grow padding="h-px bg-border/60" />
    </Div>
  );
}

const NOTICE_TONES = {
  info: 'border-sky-200 bg-sky-50 text-sky-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
  error: 'border-rose-200 bg-rose-50 text-rose-900',
} as const;

export function AuthNotice({ tone = 'info', children }: { tone?: keyof typeof NOTICE_TONES; children: React.ReactNode }) {
  return (
    <div role="alert" className={`rounded-xl border px-3.5 py-3 text-sm ${NOTICE_TONES[tone]}`}>
      {children}
    </div>
  );
}
