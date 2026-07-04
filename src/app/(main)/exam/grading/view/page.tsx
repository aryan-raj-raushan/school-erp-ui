"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { GradingFormContent } from "../grading-form";

function GradingViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <GradingFormContent slug={id} />;
}

export default function GradingViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <GradingViewContent />
    </Suspense>
  );
}
