"use client";

import { useState } from "react";

export interface StepperStep {
  id: string;
  label: string;
}

function scrollPageToTop() {
  document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Plain step navigation for multi-step forms that don't use react-hook-form
 * (see `useMultiStepForm` for the validated variant). The returned props
 * plug straight into `MultiStepForm`.
 */
export function useStepper(steps: ReadonlyArray<StepperStep>) {
  const [activeId, setActiveId] = useState(steps[0].id);

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId),
  );

  function goTo(id: string) {
    setActiveId(id);
    scrollPageToTop();
  }

  function next() {
    const target = steps[activeIndex + 1];
    if (target) goTo(target.id);
  }

  function back() {
    const target = steps[activeIndex - 1];
    if (target) goTo(target.id);
  }

  return {
    activeId,
    activeIndex,
    isFirst: activeIndex === 0,
    isLast: activeIndex === steps.length - 1,
    progress: steps.map((step) => ({ id: step.id, label: step.label, hasError: false })),
    goTo,
    next,
    back,
  };
}
