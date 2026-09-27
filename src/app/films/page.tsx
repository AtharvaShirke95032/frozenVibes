import type { Metadata } from "next";
import { FilmGrid } from "@/components/Films";
import { FadeUp, RevealText } from "@/components/Reveal";
import { films } from "@/data/films";

export const metadata: Metadata = {
  title: "Films",
  alternates: { canonical: "/films/" },
  description: "Cinematic wedding and pre-wedding films by Frozen Vibes — Goa, Jodhpur, Pune, Dubai, Phuket, Kenya and more.",
};

export default function FilmsPage() {
  const weddings = films.filter((f) => f.kind !== "Pre-wedding");
  const preWeddings = films.filter((f) => f.kind === "Pre-wedding");

  return (
    <div className="bg-ink text-paper">
      <header className="gutter pt-40 md:pt-48 pb-20 md:pb-28 grid gap-10 md:grid-cols-12 md:items-end">
        <div className="md:col-span-8">
          <p className="label text-paper/50 mb-6">Cinema · {films.length} films</p>
          <RevealText as="h1" immediate className="display text-[22vw] md:text-[14vw] leading-[0.82]">
            Films
          </RevealText>
        </div>
        <FadeUp className="md:col-span-4 text-paper/60 leading-relaxed max-w-sm" delay={0.4}>
          <p>
            Some days deserve to be heard as well as seen. Our films carry the music, the vows and the laughter — so you can
            relive the whole day, not just a moment of it.
          </p>
        </FadeUp>
      </header>

      <section className="gutter pb-28 md:pb-40" aria-labelledby="wedding-films">
        <h2 id="wedding-films" className="label text-paper/50 mb-10 border-t border-paper/15 pt-5">
          Wedding films
        </h2>
        <FilmGrid films={weddings} />
      </section>

      <section className="gutter pb-32 md:pb-48" aria-labelledby="prewedding-films">
        <h2 id="prewedding-films" className="label text-paper/50 mb-10 border-t border-paper/15 pt-5">
          Pre-wedding shoots
        </h2>
        <FilmGrid films={preWeddings} />
      </section>
    </div>
  );
}
