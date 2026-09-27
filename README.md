# frozenVibes — website redesign

Minimalist, motion-rich rebuild of [frozenvibes.in](https://frozenvibes.in) (wedding photography & films, Mumbai).

**Stack:** Next.js 16 (App Router, static export) · Tailwind CSS 4 · Motion (Framer Motion) · three.js via @react-three/fiber + drei · Lenis smooth scroll.

## Commands

```bash
npm run dev                         # http://localhost:3000
npm run build                       # static site → out/  (upload this folder to any static host)
python3 scripts/extract.py          # re-pull pages + original photos from the live WordPress site → source/
node scripts/optimize-images.mjs    # source/images → public/media (WebP 640/1280/2048) + src/data/media.generated.ts
```

## Where things live

| What | Where |
| --- | --- |
| Copy, contact details, founders, services, testimonials | `src/data/site.ts` |
| Films (YouTube IDs) | `src/data/films.ts` |
| Story order, names, places, covers | `src/data/stories.ts` |
| Home hero slides | `src/data/home.ts` |
| Inquiry form endpoint (Formspree etc.) | `FORM_ENDPOINT` in `src/data/site.ts` — empty = opens the visitor's email app |
| WebGL hero (frost dissolve + snow) | `src/components/three/HeroCanvas.tsx`, `frostShader.ts` |
| 3D stories ring | `src/components/three/StoriesRing.tsx` |
| Extracted source content | `source/content/` (`site.md`, `films.json`, `manifest.csv`, raw page HTML) |

To add a gallery: drop photos in `source/images/photos/<slug>/`, add an entry to `src/data/stories.ts`, run the optimizer.

All motion respects `prefers-reduced-motion`; WebGL scenes fall back to static images when WebGL2 is unavailable.
