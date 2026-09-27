"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { filmThumb, type Film } from "@/data/films";
import { useLenis } from "@/components/SmoothScroll";

const EXPO = [0.19, 1, 0.22, 1] as const;

export function FilmGrid({ films, variant = "grid" }: { films: Film[]; variant?: "grid" | "feature" }) {
  const [active, setActive] = useState<Film | null>(null);

  return (
    <>
      <div
        className={
          variant === "feature"
            ? "grid gap-x-6 gap-y-14 md:grid-cols-3"
            : "grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
        }
      >
        {films.map((f, i) => (
          <motion.button
            key={f.id}
            type="button"
            onClick={() => setActive(f)}
            className="group text-left"
            data-cursor="Play"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 1, ease: EXPO, delay: (i % 3) * 0.08 }}
            aria-label={`Play film: ${f.couple}${f.place ? `, ${f.place}` : ""}`}
          >
            <div className="relative aspect-video overflow-hidden bg-ink-2">
              <FilmPoster film={f} />
              <div className="absolute inset-0 bg-ink/25 transition-colors duration-700 group-hover:bg-ink/5" />
              <span className="absolute left-4 top-4 label text-paper/80 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              <span className="absolute bottom-4 right-4 flex size-12 items-center justify-center rounded-full border border-paper/50 text-paper backdrop-blur-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-paper group-hover:text-ink">
                <svg width="12" height="14" viewBox="0 0 12 14" fill="currentColor" aria-hidden>
                  <path d="M0 0v14l12-7z" />
                </svg>
              </span>
            </div>
            <div className="mt-4 flex items-baseline justify-between gap-4">
              <h3 className="display text-3xl">{f.couple}</h3>
              {f.kind && <span className="label opacity-60 shrink-0">{f.kind}</span>}
            </div>
            {f.place && <p className="label opacity-60 mt-1">{f.place}</p>}
          </motion.button>
        ))}
      </div>
      <FilmModal film={active} onClose={() => setActive(null)} />
    </>
  );
}

function FilmPoster({ film }: { film: Film }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={filmThumb(film)}
      alt=""
      loading="lazy"
      className="h-full w-full object-cover grayscale-[35%] transition-all duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-105 group-hover:grayscale-0"
    />
  );
}

function FilmModal({ film, onClose }: { film: Film | null; onClose: () => void }) {
  const lenis = useLenis();

  useEffect(() => {
    if (!film) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [film, lenis, onClose]);

  return (
    <AnimatePresence>
      {film && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 p-4 md:p-12"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5 }}
          onClick={onClose}
          role="dialog"
          aria-modal="true"
          aria-label={`${film.couple} film`}
        >
          <motion.div
            className="relative w-full max-w-6xl aspect-video bg-black"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ duration: 0.8, ease: EXPO }}
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              className="absolute inset-0 h-full w-full"
              src={`https://www.youtube-nocookie.com/embed/${film.id}?autoplay=1&rel=0&modestbranding=1`}
              title={`${film.couple}${film.place ? `, ${film.place}` : ""}`}
              allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </motion.div>
          <button onClick={onClose} className="absolute right-4 top-4 md:right-8 md:top-6 label text-paper py-2" autoFocus>
            Close ✕
          </button>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 display text-2xl text-paper/80 whitespace-nowrap">
            {film.couple}
            {film.place && <span className="italic text-paper/50"> — {film.place}</span>}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
