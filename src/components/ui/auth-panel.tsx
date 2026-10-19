import * as React from 'react';
import Image from 'next/image';
import { GraduationCap } from 'lucide-react';
import { APP } from '@/constants';
import { Div } from './layout';
import { P, PanelHeading } from './typography';

/* ─────────────────────────────────────────────
   AuthLeftPanel
   Left half — gradient bg + large illustration
   + logo at top + tagline at bottom.
   No feature grid: "only carry image".
───────────────────────────────────────────── */
export function AuthLeftPanel() {
  return (
    <Div variant="auth-left-panel">
      {/* Decorative blobs */}
      <Div variant="auth-blob-tl" aria-hidden="true" />
      <Div variant="auth-blob-br" aria-hidden="true" />

      {/* Logo */}
      <Div variant="auth-panel-section" type="row" align="center" gap="sm">
        <Div variant="auth-panel-logo-box">
          <GraduationCap size={20} strokeWidth={2} color="rgba(0,0,0,0.72)" />
        </Div>
        <P color="default" size="base" weight="bold">{APP.name}</P>
      </Div>

      {/* Hero illustration — large, image only */}
      <Div variant="auth-panel-section" type="col" align="center" gap="none">
        <Image
          src="/illustrations/school.svg"
          alt="School ERP illustration"
          width={360}
          height={280}
          priority
        />
      </Div>

      {/* Bottom tagline */}
      <Div variant="auth-panel-section" type="col" align="center" gap="xs" center>
        <PanelHeading>
          Your school, fully<br />under control
        </PanelHeading>
        <P color="muted" size="sm">
          Academics, staff, students and insights — all in one place.
        </P>
      </Div>
    </Div>
  );
}

/* ─────────────────────────────────────────────
   AuthPageWrapper — full-screen split shell
   + forces light theme regardless of stored mode
───────────────────────────────────────────── */
export function AuthPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Div variant="auth-force-light" type="row" padding="h-dvh overflow-hidden">
      {children}
    </Div>
  );
}

/* ─────────────────────────────────────────────
   AuthRightPanel — right scrollable column
───────────────────────────────────────────── */
export function AuthRightPanel({ children }: { children: React.ReactNode }) {
  return (
    <Div type="col" grow padding="min-w-0 overflow-y-auto" style={{ WebkitOverflowScrolling: 'touch' }}>
      <Div
        type="col"
        align="center"
        justify="center"
        padding="min-h-full w-full px-4 sm:px-8 lg:px-14"
        style={{
          paddingTop: 'calc(var(--sat, 0px) + 1rem)',
          paddingBottom: 'calc(var(--sab, 0px) + 2.5rem)',
        }}
      >
        <Div type="col" align="center" gap="sm" padding="mb-4 lg:hidden">
          <Div variant="theme-icon-lg">
            <GraduationCap size={22} />
          </Div>
          <P color="default" size="xl" weight="bold">{APP.name}</P>
        </Div>

        <Div type="col" gap="none" padding="w-full max-w-[540px]">
          {children}
        </Div>
      </Div>
    </Div>
  );
}

/* ─────────────────────────────────────────────
   AuthCard — title + subtitle + card shell
───────────────────────────────────────────── */
interface AuthCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Div type="col" gap="md">
      <Div type="col" gap="xs">
        <P color="default" size="2xl" weight="bold">{title}</P>
        {subtitle && <P color="muted" size="sm">{subtitle}</P>}
      </Div>
      <Div variant="card" padding="p-4 sm:p-5">
        {children}
      </Div>
    </Div>
  );
}

/* ─────────────────────────────────────────────
   AuthOrSeparator — thin lines + "or" label
───────────────────────────────────────────── */
export function AuthOrSeparator() {
  return (
    <Div type="row" align="center" gap="sm">
      <Div grow padding="h-px bg-border/60" />
      <P color="muted" size="xs">or</P>
      <Div grow padding="h-px bg-border/60" />
    </Div>
  );
}
