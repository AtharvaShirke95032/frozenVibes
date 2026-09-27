"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "motion/react";

/**
 * Small dot that follows the pointer and grows into a label over elements
 * marked with `data-cursor="View"` (or any text). Fine pointers only.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const [label, setLabel] = useState<string | null>(null);
  const [hoverLink, setHoverLink] = useState(false);
  const [down, setDown] = useState(false);
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  // Very stiff, critically damped spring: tracks the pointer almost 1:1 with just a hint of smoothing.
  const spring = { stiffness: 2200, damping: 90, mass: 0.12 };
  const sx = useSpring(x, spring);
  const sy = useSpring(y, spring);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const update = () => {
      setEnabled(mq.matches);
      document.documentElement.classList.toggle("has-cursor", mq.matches);
    };
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    // Re-read on move only for elements whose data-cursor changes while hovered (e.g. the WebGL ring canvas);
    // everything else is handled once per element by pointerover.
    let lastTarget: EventTarget | null = null;
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      if (e.target !== lastTarget || (e.target as Element).tagName === "CANVAS") over(e);
    };
    const over = (e: PointerEvent) => {
      lastTarget = e.target;
      const el = e.target as HTMLElement | null;
      const labelled = el?.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor || null);
      setHoverLink(!labelled && !!el?.closest("a, button, [role=button], input, textarea, select, label"));
    };
    const pressed = () => setDown(true);
    const released = () => setDown(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", pressed);
    window.addEventListener("pointerup", released);
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", pressed);
      window.removeEventListener("pointerup", released);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;

  const size = label ? 88 : hoverLink ? 36 : 8;

  // Over media and links the cursor becomes a black & white lens (backdrop grayscale) instead of
  // inverting colours; at rest it's a small white dot with a hairline ring, visible on light and dark.
  const lens = !!label || hoverLink;

  return (
    <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[120]" style={{ x: sx, y: sy }}>
      <motion.div
        className={`flex items-center justify-center rounded-full text-white ${
          lens ? "backdrop-grayscale backdrop-contrast-[1.1]" : ""
        }`}
        animate={{
          width: size,
          height: size,
          x: -size / 2,
          y: -size / 2,
          scale: down ? 0.85 : 1,
          backgroundColor: lens ? "rgba(255,255,255,0.06)" : "rgba(255,255,255,1)",
          boxShadow: lens
            ? "inset 0 0 0 1px rgba(255,255,255,0.8), 0 0 0 1px rgba(17,17,17,0.35)"
            : "inset 0 0 0 0px rgba(255,255,255,0), 0 0 0 1px rgba(17,17,17,0.45)",
        }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        {label && (
          <motion.span
            className="label text-[10px] [text-shadow:0_1px_6px_rgba(0,0,0,0.45)]"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.05 }}
          >
            {label}
          </motion.span>
        )}
      </motion.div>
    </motion.div>
  );
}
