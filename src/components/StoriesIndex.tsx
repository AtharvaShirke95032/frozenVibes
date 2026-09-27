"use client";

import dynamic from "next/dynamic";
import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll } from "motion/react";
import { usePageTransition } from "@/components/PageTransition";
import type { RingItem } from "@/components/three/StoriesRing";
import { useMediaQuery, useWebGL2 } from "@/lib/useMedia";

const StoriesRing = dynamic(() => import("@/components/three/StoriesRing"), { ssr: false });

type Item = RingItem & { place?: string; count: number };

/** Scroll-driven 3D ring of story covers (desktop + WebGL only). */
export default function StoriesIndex({ items }: { items: Item[] }) {
  const wide = useMediaQuery("(min-width: 768px) and (prefers-reduced-motion: no-preference)");
  const webgl = useWebGL2();
  return wide && webgl ? <Ring3D items={items} /> : null;
}

function Ring3D({ items }: { items: Item[] }) {
  const section = useRef<HTMLElement>(null);
  const navigate = usePageTransition();
  const [focus, setFocus] = useState(0);
  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  const current = items[focus];

  return (
    <section ref={section} className="relative" style={{ height: `${items.length * 55 + 100}vh` }} aria-label="Stories carousel">
      <div className="sticky top-0 h-screen overflow-hidden">
        <StoriesRing items={items} progress={scrollYProgress} onFocus={setFocus} onSelect={(slug) => navigate(`/stories/${slug}/`)} />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 gutter pb-8 flex items-end justify-between">
          <div className="h-[4.5rem] md:h-24 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={current.slug}
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
              >
                <p className="display text-6xl md:text-8xl leading-none">{current.couple}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <div className="text-right label text-mute">
            <p className="tabular-nums">
              {String(focus + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
            </p>
            <p className="mt-1">{current.place ?? `${current.count} photographs`}</p>
          </div>
        </div>

        <p className="pointer-events-none absolute top-28 left-1/2 -translate-x-1/2 label text-mute">Scroll or drag · click to open</p>
      </div>
    </section>
  );
}
