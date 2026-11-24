"use client";

import { useEffect } from "react";
import { AuthService } from "@/services/auth.service";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { useAuthStore } from "@/store/auth.store";

export function useProfileRefresh(ready: boolean) {
  const setAuth = useAuthStore((s) => s.setAuth);
  const setPermissions = useAuthStore((s) => s.setPermissions);

  useEffect(() => {
    if (!ready || !TokenStorage.isAuthenticated()) return;
    const context = TokenStorage.getContext();
    if (!context) return;
    let active = true;
    AuthService.getMe()
      .then((profile) => {
        if (!active) return;
        setAuth(profile, context);
        setPermissions(profile.permissions ?? []);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [ready, setAuth, setPermissions]);
}
