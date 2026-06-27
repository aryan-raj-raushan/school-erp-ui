"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { StaffDetail } from "../staff-detail";

export default function CreateStaffPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StaffDetail id="create-new" />
    </Suspense>
  );
}
