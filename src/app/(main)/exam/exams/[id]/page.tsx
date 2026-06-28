"use client";

import { use, Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { ExamFormContent } from "../exam-form";

export default function ExamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <ExamFormContent slug={id} />
    </Suspense>
  );
}
