"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { AdmissionEnquiryDetail } from "../enquiry-detail";

function EnquiryViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <AdmissionEnquiryDetail id={id} />;
}

export default function EnquiryViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <EnquiryViewContent />
    </Suspense>
  );
}
