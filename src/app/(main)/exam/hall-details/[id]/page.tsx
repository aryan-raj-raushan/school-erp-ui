"use client";

import { use, Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { HallDetailFormContent } from "../hall-detail-form";

export default function HallDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <HallDetailFormContent slug={id} />
    </Suspense>
  );
}
