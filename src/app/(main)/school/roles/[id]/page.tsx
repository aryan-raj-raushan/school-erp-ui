"use client";

import { use, Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { RoleDetail } from "../role-detail";

export default function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <RoleDetail id={id} />
    </Suspense>
  );
}
