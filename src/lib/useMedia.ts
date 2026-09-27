"use client";

import { useSyncExternalStore } from "react";

/** Subscribes to a CSS media query. Always false during SSR / hydration. */
export function useMediaQuery(query: string) {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/**
 * Hydration-safe replacement for motion's useReducedMotion: false on the server and during
 * hydration (so SSR markup always matches), then the real preference.
 */
export const useReducedMotion = () => useMediaQuery("(prefers-reduced-motion: reduce)");

let webgl2: boolean | undefined;
function detectWebGL2() {
  if (webgl2 === undefined) {
    try {
      webgl2 = !!document.createElement("canvas").getContext("webgl2");
    } catch {
      webgl2 = false;
    }
  }
  return webgl2;
}

/** Whether the browser can run the WebGL scenes. Always false during SSR / hydration. */
export function useWebGL2() {
  return useSyncExternalStore(
    () => () => {},
    detectWebGL2,
    () => false,
  );
}
