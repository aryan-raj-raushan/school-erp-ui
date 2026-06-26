"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { RoleDetail } from "../role-detail";

export default function CreateRolePage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <RoleDetail id="create-new" />
    </Suspense>
  );
}
