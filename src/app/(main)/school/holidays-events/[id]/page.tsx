"use client";

import { use, Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { HolidayEventDetail } from "../holiday-event-detail";

export default function HolidayEventDetailPage({
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
      <HolidayEventDetail id={id} />
    </Suspense>
  );
}
