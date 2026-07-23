"use client";

import { Suspense } from "react";
import { Div, Spinner } from "@/components/ui";
import { HolidayEventDetail } from "../holiday-event-detail";

export default function CreateHolidayEventPage() {
  return (
    <Suspense
      fallback={
        <Div type="row" justify="center" className="py-20">
          <Spinner size="lg" />
        </Div>
      }
    >
      <HolidayEventDetail id="create-new" />
    </Suspense>
  );
}
