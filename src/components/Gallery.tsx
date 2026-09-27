"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, type PanInfo } from "motion/react";
import { Photo } from "@/components/Reveal";
import { useLenis } from "@/components/SmoothScroll";
import { ratio, srcSet, type Img } from "@/lib/media";

const EXPO = [0.19, 1, 0.22, 1] as const;

/**
 * Editorial gallery: landscape frames span the full row, portraits pair up side by side,
 * with a rhythm of offsets. Click any frame to open the lightbox.
 */
const ROWS_PER_BATCH = 8;

export default function Gallery({ images, title }: { images: Img[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const [visibleRows, setVisibleRows] = useState(ROWS_PER_BATCH);
  const sentinel = useRef<HTMLDivElement>(null);
  const rows = buildRows(images);
  const hasMore = visibleRows < rows.length;

  // Render big galleries progressively: the next batch mounts well before it scrolls into view.
  useEffect(() => {
    const el = sentinel.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setVisibleRows((n) => n + ROWS_PER_BATCH),
      { rootMargin: "1600px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [hasMore, visibleRows]);

  return (
    <>
      <div className="flex flex-col gap-4 md:gap-8">
        {rows.slice(0, visibleRows).map((row, r) => (
          <div
            key={r}
            className={`grid gap-4 md:gap-8 ${
              row.length === 1
                ? r % 3 === 1
                  ? "md:grid-cols-12 md:[&>*]:col-span-10 md:[&>*]:col-start-2"
                  : "grid-cols-1"
                : "grid-cols-2 items-start"
            }`}
          >
            {row.map(({ image, index }, c) => (
              <button
                key={index}
                type="button"
                onClick={() => setOpen(index)}
                className={`block w-full ${row.length === 2 && c === 1 && r % 2 === 0 ? "md:mt-24" : ""}`}
                data-cursor="View"
                aria-label={`Open photo ${index + 1} of ${images.length}`}
              >
                <Photo
                  image={image}
                  alt={`${title} — photo ${index + 1}`}
                  sizes={row.length === 1 ? "100vw" : "50vw"}
                />
              </button>
            ))}
          </div>
        ))}
      </div>
      {hasMore && <div ref={sentinel} className="h-px" aria-hidden />}
      <Lightbox images={images} index={open} setIndex={setOpen} title={title} />
    </>
  );
}

function buildRows(images: Img[]) {
  const rows: { image: Img; index: number }[][] = [];
  let pending: { image: Img; index: number } | null = null;
  images.forEach((image, index) => {
    if (ratio(image) >= 1.1) {
      rows.push([{ image, index }]);
    } else if (pending) {
      rows.push([pending, { image, index }]);
      pending = null;
    } else {
      pending = { image, index };
    }
  });
  if (pending) rows.push([pending]);
  return rows;
}

function Lightbox({
  images,
  index,
  setIndex,
  title,
}: {
  images: Img[];
  index: number | null;
  setIndex: (i: number | null) => void;
  title: string;
}) {
  const lenis = useLenis();
  const [dir, setDir] = useState(1);
  const go = useCallback(
    (d: number) => {
      if (index === null) return;
      setDir(d);
      setIndex((index + d + images.length) % images.length);
    },
    [index, images.length, setIndex],
  );

  useEffect(() => {
    if (index === null) return;
    lenis?.stop();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      lenis?.start();
      window.removeEventListener("keydown", onKey);
    };
  }, [index, go, lenis, setIndex]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (Math.abs(info.offset.y) > 120 && Math.abs(info.offset.y) > Math.abs(info.offset.x)) return setIndex(null);
    if (info.offset.x < -80) go(1);
    else if (info.offset.x > 80) go(-1);
  };

  const current = index !== null ? images[index] : null;

  return (
    <AnimatePresence>
      {current && index !== null && (
        <motion.div
          className="fixed inset-0 z-[80] bg-ink text-paper"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          role="dialog"
          aria-modal="true"
          aria-label={`${title} gallery`}
        >
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between gutter py-5 label">
            <span className="tabular-nums text-paper/60">
              {String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}
            </span>
            <span className="hidden md:block display normal-case tracking-normal text-xl text-paper/80">{title}</span>
            <button onClick={() => setIndex(null)} className="py-2" autoFocus>
              Close ✕
            </button>
          </div>

          <div className="absolute inset-0 flex items-center justify-center px-4 py-20 md:px-24">
            <AnimatePresence initial={false} custom={dir} mode="popLayout">
              <motion.img
                key={index}
                custom={dir}
                src={`${current.src}-${current.widths.at(-1)}.webp`}
                srcSet={srcSet(current)}
                sizes="100vw"
                alt={`${title} — photo ${index + 1}`}
                className="max-h-full max-w-full object-contain select-none touch-none"
                style={{ aspectRatio: `${current.w} / ${current.h}`, backgroundImage: `url(${current.blur})`, backgroundSize: "cover" }}
                variants={{
                  enter: (d: number) => ({ x: `${d * 12}%`, opacity: 0, scale: 0.96 }),
                  center: { x: 0, opacity: 1, scale: 1 },
                  exit: (d: number) => ({ x: `${d * -12}%`, opacity: 0, scale: 0.96 }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.7, ease: EXPO }}
                drag
                dragSnapToOrigin
                dragElastic={0.6}
                onDragEnd={onDragEnd}
                draggable={false}
              />
            </AnimatePresence>
          </div>

          <button
            onClick={() => go(-1)}
            className="absolute left-0 top-1/2 -translate-y-1/2 hidden md:flex h-40 w-24 items-center justify-center label text-paper/60 hover:text-paper"
            aria-label="Previous photo"
          >
            ←
          </button>
          <button
            onClick={() => go(1)}
            className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:flex h-40 w-24 items-center justify-center label text-paper/60 hover:text-paper"
            aria-label="Next photo"
          >
            →
          </button>
          <p className="absolute bottom-5 inset-x-0 text-center label text-paper/40 md:hidden">Swipe · drag down to close</p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
