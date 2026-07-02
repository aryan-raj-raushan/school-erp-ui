"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { ExamFormContent } from "../exam-form";

function ExamViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "create-new";
  return <ExamFormContent slug={id} />;
}

export default function ExamViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ExamViewContent />
    </Suspense>
  );
}
