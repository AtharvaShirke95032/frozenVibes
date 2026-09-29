"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { heroReady, markIntroDone } from "@/lib/intro";
import { useReducedMotion } from "@/lib/useMedia";

const letters = "frozenVibes".split("");
const MAX_WAIT = 6000;
/** Extra time allowed for the WebGL hero to finish uploading textures once the page has loaded. */
const HERO_WAIT = 4000;
/** The intro always runs at least this long so the wordmark animation can play. */
const MIN_DURATION = 1800;
/** Where the count drifts to while still waiting on assets. */
const CREEP = 92;

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
  const countRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (reduce) {
      // The reduced-motion preference is only known after hydration, so this can't be initial state.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setVisible(false);
      markIntroDone();
      return;
    }

    let cancelled = false;
    let ready = false;
    document.documentElement.style.overflow = "hidden";
    pageReady()
      .then(() => Promise.race([heroReady(), new Promise<void>((r) => setTimeout(r, HERO_WAIT))]))
      .then(() => (ready = true));

    // One continuous rAF-driven count written straight to the DOM (no React renders): it creeps toward
    // CREEP while loading and eases into 100 once ready, so it never visibly stops and restarts.
    const start = performance.now();
    let last = start;
    let value = 0;
    let raf = 0;
    const tick = (now: number) => {
      const dt = Math.min(now - last, 50) / 1000;
      last = now;
      const t = (now - start) / 1000;
      const finishing = ready && now - start >= MIN_DURATION;
      const target = finishing ? 100 : CREEP * (1 - Math.exp(-t / 1.1));
      value = Math.max(value, value + (target - value) * (1 - Math.exp(-dt * (finishing ? 5 : 6))));
      if (finishing && value > 99.6) value = 100;

      if (countRef.current) countRef.current.textContent = String(Math.round(value));
      if (barRef.current) barRef.current.style.transform = `scaleX(${value / 100})`;

      if (value < 100) raf = requestAnimationFrame(tick);
      else setTimeout(() => !cancelled && setVisible(false), 300);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
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
              <div ref={barRef} className="absolute inset-0 origin-left bg-frost" style={{ transform: "scaleX(0)" }} />
            </div>
            <span ref={countRef} className="display text-6xl md:text-8xl tabular-nums w-[3ch] text-right">
              0
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
