"use client";

import { useState, useRef, useCallback } from "react";
import { motion, AnimatePresence, type Variants } from "framer-motion";
import { createPortal } from "react-dom";

export type TooltipSide = "right" | "left" | "top" | "bottom";

interface NavTooltipProps {
  label: string;
  side?: TooltipSide;
  children: React.ReactNode;
  disabled?: boolean;
}

const animVariants: Record<TooltipSide, Variants> = {
  right:  { initial: { opacity: 0, x: -6, scale: 0.92 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x: -6, scale: 0.92 } },
  left:   { initial: { opacity: 0, x:  6, scale: 0.92 }, animate: { opacity: 1, x: 0, scale: 1 }, exit: { opacity: 0, x:  6, scale: 0.92 } },
  top:    { initial: { opacity: 0, y:  6, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y:  6, scale: 0.92 } },
  bottom: { initial: { opacity: 0, y: -6, scale: 0.92 }, animate: { opacity: 1, y: 0, scale: 1 }, exit: { opacity: 0, y: -6, scale: 0.92 } },
};

/** Returns position for the CENTERING wrapper (no transform conflicts with Framer) */
function wrapperStyle(side: TooltipSide, rect: DOMRect): React.CSSProperties {
  const GAP = 10;
  switch (side) {
    case "right":
      return {
        position: "fixed",
        top: rect.top + rect.height / 2,
        left: rect.right + GAP,
        transform: "translateY(-50%)",
        zIndex: 9999,
        pointerEvents: "none",
      };
    case "left":
      return {
        position: "fixed",
        top: rect.top + rect.height / 2,
        left: rect.left - GAP,
        transform: "translate(-100%, -50%)",
        zIndex: 9999,
        pointerEvents: "none",
      };
    case "top":
      return {
        position: "fixed",
        top: rect.top - GAP,
        left: rect.left + rect.width / 2,
        transform: "translate(-50%, -100%)",
        zIndex: 9999,
        pointerEvents: "none",
      };
    case "bottom":
      return {
        position: "fixed",
        top: rect.bottom + GAP,
        left: rect.left + rect.width / 2,
        transform: "translateX(-50%)",
        zIndex: 9999,
        pointerEvents: "none",
      };
  }
}

const tooltipBubble: React.CSSProperties = {
  background: "linear-gradient(135deg, var(--theme-gradient-from), var(--theme-gradient-to))",
  color: "var(--theme-active-text)",
  padding: "5px 11px",
  borderRadius: 8,
  fontSize: 12,
  fontWeight: 500,
  whiteSpace: "nowrap",
  boxShadow: "0 4px 14px var(--theme-glow)",
  letterSpacing: "-0.01em",
  position: "relative",
};

function Arrow({ side }: { side: TooltipSide }) {
  const arrowStyle: React.CSSProperties = {
    position: "absolute",
    width: 7,
    height: 7,
    background: "var(--theme-gradient-from)",
    transform: "rotate(45deg)",
    borderRadius: 1,
    zIndex: -1,
  };
  switch (side) {
    case "right":
      return <div style={{ ...arrowStyle, left: -3, top: "50%", marginTop: -3.5 }} />;
    case "left":
      return <div style={{ ...arrowStyle, right: -3, top: "50%", marginTop: -3.5 }} />;
    case "top":
      return <div style={{ ...arrowStyle, bottom: -3, left: "50%", marginLeft: -3.5 }} />;
    case "bottom":
      return <div style={{ ...arrowStyle, top: -3, left: "50%", marginLeft: -3.5 }} />;
  }
}

export function NavTooltip({
  label,
  side = "right",
  children,
  disabled = false,
}: NavTooltipProps) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);

  const show = useCallback(() => {
    if (disabled || !triggerRef.current) return;
    setPos(wrapperStyle(side, triggerRef.current.getBoundingClientRect()));
    setVisible(true);
  }, [disabled, side]);

  const hide = useCallback(() => setVisible(false), []);

  return (
    <div ref={triggerRef} onMouseEnter={show} onMouseLeave={hide}>
      {children}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {visible && !disabled && (
              /* Outer wrapper handles centering transform; inner motion.div handles animation */
              <div style={pos}>
                <motion.div
                  key="tooltip"
                  style={tooltipBubble}
                  variants={animVariants[side]}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Arrow side={side} />
                  {label}
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </div>
  );
}
