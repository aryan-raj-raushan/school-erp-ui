"use client";

import { use, Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { StudentDetail } from "../student-detail";

export default function StudentDetailPage({
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
      <StudentDetail id={id} />
    </Suspense>
  );
}
