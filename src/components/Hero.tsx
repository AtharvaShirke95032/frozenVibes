"use client";

import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "motion/react";
import { RevealText } from "@/components/Reveal";
import { useIntroDone } from "@/lib/intro";
import { srcSet, type Img } from "@/lib/media";
import { useWebGL2, useReducedMotion } from "@/lib/useMedia";

const HeroCanvas = dynamic(() => import("@/components/three/HeroCanvas"), { ssr: false });

export type HeroSlide = { image: Img; texture: string; caption: string };

export default function Hero({ slides }: { slides: HeroSlide[] }) {
  const ref = useRef<HTMLElement>(null);
  const introDone = useIntroDone();
  const reduce = useReducedMotion();
  const webgl = useWebGL2() && !reduce;
  const [ready, setReady] = useState(false);
  const [slide, setSlide] = useState(0);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const fade = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const onReady = useCallback(() => setReady(true), []);
  const first = slides[0];

  return (
    <section ref={ref} className="relative h-[100svh] min-h-[560px] w-full overflow-hidden bg-ink text-paper">
      <motion.div className="absolute inset-0" style={{ y: reduce ? 0 : y }}>
        {/* Static first frame: LCP image and no-WebGL / reduced-motion fallback. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${first.image.src}-1280.webp`}
          srcSet={srcSet(first.image)}
          sizes="100vw"
          alt=""
          fetchPriority="high"
          className={`absolute inset-0 h-full w-full object-cover brightness-[0.72] transition-opacity duration-1000 ${ready ? "opacity-0" : "opacity-100"}`}
        />
        {webgl && (
          <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: ready ? 1 : 0 }} transition={{ duration: 1.2 }}>
            <HeroCanvas images={slides.map((s) => s.texture)} play={introDone} onSlide={setSlide} onReady={onReady} />
          </motion.div>
        )}
      </motion.div>

      <motion.div className="relative z-10 flex h-full flex-col justify-end gutter pb-8 md:pb-10" style={{ opacity: reduce ? 1 : fade }}>
        <div className="flex items-end justify-between gap-8">
          <div>
            <motion.p
              className="label text-paper/70 mb-5"
              initial={{ opacity: 0 }}
              animate={introDone ? { opacity: 1 } : undefined}
              transition={{ delay: 0.9, duration: 1 }}
            >
              Wedding photography &amp; films — Mumbai
            </motion.p>
            <RevealText as="h1" immediate play={introDone} delay={0.2} stagger={0.08} className="display text-[16vw] md:text-[10.5vw] leading-[0.86]">
              Love, frozen in time.
            </RevealText>
          </div>
        </div>

        <motion.div
          className="mt-8 md:mt-10 flex items-center justify-between border-t border-paper/20 pt-4 label text-paper/70"
          initial={{ opacity: 0, y: 12 }}
          animate={introDone ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 1.2, duration: 1 }}
        >
          <div className="h-4 overflow-hidden">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={slide}
                className="block"
                initial={{ y: "100%" }}
                animate={{ y: "0%" }}
                exit={{ y: "-100%" }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              >
                {slides[slide]?.caption}
              </motion.span>
            </AnimatePresence>
          </div>
          <span className="tabular-nums hidden sm:block">
            {String(slide + 1).padStart(2, "0")} / {String(slides.length).padStart(2, "0")}
          </span>
          <span className="flex items-center gap-3">
            Scroll
            <span className="relative block h-6 w-px overflow-hidden bg-paper/20">
              <motion.span
                className="absolute inset-x-0 top-0 h-1/2 bg-paper"
                animate={reduce ? undefined : { y: ["-100%", "200%"] }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
              />
            </span>
          </span>
        </motion.div>
      </motion.div>
    </section>
  );
}
