import Link from 'next/link';
import { ROUTES, LEGAL_LINKS } from '@/constants';
import { Div } from './layout';

export function LegalLinks() {
  return (
    <Div type="row" justify="center" align="center" gap="sm">
      <Link href={ROUTES.termsAndConditions} className="text-xs text-muted-foreground hover:underline">
        {LEGAL_LINKS.termsAndConditions}
      </Link>
      <span className="text-xs text-muted-foreground" aria-hidden="true">·</span>
      <Link href={ROUTES.privacyPolicy} className="text-xs text-muted-foreground hover:underline">
        {LEGAL_LINKS.privacyPolicy}
      </Link>
    </Div>
  );
}
