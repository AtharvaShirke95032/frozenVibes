import { media } from "@/data/media.generated";

export type Img = {
  /** Base public path; variants live at `${src}-${width}.webp`. */
  src: string;
  w: number;
  h: number;
  widths: number[];
  /** Tiny inline WebP used as a blurred placeholder. */
  blur: string;
};

export function img(key: string): Img {
  const found = media[key];
  if (!found) throw new Error(`Unknown media key: ${key}`);
  return found;
}

export const srcSet = (i: Img) => i.widths.map((w) => `${i.src}-${w}.webp ${w}w`).join(", ");

/** Largest variant not wider than `max` (for WebGL textures and OG images). */
export function variant(i: Img, max = 2048) {
  const w = [...i.widths].reverse().find((x) => x <= max) ?? i.widths[0];
  return `${i.src}-${w}.webp`;
}

export const ratio = (i: Img) => i.w / i.h;
