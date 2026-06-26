"use client";

import { use, Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { SittingPlanFormContent } from "../sitting-plan-form";

export default function SittingPlanDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <SittingPlanFormContent slug={id} />
    </Suspense>
  );
}
