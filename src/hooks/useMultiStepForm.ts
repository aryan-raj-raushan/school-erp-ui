"use client";

import { useState } from "react";
import { get, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";
import { scrollToFirstInvalidField } from "@/hooks/useScrollToFirstError";

export interface FormStep<T extends FieldValues> {
  id: string;
  label: string;
  /** Form fields (or field groups) validated before leaving this step. */
  fields: ReadonlyArray<Path<T>>;
}

interface Options<T extends FieldValues> {
  form: UseFormReturn<T>;
  steps: ReadonlyArray<FormStep<T>>;
  /** Runs the real submit (validation + API call). */
  submit: () => Promise<unknown> | unknown;
}

const SCROLL_AFTER_TRIGGER_MS = 50;

function scrollPageToTop() {
  document.querySelector("main")?.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * Step state for a multi-step react-hook-form form: validates only the
 * current step on `next()`, flags steps that contain errors, and after a
 * failed `submit()` jumps to the first step that has one.
 */
export function useMultiStepForm<T extends FieldValues>({
  form,
  steps,
  submit,
}: Options<T>) {
  const [activeId, setActiveId] = useState(steps[0].id);
  const { errors } = form.formState;

  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId),
  );

  const progress = steps.map((step) => ({
    id: step.id,
    label: step.label,
    hasError: step.fields.some((field) => Boolean(get(errors, field))),
  }));

  function goTo(id: string) {
    setActiveId(id);
    scrollPageToTop();
  }

  async function next() {
    const valid = await form.trigger([...steps[activeIndex].fields]);
    if (!valid) {
      setTimeout(scrollToFirstInvalidField, SCROLL_AFTER_TRIGGER_MS);
      return;
    }
    const target = steps[activeIndex + 1];
    if (target) goTo(target.id);
  }

  function back() {
    const target = steps[activeIndex - 1];
    if (target) goTo(target.id);
  }

  async function submitAll() {
    await submit();
    const failing = steps.find((step) =>
      step.fields.some((field) => form.getFieldState(field).invalid),
    );
    if (failing) setActiveId(failing.id);
  }

  return {
    activeId,
    activeIndex,
    isFirst: activeIndex === 0,
    isLast: activeIndex === steps.length - 1,
    progress,
    goTo,
    next,
    back,
    submit: submitAll,
  };
}
