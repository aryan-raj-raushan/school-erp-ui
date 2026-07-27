'use client';

import { ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui';
import { ROUTES } from '@/constants';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <EmptyState
      icon={<ShieldAlert size={28} />}
      title="You don't have access to this page"
      description="Your account doesn't have the permissions needed to view this section. Contact your school admin if you think this is a mistake."
      action={{ label: 'Back to dashboard', onClick: () => router.replace(ROUTES.dashboard) }}
    />
  );
}
