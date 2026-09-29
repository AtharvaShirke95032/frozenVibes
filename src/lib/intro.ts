"use client";

import { useSyncExternalStore } from "react";

// Tiny global flag: has the preloader finished? Hero animations wait for it.
let done = false;
const listeners = new Set<() => void>();

export function markIntroDone() {
  if (done) return;
  done = true;
  listeners.forEach((l) => l());
}

export function useIntroDone() {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => done,
    () => false,
  );
}

// The WebGL hero registers itself so the preloader can hold until its textures are uploaded
// and shaders compiled — otherwise that main-thread work lands right as the page is revealed.
let heroPending: Promise<void> | null = null;
let resolveHero: (() => void) | null = null;
let heroDone = false;

export function expectHero() {
  if (heroPending || heroDone) return;
  heroPending = new Promise<void>((r) => (resolveHero = r));
}

export function markHeroReady() {
  heroDone = true;
  resolveHero?.();
}

/** Resolves once a registered hero is ready (immediately if no hero is on the page). */
export const heroReady = () => heroPending ?? Promise.resolve();
