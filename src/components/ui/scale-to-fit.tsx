"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface ScaleToFitProps {
  /** Natural (unscaled) width of the content in px. */
  width: number;
  children: React.ReactNode;
  className?: string;
}

/**
 * Shrinks fixed-width content (cards, certificates, previews) to fit the
 * available width, preserving aspect ratio and centring it. Never scales
 * up. The scaled height is measured from the content, so taller-than-
 * expected content never overflows. Scaling is switched off for printing.
 */
export function ScaleToFit({ width, children, className }: ScaleToFitProps) {
  const wrapperRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const [scale, setScale] = React.useState(1);
  const [contentHeight, setContentHeight] = React.useState<number>();

  React.useLayoutEffect(() => {
    const wrapper = wrapperRef.current;
    const content = contentRef.current;
    if (!wrapper || !content) return;
    const measure = () => {
      setScale(Math.min(1, wrapper.clientWidth / width));
      setContentHeight(content.offsetHeight);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(wrapper);
    observer.observe(content);
    return () => observer.disconnect();
  }, [width]);

  return (
    <div
      ref={wrapperRef}
      className={cn("mx-auto w-full", className)}
      style={{
        maxWidth: width,
        height: contentHeight === undefined ? undefined : contentHeight * scale,
      }}
    >
      <div
        ref={contentRef}
        className="origin-top-left print:!transform-none"
        style={{ width, transform: `scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
}
