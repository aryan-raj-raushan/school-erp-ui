"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { StudentDetail } from "../student-detail";

export default function CreateStudentPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <StudentDetail id="create-new" />
    </Suspense>
  );
}
