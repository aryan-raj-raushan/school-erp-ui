"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { HallDetailFormContent } from "../hall-detail-form";

function CreateHallDetailContent() {
  const searchParams = useSearchParams();
  const defaultPlanId = searchParams.get("hall_plan_id") ?? undefined;
  return <HallDetailFormContent slug="create-new" defaultPlanId={defaultPlanId} />;
}

export default function CreateHallDetailPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <CreateHallDetailContent />
    </Suspense>
  );
}
