"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { AdmissionEnquiryDetail } from "../enquiry-detail";

export default function CreateAdmissionEnquiryPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <AdmissionEnquiryDetail id="create-new" />
    </Suspense>
  );
}
