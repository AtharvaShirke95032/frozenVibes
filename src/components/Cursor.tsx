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
  const sx = useSpring(x, { stiffness: 500, damping: 40, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 500, damping: 40, mass: 0.4 });

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
    // Re-read on every move too, so elements that change their data-cursor while hovered (e.g. the WebGL ring) update.
    const move = (e: PointerEvent) => {
      x.set(e.clientX);
      y.set(e.clientY);
      over(e);
    };
    const over = (e: PointerEvent) => {
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

  return (
    <motion.div
      aria-hidden
      className="pointer-events-none fixed left-0 top-0 z-[120] mix-blend-difference"
      style={{ x: sx, y: sy }}
    >
      <motion.div
        className="flex items-center justify-center rounded-full bg-white text-black"
        animate={{
          width: size,
          height: size,
          x: -size / 2,
          y: -size / 2,
          scale: down ? 0.85 : 1,
          backgroundColor: hoverLink && !label ? "rgba(255,255,255,0)" : "rgba(255,255,255,1)",
          borderWidth: hoverLink && !label ? 1 : 0,
        }}
        style={{ borderColor: "white", borderStyle: "solid" }}
        transition={{ type: "spring", stiffness: 350, damping: 28 }}
      >
        {label && (
          <motion.span
            className="label text-[10px]"
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
