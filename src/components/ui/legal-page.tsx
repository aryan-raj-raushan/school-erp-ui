'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, GraduationCap } from 'lucide-react';
import { APP, ROUTES, LEGAL_LINKS, type LegalDocument } from '@/constants';
import { useSwipeBack } from '@/hooks/useSwipeBack';
import { Div } from './layout';
import { H2, P } from './typography';

/* ─────────────────────────────────────────────
   LegalPage — public, scrollable document page
   (privacy policy, terms). Forces light theme
   to match the auth screens.
───────────────────────────────────────────── */
export function LegalPage({ document }: { document: LegalDocument }) {
  const router = useRouter();
  useSwipeBack(ROUTES.login);

  const handleBack = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (window.history.length > 1) {
      e.preventDefault();
      router.back();
    }
  };

  return (
    <Div
      variant="auth-force-light"
      type="col"
      align="center"
      padding="min-h-screen px-4 pb-8 sm:px-8"
      style={{ paddingTop: 'calc(var(--sat, 0px) + 1.5rem)' }}
    >
      <Div type="col" gap="lg" padding="w-full max-w-3xl">
        <Div type="row" align="center" justify="between" gap="sm">
          <Div type="row" align="center" gap="sm">
            <Div variant="theme-icon">
              <GraduationCap size={18} />
            </Div>
            <P color="default" size="base" weight="bold">{APP.name}</P>
          </Div>
          <Link
            href={ROUTES.login}
            onClick={handleBack}
            className="inline-flex min-h-11 items-center gap-1 px-2 text-sm text-muted-foreground hover:underline"
          >
            <ArrowLeft size={14} />
            {LEGAL_LINKS.backToLogin}
          </Link>
        </Div>

        <Div variant="card" type="col" gap="lg" padding="p-5 sm:p-8">
          <Div type="col" gap="xs">
            <P color="default" size="2xl" weight="bold">{document.title}</P>
            <P color="muted" size="xs">Last updated: {document.lastUpdated}</P>
          </Div>

          <P color="primary" size="sm" className="leading-relaxed">{document.intro}</P>

          {document.sections.map((section) => (
            <Div key={section.heading} type="col" gap="sm">
              <H2 className="text-base">{section.heading}</H2>
              {section.bullets && (
                <ul className="list-disc space-y-1.5 pl-5 text-sm leading-relaxed text-foreground/80">
                  {section.bullets.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              )}
              {section.paragraphs?.map((text) => (
                <P key={text} color="primary" size="sm" className="leading-relaxed">{text}</P>
              ))}
            </Div>
          ))}
        </Div>
      </Div>
    </Div>
  );
}
