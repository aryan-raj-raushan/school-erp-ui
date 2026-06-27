"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { HallDetailFormContent } from "../hall-detail-form";

function CreateHallDetailContent() {
  return <HallDetailFormContent slug="create-new" />;
}

export default function CreateHallDetailPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <CreateHallDetailContent />
    </Suspense>
  );
}
