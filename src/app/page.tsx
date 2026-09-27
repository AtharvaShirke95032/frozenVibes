import Hero, { type HeroSlide } from "@/components/Hero";
import HorizontalStories from "@/components/HorizontalStories";
import Marquee from "@/components/Marquee";
import ScrollText from "@/components/ScrollText";
import { FilmGrid } from "@/components/Films";
import { Link } from "@/components/PageTransition";
import Magnetic from "@/components/Magnetic";
import { FadeUp, Photo, RevealText } from "@/components/Reveal";
import { films } from "@/data/films";
import { services, site, team, testimonials } from "@/data/site";
import { stories } from "@/data/stories";
import { img, variant } from "@/lib/media";
import { heroSlides } from "@/data/home";

export default function Home() {
  const slides: HeroSlide[] = heroSlides.map((s) => {
    const image = img(s.key);
    return { image, texture: variant(image, 2048), caption: s.caption };
  });

  return (
    <>
      <Hero slides={slides} />

      {/* Intro statement */}
      <section className="gutter py-28 md:py-44">
        <div className="grid gap-10 md:grid-cols-12">
          <p className="label text-mute md:col-span-3 md:pt-4">( Frozen Vibes )</p>
          <div className="md:col-span-9">
            <ScrollText
              className="display text-[9.5vw] md:text-[4.6vw] leading-[1.02]"
              text="We believe every couple has a one-of-a-kind story. Our goal is to capture it in its most authentic form — full of joy, laughter, tears, and love."
            />
            <FadeUp className="mt-12 md:mt-16 grid gap-8 sm:grid-cols-2 max-w-3xl text-mute leading-relaxed" delay={0.1}>
              <p>
                Our team brings together diverse backgrounds in photography, engineering and visual arts, offering a unique
                perspective on every wedding we shoot.
              </p>
              <p>
                We create a comfortable space where couples can simply be themselves — so every frame is genuine and a true
                reflection of your love.
              </p>
            </FadeUp>
            <FadeUp className="mt-12" delay={0.2}>
              <Magnetic>
                <Link href="/about/" className="inline-flex items-center gap-3 label border-b border-current pb-1">
                  About the studio <span aria-hidden>→</span>
                </Link>
              </Magnetic>
            </FadeUp>
          </div>
        </div>
      </section>

      <HorizontalStories stories={stories} />

      {/* Services ticker */}
      <section className="border-y hairline py-8 md:py-10 my-24 md:my-36" aria-label="Services">
        <Marquee items={services} className="text-5xl md:text-7xl" duration={45} />
      </section>

      {/* Films teaser */}
      <section className="bg-ink text-paper gutter py-28 md:py-40">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between mb-16 md:mb-24">
          <div>
            <p className="label text-paper/50 mb-5">Cinematic wedding films</p>
            <RevealText as="h2" className="display text-[17vw] md:text-[11vw]">
              In motion.
            </RevealText>
          </div>
          <FadeUp className="max-w-sm text-paper/60 leading-relaxed">
            <p>
              Stories told the way they felt — the laughter, the rituals, the quiet in-between moments. From Mumbai to Kenya.
            </p>
            <Link href="/films/" className="mt-6 inline-flex items-center gap-3 label text-paper border-b border-paper/40 pb-1">
              All {films.length} films <span aria-hidden>→</span>
            </Link>
          </FadeUp>
        </div>
        <FilmGrid films={films.slice(0, 3)} variant="feature" />
      </section>

      {/* Founders */}
      <section className="gutter py-28 md:py-44">
        <div className="mb-16 md:mb-24 grid md:grid-cols-12 gap-6">
          <p className="label text-mute md:col-span-3 md:pt-5">The people behind the lens</p>
          <RevealText as="h2" className="display text-6xl md:text-8xl md:col-span-9">
            Meet the founders.
          </RevealText>
        </div>
        <div className="grid gap-20 md:grid-cols-2 md:gap-10">
          {team.map((p, i) => (
            <article key={p.name} className={i === 1 ? "md:mt-40" : ""}>
              <div className="w-3/4 max-w-md">
                <Photo image={img(p.image)} alt={p.name} aspect="1/1" className="rounded-full [&_img]:scale-110" sizes="(min-width: 768px) 30vw, 75vw" />
              </div>
              <div className="mt-8 flex items-baseline justify-between gap-4">
                <h3 className="display text-4xl md:text-5xl">{p.name}</h3>
                <span className="label text-mute shrink-0">{p.role}</span>
              </div>
              <p className="mt-4 max-w-md text-mute leading-relaxed">{p.bio}</p>
            </article>
          ))}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="gutter py-28 md:py-40 border-t hairline">
          <p className="label text-mute mb-10">Kind words</p>
          {testimonials.map((t) => (
            <figure key={t.couple} className="max-w-5xl mb-20">
              <blockquote className="display text-4xl md:text-6xl leading-[1.05]">“{t.quote}”</blockquote>
              <figcaption className="label text-mute mt-8">— {t.couple}</figcaption>
            </figure>
          ))}
        </section>
      )}

      <section className="gutter pb-28 md:pb-40">
        <div className="border-t hairline pt-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="display text-3xl md:text-4xl max-w-2xl">
            Based in Mumbai. Available across India <span className="italic">&amp; destinations worldwide.</span>
          </p>
          <a href={`mailto:${site.email}`} className="label border-b border-current pb-1 w-fit">
            {site.email}
          </a>
        </div>
      </section>
    </>
  );
}
