"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, animate, motion } from "motion/react";
import { markIntroDone } from "@/lib/intro";
import { useReducedMotion } from "@/lib/useMedia";

const letters = "frozenVibes".split("");
const MAX_WAIT = 6000;

/** Resolves once fonts and the page's eager assets (incl. the hero photo) have loaded, capped at MAX_WAIT. */
function pageReady() {
  const loaded = new Promise<void>((resolve) => {
    if (document.readyState === "complete") resolve();
    else window.addEventListener("load", () => resolve(), { once: true });
  });
  const timeout = new Promise<void>((resolve) => setTimeout(resolve, MAX_WAIT));
  return Promise.race([Promise.all([loaded, document.fonts.ready]), timeout]);
}

/** Intro shown on every full page load (reload / first visit); client-side navigation never remounts it. */
export default function Preloader() {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (reduce) {
      // The reduced-motion preference is only known after hydration, so this can't be initial state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      markIntroDone();
      return;
    }

    let cancelled = false;
    document.documentElement.style.overflow = "hidden";
    const onUpdate = (v: number) => setCount(Math.round(v));

    // Count to 90 while loading, then finish once the page is actually ready.
    const first = animate(0, 90, { duration: 1.8, ease: [0.33, 1, 0.68, 1], onUpdate });
    let last: ReturnType<typeof animate> | undefined;
    Promise.all([first, pageReady()]).then(() => {
      if (cancelled) return;
      last = animate(90, 100, {
        duration: 0.5,
        ease: "easeOut",
        onUpdate,
        onComplete: () => setTimeout(() => !cancelled && setVisible(false), 300),
      });
    });

    return () => {
      cancelled = true;
      first.stop();
      last?.stop();
    };
  }, [reduce]);

  return (
    <AnimatePresence
      onExitComplete={() => {
        document.documentElement.style.overflow = "";
        markIntroDone();
      }}
    >
      {visible && (
        <motion.div
          key="preloader"
          className="fixed inset-0 z-[100] flex flex-col justify-between bg-ink text-paper gutter py-6"
          exit={{ clipPath: "inset(0 0 100% 0)" }}
          initial={{ clipPath: "inset(0 0 0% 0)" }}
          transition={{ duration: 1.1, ease: [0.76, 0, 0.24, 1] }}
          aria-hidden
        >
          <div className="flex justify-between label text-paper/60">
            <span>Wedding photography &amp; films</span>
            <span>Mumbai · India</span>
          </div>

          <div className="overflow-hidden">
            <motion.h1
              className="display text-[18vw] md:text-[15vw] leading-[0.85] flex"
              exit={{ y: "-30%", opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            >
              {letters.map((l, i) => (
                <motion.span
                  key={i}
                  className={l === "V" ? "italic ml-[0.06em]" : ""}
                  initial={{ y: "105%" }}
                  animate={{ y: "0%" }}
                  transition={{ delay: 0.15 + i * 0.045, duration: 1, ease: [0.19, 1, 0.22, 1] }}
                >
                  {l}
                </motion.span>
              ))}
            </motion.h1>
          </div>

          <div className="flex items-end justify-between">
            <div className="h-px flex-1 bg-paper/15 mr-6 mb-3 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-frost" style={{ width: `${count}%` }} />
            </div>
            <span className="display text-6xl md:text-8xl tabular-nums w-[3ch] text-right">{count}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
