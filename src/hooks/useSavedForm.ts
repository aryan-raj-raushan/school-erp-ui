"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValues, UseFormReturn } from "react-hook-form";

const DEFAULT_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24h

interface UseSavedFormOptions<T extends FieldValues> {
  /** Unique key from `FORM_STORAGE_KEYS` — never inline a raw string. */
  key: string;
  /** The react-hook-form instance whose values should be saved/restored. */
  form: UseFormReturn<T>;
  /** Set to false to skip persistence entirely (e.g. while editing). */
  enabled?: boolean;
  /** Debounce between form changes and the localStorage write. Defaults to 600ms. */
  debounceMs?: number;
  /** Drafts older than this are treated as stale and silently discarded. Defaults to 24h. */
  maxAgeMs?: number;
  /** Strip fields that shouldn't be written to disk (e.g. passwords) before saving. */
  sanitize?: (values: T) => T;
}

interface DraftEnvelope<T> {
  savedAt: number;
  values: T;
}

function readEnvelope<T>(key: string): DraftEnvelope<T> | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as DraftEnvelope<T>) : null;
  } catch {
    return null;
  }
}

function writeEnvelope<T>(key: string, values: T) {
  if (typeof window === "undefined") return;
  try {
    const envelope: DraftEnvelope<T> = { savedAt: Date.now(), values };
    window.localStorage.setItem(key, JSON.stringify(envelope));
  } catch {
    // storage full / disabled — persistence is a nice-to-have, fail silently
  }
}

function removeDraft(key: string) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

/**
 * Persists an in-progress "create" form to localStorage so a user who
 * accidentally cancels or navigates away can resume where they left off
 * next time they open the form. Only meant for create forms — edit forms
 * already hydrate their state from the server, so there's nothing to resume.
 *
 * Usage:
 *   const savedForm = useSavedForm({ key: FORM_STORAGE_KEYS.STUDENT_CREATE, form, enabled: isNew });
 *   // render a banner when savedForm.hasDraft is true, offering
 *   // savedForm.restoreDraft() / savedForm.discardDraft()
 *   // call savedForm.clearSavedForm() once the form is submitted successfully
 */
export function useSavedForm<T extends FieldValues>({
  key,
  form,
  enabled = true,
  debounceMs = 600,
  maxAgeMs = DEFAULT_MAX_AGE_MS,
  sanitize,
}: UseSavedFormOptions<T>) {
  const [hasDraft, setHasDraft] = useState(false);
  // Persistence is paused until the user has decided whether to restore or
  // discard a previously found draft — otherwise the form's blank default
  // values would overwrite the draft before they get a chance to choose.
  const [isResolved, setIsResolved] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    // One-off read from an external system (localStorage) on mount — must
    // run in an effect since it isn't available during SSR.
    if (!enabled) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsResolved(true);
      return;
    }
    const envelope = readEnvelope<T>(key);
    if (envelope && Date.now() - envelope.savedAt <= maxAgeMs) {
      setHasDraft(true);
    } else {
      if (envelope) removeDraft(key); // stale — clean up so it doesn't resurface
      setIsResolved(true);
    }
  }, [key, enabled, maxAgeMs]);

  useEffect(() => {
    if (!enabled || !isResolved) return;
    const subscription = form.watch((values) => {
      if (!form.formState.isDirty) return;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => {
        const payload = sanitize ? sanitize(values as T) : (values as T);
        writeEnvelope(key, payload);
      }, debounceMs);
    });
    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, key, enabled, isResolved, debounceMs]);

  const restoreDraft = useCallback(() => {
    const envelope = readEnvelope<T>(key);
    if (envelope) form.reset(envelope.values);
    setHasDraft(false);
    setIsResolved(true);
  }, [key, form]);

  const discardDraft = useCallback(() => {
    removeDraft(key);
    setHasDraft(false);
    setIsResolved(true);
  }, [key]);

  /** Call once the form has been submitted successfully. */
  const clearSavedForm = useCallback(() => {
    removeDraft(key);
  }, [key]);

  return {
    /** Whether a previously saved draft was found and awaits a restore/discard decision. */
    hasDraft,
    restoreDraft,
    discardDraft,
    clearSavedForm,
  };
}
