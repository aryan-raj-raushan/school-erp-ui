import { AuthLeftPanel, AuthPageWrapper, AuthRightPanel } from '@/components/ui';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthPageWrapper>
      <AuthLeftPanel />
      <AuthRightPanel>
        {children}
      </AuthRightPanel>
    </AuthPageWrapper>
  );
}
