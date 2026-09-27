import { galleries, media } from "@/data/media.generated";
import { img, type Img } from "@/lib/media";

type StoryDef = {
  slug: string;
  couple: string;
  place?: string;
  /** File name of the cover photo on the original Photos page. */
  cover?: string;
};

// Order and covers follow the original site's Photos page.
const defs: StoryDef[] = [
  { slug: "shrishti-and-jugal", couple: "Shrishti & Jugal", cover: "FRV_7551-scaled.jpg" },
  { slug: "shikha-and-rushabh", couple: "Shikha & Rushabh", cover: "FRV_31402-scaled.jpg" },
  { slug: "tanushka-and-siddhant", couple: "Tanushka & Siddhant", cover: "FRV_6210-edited.jpg" },
  { slug: "sunaina-and-dan", couple: "Sunaina & Dan", place: "Goa", cover: "99A0837-scaled.jpg" },
  { slug: "divya-and-chaitanya", couple: "Divya & Chaitanya", place: "Pune", cover: "FRV_7573-2-edited-scaled.jpg" },
  { slug: "pratyushi-and-vedant", couple: "Pratyushi & Vedant", place: "Jodhpur", cover: "FRV_0227-scaled.jpg" },
  { slug: "anushkta-and-archit", couple: "Anushka & Archit", place: "Phuket" },
  { slug: "devina-and-siddkenya", couple: "Devina & Sidd", place: "Kenya", cover: "FRV_3735-edited.jpg" },
  { slug: "ayusha-and-vibhor", couple: "Aayusha & Vibhor", place: "Goa", cover: "FRV_2616-scaled.jpg" },
];

export type Story = { slug: string; couple: string; place?: string; cover: Img; coverKey: string; photos: string[] };

function findKey(fileName: string) {
  return Object.keys(media).find((k) => k.endsWith(`/${fileName}`) || k.endsWith(`-${fileName}`));
}

export const stories: Story[] = defs
  .filter((d) => galleries[d.slug]?.length)
  .map((d) => {
    const photos = galleries[d.slug];
    const coverKey = (d.cover && findKey(d.cover)) || photos[0];
    return { ...d, photos, coverKey, cover: img(coverKey) };
  });

export const getStory = (slug: string) => stories.find((s) => s.slug === slug);

/** Uploads from the original media library that never made it onto a page. */
export const moments: Img[] = (galleries.moments ?? []).map(img);
