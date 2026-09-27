"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import { Link } from "@/components/PageTransition";
import { nav, site } from "@/data/site";

const EASE = [0.76, 0, 0.24, 1] as const;

export default function Nav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [hidden, setHidden] = useState(false);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > 160 && y > prev);
  });

  // Close the mobile menu whenever the route changes.
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpen(false);
  }
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
  }, [open]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 gutter pt-5 md:pt-6 text-white mix-blend-difference"
        animate={{ y: hidden && !open ? "-120%" : "0%" }}
        transition={{ duration: 0.6, ease: EASE }}
      >
        <div className="flex items-center justify-between">
          <Link href="/" className="display text-2xl md:text-[1.75rem] tracking-tight" aria-label={`${site.name} — home`}>
            frozen<span className="italic">Vibes</span>
          </Link>

          <nav className="hidden md:flex items-center gap-10" aria-label="Primary">
            {nav.map((item) => {
              const active = pathname.startsWith(item.href.replace(/\/$/, ""));
              return (
                <Link key={item.href} href={item.href} className="label group relative py-1">
                  {item.label}
                  <span
                    className={`absolute left-0 -bottom-0.5 h-px w-full origin-left bg-current transition-transform duration-500 ease-[var(--ease-expo)] ${
                      active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          <button
            className="md:hidden label flex items-center gap-2 py-2"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-0 z-40 bg-ink text-paper gutter pt-28 pb-8 flex flex-col justify-between md:hidden"
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <nav className="flex flex-col gap-2" aria-label="Mobile">
              {[{ href: "/", label: "Home" }, ...nav].map((item, i) => (
                <div key={item.href} className="overflow-hidden">
                  <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: "0%" }}
                    exit={{ y: "100%" }}
                    transition={{ duration: 0.8, ease: [0.19, 1, 0.22, 1], delay: 0.15 + i * 0.06 }}
                  >
                    <Link href={item.href} className="display text-6xl block py-1">
                      {item.label}
                    </Link>
                  </motion.div>
                </div>
              ))}
            </nav>
            <motion.div
              className="flex flex-col gap-1 text-paper/70 text-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.5 } }}
              exit={{ opacity: 0 }}
            >
              <a href={`mailto:${site.email}`}>{site.email}</a>
              <a href={site.phoneHref}>{site.phone}</a>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
