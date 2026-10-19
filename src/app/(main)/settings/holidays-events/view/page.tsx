"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Div, Spinner } from "@/components/ui";
import { HolidayEventDetail } from "../holiday-event-detail";

function HolidayEventViewContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id") ?? "";
  return <HolidayEventDetail id={id} />;
}

export default function HolidayEventViewPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <HolidayEventViewContent />
    </Suspense>
  );
}
