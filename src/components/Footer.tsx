"use client";

import { Link } from "@/components/PageTransition";
import Magnetic from "@/components/Magnetic";
import { RevealText } from "@/components/Reveal";
import { useLenis } from "@/components/SmoothScroll";
import { nav, site } from "@/data/site";

export default function Footer() {
  const lenis = useLenis();

  return (
    <footer className="bg-ink text-paper gutter pt-24 md:pt-36 pb-6 relative overflow-hidden">
      <div className="grid gap-16 md:grid-cols-12">
        <div className="md:col-span-7">
          <p className="label text-paper/50 mb-6">Have a date in mind?</p>
          <RevealText as="h2" className="display text-[13vw] md:text-[7.5vw]">
            Let’s make it timeless.
          </RevealText>
          <div className="mt-10">
            <Magnetic>
              <Link
                href="/contact/"
                className="inline-flex items-center gap-4 rounded-full border border-paper/30 px-8 py-4 label hover:bg-paper hover:text-ink transition-colors duration-500"
              >
                Start your inquiry <span aria-hidden>→</span>
              </Link>
            </Magnetic>
          </div>
        </div>

        <div className="md:col-span-5 grid grid-cols-2 gap-10 md:pt-14 text-sm">
          <div className="flex flex-col gap-3">
            <p className="label text-paper/50 mb-2">Contact</p>
            <a className="hover:text-frost transition-colors" href={`mailto:${site.email}`}>
              {site.email}
            </a>
            <a className="hover:text-frost transition-colors" href={site.phoneHref}>
              {site.phone}
            </a>
            <span className="text-paper/60">{site.location}</span>
          </div>
          <div className="flex flex-col gap-3">
            <p className="label text-paper/50 mb-2">Explore</p>
            {nav.map((n) => (
              <Link key={n.href} href={n.href} className="hover:text-frost transition-colors w-fit">
                {n.label}
              </Link>
            ))}
            <a className="hover:text-frost transition-colors w-fit" href={site.social.instagram} target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
            <a className="hover:text-frost transition-colors w-fit" href={site.social.facebook} target="_blank" rel="noreferrer">
              Facebook ↗
            </a>
          </div>
        </div>
      </div>

      <div className="mt-24 md:mt-36 select-none" aria-hidden>
        <p className="display text-[23vw] leading-[0.75] tracking-[-0.04em] text-center text-paper/95">
          frozen<span className="italic">Vibes</span>
        </p>
      </div>

      <div className="mt-8 flex flex-col-reverse gap-3 md:flex-row md:items-center md:justify-between label text-paper/40">
        <span>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</span>
        <button
          className="w-fit hover:text-paper transition-colors"
          onClick={() => (lenis ? lenis.scrollTo(0, { duration: 2 }) : window.scrollTo({ top: 0, behavior: "smooth" }))}
        >
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}
