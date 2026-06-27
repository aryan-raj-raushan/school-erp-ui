"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { ExamFormContent } from "../exam-form";

export default function CreateExamPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ExamFormContent slug="create-new" />
    </Suspense>
  );
}
