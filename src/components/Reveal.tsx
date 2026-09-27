"use client";

import { useRef } from "react";
import { motion, useInView, useScroll, useTransform } from "motion/react";
import { srcSet, type Img } from "@/lib/media";
import { useReducedMotion } from "@/lib/useMedia";

const EXPO = [0.19, 1, 0.22, 1] as const;

type TextProps = {
  children: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  className?: string;
  delay?: number;
  stagger?: number;
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean;
  play?: boolean;
};

/** Words rise into view from behind a mask, staggered. */
export function RevealText({ children, as = "h2", className, delay = 0, stagger = 0.04, immediate, play = true }: TextProps) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -12% 0px" });
  const show = play && (immediate || inView);
  const Tag = motion[as];
  const words = children.split(" ");

  return (
    <Tag ref={ref as never} className={className} aria-label={children}>
      {words.map((word, i) => (
        <span key={i} aria-hidden className="inline-block overflow-hidden pb-[0.2em] -mb-[0.2em] align-top">
          <motion.span
            className="inline-block"
            initial={{ y: "110%", rotate: 4 }}
            animate={show ? { y: "0%", rotate: 0 } : undefined}
            transition={{ duration: 1.1, ease: EXPO, delay: delay + i * stagger }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </Tag>
  );
}

/** Fades and lifts any block into view. */
export function FadeUp({ children, className, delay = 0 }: { children: React.ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={{ duration: 1, ease: EXPO, delay }}
    >
      {children}
    </motion.div>
  );
}

type PhotoProps = {
  image: Img;
  alt: string;
  sizes?: string;
  className?: string;
  /** Aspect override, e.g. "4/5". Defaults to the image's own. */
  aspect?: string;
  /** Parallax travel in % of height (0 disables). */
  parallax?: number;
  priority?: boolean;
  reveal?: boolean;
};

/** Responsive photo with blur placeholder, clip-path reveal and optional scroll parallax. */
export function Photo({ image, alt, sizes = "100vw", className = "", aspect, parallax = 0, priority, reveal = true }: PhotoProps) {
  // The observed wrapper is never clipped itself: Chrome's IntersectionObserver can ignore
  // targets that are fully hidden by their own clip-path, so only the inner layer animates.
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "0px 0px -8% 0px" });
  const reduce = useReducedMotion();
  const shown = !reveal || inView;

  const picture = (
    <motion.div
      className="absolute inset-0"
      style={{ backgroundImage: `url(${image.blur})`, backgroundSize: "cover", backgroundPosition: "center" }}
      initial={reveal ? { scale: 1.25 } : false}
      animate={shown ? { scale: 1 } : undefined}
      transition={{ duration: 1.6, ease: EXPO }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`${image.src}-${image.widths[Math.min(1, image.widths.length - 1)]}.webp`}
        srcSet={srcSet(image)}
        sizes={sizes}
        alt={alt}
        width={image.w}
        height={image.h}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
        className="h-full w-full object-cover"
      />
    </motion.div>
  );

  return (
    <div ref={ref} className={`relative overflow-hidden ${className}`} style={{ aspectRatio: aspect ?? `${image.w} / ${image.h}` }}>
      <motion.div
        className="absolute inset-0 overflow-hidden bg-paper-2"
        initial={reveal ? { clipPath: "inset(100% 0% 0% 0%)" } : false}
        animate={shown ? { clipPath: "inset(0% 0% 0% 0%)" } : undefined}
        transition={{ duration: 1.3, ease: [0.76, 0, 0.24, 1] }}
      >
        {parallax > 0 && !reduce ? (
          <Parallax target={ref} amount={parallax}>
            {picture}
          </Parallax>
        ) : (
          picture
        )}
      </motion.div>
    </div>
  );
}

/** Scroll-linked drift. Only mounted when needed, so plain photos don't each add a scroll listener. */
function Parallax({ target, amount, children }: { target: React.RefObject<HTMLDivElement | null>; amount: number; children: React.ReactNode }) {
  const { scrollYProgress } = useScroll({ target, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [`-${amount}%`, `${amount}%`]);
  return (
    <motion.div className="absolute inset-0" style={{ y, scale: 1 + (amount * 2) / 100 }}>
      {children}
    </motion.div>
  );
}
