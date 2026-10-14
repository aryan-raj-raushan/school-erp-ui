import type { Metadata } from 'next';
import { APP, PRIVACY_POLICY } from '@/constants';
import { LegalPage } from '@/components/ui';

export const metadata: Metadata = {
  title: `${PRIVACY_POLICY.title} | ${APP.name}`,
};

export default function PrivacyPolicyPage() {
  return <LegalPage document={PRIVACY_POLICY} />;
}
