"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { EXAM_ROUTES } from "@/constants/exam.constants";
import { Div, Spinner } from "@/components/ui";

export default function SittingPlanCreateRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace(EXAM_ROUTES.sittingPlan.list);
  }, [router]);

  return (
    <Div type="row" justify="center" className="py-20">
      <Spinner size="lg" />
    </Div>
  );
}
