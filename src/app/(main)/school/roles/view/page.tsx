"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { RoleDetail } from "../role-detail";

function RoleViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <RoleDetail id={id} />;
}

export default function RoleViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <RoleViewContent />
    </Suspense>
  );
}
