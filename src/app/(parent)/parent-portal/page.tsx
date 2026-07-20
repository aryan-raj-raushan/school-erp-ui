"use client";

import { useAuthStore } from "@/store/auth.store";
import { useAuth } from "@/hooks/useAuth";
import { Div, H1, P, Button } from "@/components/ui";

export default function ParentPortalPage() {
  const { user } = useAuthStore();
  const { logout, isLoading } = useAuth();

  return (
    <Div
      type="col"
      align="center"
      justify="center"
      gap="md"
      className="flex-1 p-6 text-center"
    >
      <H1>Welcome{user?.first_name ? `, ${user.first_name}` : ""}</H1>
      <P color="muted" className="max-w-md">
        The parent portal is coming soon. You&apos;re logged in — check back
        here for your child&apos;s attendance, homework, fees, and more.
      </P>
      <Button onClick={() => logout()} loading={isLoading} variant="outline">
        Log out
      </Button>
    </Div>
  );
}
