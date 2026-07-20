"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ROUTES, STORAGE_KEYS } from "@/constants";
import { AuthContext } from "@/types";
import { TokenStorage } from "@/lib/api-gateway/token.storage";
import { initAppStorage } from "@/lib/app-storage";

const ALL_STORAGE_KEYS = [
  STORAGE_KEYS.accessToken,
  STORAGE_KEYS.refreshToken,
  STORAGE_KEYS.context,
  STORAGE_KEYS.isAuthenticated,
  STORAGE_KEYS.user,
  "auth:permissions",
];

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    initAppStorage(ALL_STORAGE_KEYS).then(() => {
      if (!TokenStorage.isAuthenticated() || TokenStorage.getContext() !== AuthContext.PARENT) {
        router.replace(ROUTES.login);
      }
    });
  }, [router]);

  return (
    <div style={{ minHeight: "100dvh" }} className="flex flex-col">
      {children}
    </div>
  );
}
