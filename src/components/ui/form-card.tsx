import * as React from 'react';
import { AlertTriangle } from 'lucide-react';
import { P } from './typography';

interface FormCardProps {
  title: string;
  children: React.ReactNode;
}

export function FormCard({ title, children }: FormCardProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card p-5">
      <P color="default" weight="semibold" className="mb-4">{title}</P>
      {children}
    </div>
  );
}

interface SectionCardProps {
  title?: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export function SectionCard({ title, subtitle, actions, children }: SectionCardProps) {
  return (
    <div className="rounded-xl border border-border/50 bg-card overflow-hidden">
      {(title || actions) && (
        <div className="px-5 py-3 border-b border-border/50 bg-muted/20 flex items-center justify-between">
          <div>
            {title && <P color="default" weight="semibold">{title}</P>}
            {subtitle && <P size="xs">{subtitle}</P>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

interface WarnBannerProps {
  children: React.ReactNode;
}

export function WarnBanner({ children }: WarnBannerProps) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900/40 dark:bg-amber-950/20">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-500" />
      <p className="text-sm text-amber-700 dark:text-amber-400">{children}</p>
    </div>
  );
}
