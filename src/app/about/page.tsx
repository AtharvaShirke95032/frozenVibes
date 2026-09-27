import type { Metadata } from "next";
import Marquee from "@/components/Marquee";
import { Link } from "@/components/PageTransition";
import { FadeUp, Photo, RevealText } from "@/components/Reveal";
import ScrollText from "@/components/ScrollText";
import { about, services, team } from "@/data/site";
import { img } from "@/lib/media";

export const metadata: Metadata = {
  title: "About",
  description:
    "Frozen Vibes brings together photography, engineering and visual arts to capture authentic wedding stories — founded by Nikhil Malusare and Rahul Gosavi.",
};

export default function AboutPage() {
  return (
    <>
      <header className="gutter pt-40 md:pt-48 pb-16">
        <p className="label text-mute mb-6">About the studio</p>
        <RevealText as="h1" immediate className="display text-[15vw] md:text-[9vw] leading-[0.88] max-w-[14ch]">
          We keep the feeling, not just the photo.
        </RevealText>
      </header>

      <section className="gutter grid gap-6 md:grid-cols-12 items-start">
        <div className="md:col-span-7">
          <Photo image={img("home/FRV_7386-scaled.jpg")} alt="A bride on stage under soft lights" aspect="4/5" parallax={8} priority sizes="(min-width: 768px) 58vw, 100vw" />
        </div>
        <div className="md:col-span-4 md:col-start-9 md:mt-48">
          <Photo image={img("home/FRV_0784-2-scaled.jpg")} alt="A couple walking hand in hand" aspect="3/4" parallax={12} sizes="(min-width: 768px) 33vw, 100vw" />
          <p className="label text-mute mt-4">Mumbai &amp; India</p>
        </div>
      </section>

      <section className="gutter py-28 md:py-44 grid gap-10 md:grid-cols-12">
        <p className="label text-mute md:col-span-3 md:pt-3">Our approach</p>
        <div className="md:col-span-9">
          <ScrollText className="display text-[8.5vw] md:text-[4vw] leading-[1.05]" text={about.lead} />
          <div className="mt-14 grid gap-8 sm:grid-cols-2 max-w-3xl text-mute leading-relaxed">
            {about.body.map((p, i) => (
              <FadeUp key={i} delay={i * 0.08} className={i === 2 ? "sm:col-span-2" : ""}>
                <p>{p}</p>
              </FadeUp>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y hairline py-8 md:py-10" aria-label="What we do">
        <Marquee items={services} className="text-5xl md:text-7xl" duration={40} />
      </section>

      <section className="gutter py-28 md:py-44">
        <RevealText as="h2" className="display text-6xl md:text-8xl mb-16 md:mb-24">
          The founders
        </RevealText>
        <div className="grid gap-20 md:grid-cols-2 md:gap-10">
          {team.map((p, i) => (
            <article key={p.name} className={i === 1 ? "md:mt-32" : ""}>
              <div className="w-3/4 max-w-md">
                <Photo image={img(p.image)} alt={p.name} aspect="1/1" className="rounded-full [&_img]:scale-110" sizes="(min-width: 768px) 30vw, 75vw" />
              </div>
              <h3 className="display text-4xl md:text-5xl mt-8">{p.name}</h3>
              <p className="label text-mute mt-2">{p.role}</p>
              <p className="mt-5 max-w-md text-mute leading-relaxed">{p.bio}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="gutter pb-28 md:pb-40">
        <div className="grid gap-6 md:grid-cols-3">
          {["home/FRV_3864-1-scaled.jpg", "home/FRV_5091-1-scaled.jpg", "home/FRV_6786-1-scaled.jpg"].map((k, i) => (
            <Photo key={k} image={img(k)} alt="" aspect="4/5" className={i === 1 ? "md:mt-20" : ""} sizes="(min-width: 768px) 33vw, 100vw" />
          ))}
        </div>
        <div className="mt-20 text-center">
          <Link href="/stories/" className="display text-5xl md:text-7xl italic border-b border-current pb-2">
            See the stories →
          </Link>
        </div>
      </section>
    </>
  );
}
