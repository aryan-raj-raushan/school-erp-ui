"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { StudentDetail } from "../student-detail";

function StudentViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <StudentDetail id={id} />;
}

export default function StudentDetailPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StudentViewContent />
    </Suspense>
  );
}
