"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { StaffDetail } from "../staff-detail";

function StaffViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <StaffDetail id={id} />;
}

export default function StaffViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StaffViewContent />
    </Suspense>
  );
}
