import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Gallery from "@/components/Gallery";
import { Link } from "@/components/PageTransition";
import { FadeUp, Photo, RevealText } from "@/components/Reveal";
import { films } from "@/data/films";
import { getStory, stories } from "@/data/stories";
import { img, variant } from "@/lib/media";

export const dynamicParams = false;

export function generateStaticParams() {
  return stories.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps<"/stories/[slug]">): Promise<Metadata> {
  const story = getStory((await params).slug);
  if (!story) return {};
  return {
    title: story.couple,
    description: `${story.couple}${story.place ? ` — ${story.place}` : ""}. A wedding story photographed by Frozen Vibes.`,
    openGraph: { images: [{ url: variant(story.cover, 1280) }] },
  };
}

export default async function StoryPage({ params }: PageProps<"/stories/[slug]">) {
  const { slug } = await params;
  const story = getStory(slug);
  if (!story) notFound();

  const index = stories.indexOf(story);
  const next = stories[(index + 1) % stories.length];
  const firstName = story.couple.split(" & ")[0];
  const film = films.find((f) => f.couple.includes(firstName) && !f.kind);
  const photos = story.photos.filter((k) => k !== story.coverKey).map(img);

  return (
    <>
      <header className="relative h-[100svh] min-h-[600px] overflow-hidden bg-ink text-paper">
        <div className="absolute inset-0 opacity-90">
          <Photo image={story.cover} alt="" aspect="auto" className="!absolute inset-0 h-full" parallax={10} priority reveal={false} />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-ink/25" />
        <div className="relative z-10 flex h-full flex-col justify-end gutter pb-10">
          <p className="label text-paper/70 mb-5">
            Story {String(index + 1).padStart(2, "0")}
            {story.place ? ` · ${story.place}` : ""}
          </p>
          <RevealText as="h1" immediate className="display text-[17vw] md:text-[11vw] leading-[0.85]" delay={0.3}>
            {story.couple}
          </RevealText>
        </div>
      </header>

      <section className="gutter py-20 md:py-28 grid gap-8 md:grid-cols-12 border-b hairline">
        <p className="label text-mute md:col-span-3">{story.photos.length} photographs</p>
        <FadeUp className="md:col-span-6">
          <p className="display text-3xl md:text-5xl leading-[1.08]">
            A celebration of {story.couple.replace(" & ", " and ")} — the rituals, the people and the quiet moments in
            between.
          </p>
        </FadeUp>
        {film && (
          <div className="md:col-span-3 md:text-right">
            <Link href="/films/" className="label border-b border-current pb-1">
              Watch their film →
            </Link>
          </div>
        )}
      </section>

      <section className="gutter py-16 md:py-24">
        <Gallery images={photos} title={story.couple} />
      </section>

      <Link href={`/stories/${next.slug}/`} className="group block relative overflow-hidden bg-ink text-paper" data-cursor="Next">
        <div className="absolute inset-0 opacity-50 transition-opacity duration-1000 group-hover:opacity-70">
          <Photo image={next.cover} alt="" aspect="auto" className="!absolute inset-0 h-full" reveal={false} />
        </div>
        <div className="relative gutter py-32 md:py-48 text-center">
          <p className="label text-paper/70 mb-6">Next story</p>
          <p className="display text-[14vw] md:text-[9vw] leading-[0.9] transition-transform duration-1000 ease-[var(--ease-expo)] group-hover:-translate-y-2">
            {next.couple}
          </p>
        </div>
      </Link>
    </>
  );
}
