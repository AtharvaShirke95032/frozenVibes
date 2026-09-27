import type { Metadata } from "next";
import Gallery from "@/components/Gallery";
import StoriesIndex from "@/components/StoriesIndex";
import { Link } from "@/components/PageTransition";
import { Photo, RevealText } from "@/components/Reveal";
import { moments, stories } from "@/data/stories";
import { variant } from "@/lib/media";

export const metadata: Metadata = {
  title: "Stories",
  alternates: { canonical: "/stories/" },
  description: "Wedding stories photographed by Frozen Vibes — from Mumbai and Goa to Jodhpur, Phuket and Kenya.",
};

export default function StoriesPage() {
  const items = stories.map((s) => ({
    slug: s.slug,
    couple: s.couple,
    place: s.place,
    count: s.photos.length,
    url: variant(s.cover, 1280),
  }));

  return (
    <>
      <header className="gutter pt-40 md:pt-48 pb-10 md:pb-0">
        <p className="label text-mute mb-6">Photography · {stories.length} weddings</p>
        <RevealText as="h1" immediate className="display text-[22vw] md:text-[14vw] leading-[0.82]">
          Stories
        </RevealText>
      </header>

      <StoriesIndex items={items} />

      <section className="gutter py-24 md:py-36" aria-label="All stories">
        <div className="grid gap-x-6 gap-y-16 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map((s, i) => (
            <Link key={s.slug} href={`/stories/${s.slug}/`} className={`group block ${i % 3 === 1 ? "lg:mt-24" : ""}`} data-cursor="View">
              <div className="overflow-hidden">
                <div className="transition-transform duration-[1.4s] ease-[var(--ease-expo)] group-hover:scale-[1.04]">
                  <Photo image={s.cover} alt={`${s.couple} wedding`} aspect="4/5" sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                </div>
              </div>
              <div className="mt-5 flex items-baseline justify-between gap-4">
                <h2 className="display text-4xl">{s.couple}</h2>
                <span className="label text-mute tabular-nums">{String(i + 1).padStart(2, "0")}</span>
              </div>
              <p className="label text-mute mt-1">
                {s.place ? `${s.place} · ` : ""}
                {s.photos.length} photographs
              </p>
            </Link>
          ))}
        </div>
      </section>

      {moments.length > 0 && (
        <section className="gutter pb-28 md:pb-40" aria-label="More moments">
          <div className="border-t hairline pt-10 mb-14 md:mb-20 grid gap-6 md:grid-cols-12">
            <p className="label text-mute md:col-span-3 md:pt-4">Archive · {moments.length} frames</p>
            <div className="md:col-span-9">
              <RevealText as="h2" className="display text-6xl md:text-8xl">
                More moments
              </RevealText>
              <p className="mt-6 max-w-xl text-mute leading-relaxed">
                Frames from weddings we haven’t written up as full stories yet.
              </p>
            </div>
          </div>
          <Gallery images={moments} title="More moments" />
        </section>
      )}
    </>
  );
}
