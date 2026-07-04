"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { GradingBulkFormContent } from "../grading-bulk-form";

export default function CreateGradingPage() {
  return (
    <Suspense fallback={<Div type="row" justify="center" className="py-20"><Spinner size="lg" /></Div>}>
      <GradingBulkFormContent />
    </Suspense>
  );
}
