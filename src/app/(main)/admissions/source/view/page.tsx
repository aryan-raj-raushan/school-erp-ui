"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { AdmissionSourceDetail } from "../source-detail";

function SourceViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <AdmissionSourceDetail id={id} />;
}

export default function SourceViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <SourceViewContent />
    </Suspense>
  );
}
