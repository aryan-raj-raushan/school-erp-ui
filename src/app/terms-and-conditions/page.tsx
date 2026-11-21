import type { Metadata } from 'next';
import { APP, TERMS_AND_CONDITIONS } from '@/constants';
import { LegalPage } from '@/components/ui';

export const metadata: Metadata = {
  title: `${TERMS_AND_CONDITIONS.title} | ${APP.name}`,
};

export default function TermsAndConditionsPage() {
  return <LegalPage document={TERMS_AND_CONDITIONS} />;
}
