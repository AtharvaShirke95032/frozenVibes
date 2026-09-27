"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import { Link } from "@/components/PageTransition";
import { srcSet } from "@/lib/media";
import type { Story } from "@/data/stories";
import { useReducedMotion } from "@/lib/useMedia";

/**
 * Pinned section that turns vertical scroll into a horizontal pan across story covers.
 * Falls back to a native swipeable row on touch / small screens and for reduced motion.
 */
export default function HorizontalStories({ stories }: { stories: Story[] }) {
  const section = useRef<HTMLElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [distance, setDistance] = useState(0);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const measure = () => {
      setPinned(mq.matches && !reduce);
      if (track.current) setDistance(Math.max(0, track.current.scrollWidth - window.innerWidth));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (track.current) ro.observe(track.current);
    mq.addEventListener("change", measure);
    return () => {
      ro.disconnect();
      mq.removeEventListener("change", measure);
    };
  }, [reduce]);

  const { scrollYProgress } = useScroll({ target: section, offset: ["start start", "end end"] });
  // Lenis already smooths the scroll, so map it directly — an extra spring here only adds lag.
  const x = useTransform(scrollYProgress, [0, 1], [0, -distance]);
  const bar = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <section
      ref={section}
      className="relative bg-paper"
      style={{ height: pinned ? `calc(100vh + ${distance}px)` : undefined }}
      aria-label="Featured stories"
    >
      <div className={pinned ? "sticky top-0 h-screen overflow-hidden flex flex-col justify-center" : "py-24"}>
        <div className="gutter mb-10 md:mb-14 flex items-end justify-between">
          <div>
            <p className="label text-mute mb-4">Selected stories</p>
            <h2 className="display text-6xl md:text-8xl">Love stories</h2>
          </div>
          <Link href="/stories/" className="label border-b border-current pb-1 hidden sm:block">
            All stories
          </Link>
        </div>

        <motion.div
          ref={track}
          className={`flex gap-4 md:gap-8 gutter ${pinned ? "w-max" : "overflow-x-auto snap-x snap-mandatory [scrollbar-width:none]"}`}
          style={{ x: pinned ? x : 0 }}
        >
          {stories.map((s, i) => (
            <Link
              key={s.slug}
              href={`/stories/${s.slug}/`}
              className="group relative shrink-0 snap-start w-[78vw] sm:w-[48vw] md:w-[34vw] lg:w-[28vw]"
              data-cursor="View"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-paper-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={`${s.cover.src}-${s.cover.widths[Math.min(1, s.cover.widths.length - 1)]}.webp`}
                  srcSet={srcSet(s.cover)}
                  sizes="(min-width: 1024px) 28vw, (min-width: 768px) 34vw, 78vw"
                  alt={`${s.couple} wedding`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.06]"
                  style={{ backgroundImage: `url(${s.cover.blur})`, backgroundSize: "cover" }}
                />
                <div className="absolute inset-0 bg-ink/0 transition-colors duration-700 group-hover:bg-ink/10" />
              </div>
              <div className="mt-4 flex items-baseline justify-between">
                <h3 className="display text-3xl md:text-4xl">{s.couple}</h3>
                <span className="label text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </div>
              {s.place && <p className="label text-mute mt-1">{s.place}</p>}
            </Link>
          ))}
          <Link
            href="/stories/"
            className="group shrink-0 w-[60vw] sm:w-[36vw] md:w-[24vw] aspect-[4/5] flex flex-col items-center justify-center border hairline"
          >
            <span className="display text-4xl italic transition-transform duration-700 group-hover:-translate-y-1">All stories</span>
            <span className="label text-mute mt-3">{stories.length} weddings →</span>
          </Link>
        </motion.div>

        {pinned && (
          <div className="gutter mt-10">
            <div className="h-px w-full bg-line relative overflow-hidden">
              <motion.div className="absolute inset-0 origin-left bg-ink" style={{ scaleX: bar }} />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
