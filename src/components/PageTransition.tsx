"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import NextLink from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";

type Phase = "idle" | "cover" | "reveal";
const TransitionContext = createContext<(href: string) => void>(() => {});
const EASE = [0.76, 0, 0.24, 1] as const;

const normalize = (p: string) => (p.endsWith("/") ? p : `${p}/`);

/** Curtain wipe between routes: cover → navigate → reveal once the new path renders. */
export function TransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [phase, setPhase] = useState<Phase>("idle");
  const [label, setLabel] = useState("");
  const target = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      const url = new URL(href, window.location.href);
      if (normalize(url.pathname) === normalize(pathname)) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        router.push(href);
        return;
      }
      target.current = normalize(url.pathname);
      setLabel(labelFor(url.pathname));
      router.prefetch(href);
      setPhase("cover");
      window.setTimeout(() => router.push(href), 750);
    },
    [pathname, router],
  );

  useEffect(() => {
    if (phase === "cover" && target.current === normalize(pathname)) {
      const t = window.setTimeout(() => setPhase("reveal"), 120);
      return () => window.clearTimeout(t);
    }
  }, [pathname, phase]);

  return (
    <TransitionContext.Provider value={navigate}>
      {children}
      <AnimatePresence>
        {phase === "cover" && (
          <motion.div
            key="curtain"
            className="fixed inset-0 z-[90] bg-ink text-paper flex items-center justify-center pointer-events-auto"
            initial={{ clipPath: "inset(100% 0 0 0)" }}
            animate={{ clipPath: "inset(0% 0 0 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.75, ease: EASE }}
          >
            <motion.span
              className="display text-5xl md:text-7xl italic"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5, delay: 0.25, ease: [0.19, 1, 0.22, 1] }}
            >
              {label}
            </motion.span>
          </motion.div>
        )}
      </AnimatePresence>
      <PhaseReset phase={phase} onDone={() => setPhase("idle")} />
    </TransitionContext.Provider>
  );
}

function PhaseReset({ phase, onDone }: { phase: Phase; onDone: () => void }) {
  useEffect(() => {
    if (phase !== "reveal") return;
    const t = window.setTimeout(onDone, 800);
    return () => window.clearTimeout(t);
  }, [phase, onDone]);
  return null;
}

function labelFor(path: string) {
  const seg = path.split("/").filter(Boolean);
  if (!seg.length) return "Home";
  const last = seg[seg.length - 1].replace(/-and-/g, " & ").replace(/-/g, " ");
  return last.replace(/\b\w/g, (c) => c.toUpperCase());
}

export const usePageTransition = () => useContext(TransitionContext);

type LinkProps = React.ComponentProps<typeof NextLink> & { href: string };

/** Drop-in <Link> that plays the curtain transition for internal navigation. */
export function Link({ href, onClick, ...rest }: LinkProps) {
  const navigate = usePageTransition();
  return (
    <NextLink
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        if (rest.target === "_blank" || href.startsWith("#")) return;
        e.preventDefault();
        navigate(href);
      }}
    />
  );
}
