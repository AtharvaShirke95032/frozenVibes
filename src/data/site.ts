// Copy and contact details, carried over from the original frozenvibes.in.

export const site = {
  name: "frozenVibes",
  legalName: "Frozen Vibes",
  url: "https://frozenvibes.in",
  tagline: "Wedding photography & films",
  description:
    "Frozen Vibes is a Mumbai-based wedding photography and film studio capturing authentic love stories across India and beyond — joy, laughter, tears and love, preserved in a natural and timeless way.",
  email: "hello@frozenvibes.in",
  phone: "+91 77095 55551",
  phoneHref: "tel:+917709555551",
  location: "Mumbai & India",
  social: {
    instagram: "https://www.instagram.com/frozenvibes.in/",
    facebook: "https://www.facebook.com/frozenvibesbynikhil/",
  },
};

export const nav = [
  { href: "/stories/", label: "Stories" },
  { href: "/films/", label: "Films" },
  { href: "/about/", label: "About" },
  { href: "/contact/", label: "Contact" },
];

export const about = {
  lead: "Every couple has a one-of-a-kind story. We capture it in its most authentic form — full of joy, laughter, tears, and love.",
  body: [
    "Our team brings together diverse backgrounds in photography, engineering, and visual arts, allowing us to offer a unique perspective on every wedding we shoot.",
    "Our work is about creating a comfortable environment where couples can be themselves, ensuring that each shot is genuine and reflective of your love.",
    "With a commitment to quality, attention to detail, and a personal touch, we strive to make your wedding day unforgettable. Whether you’re planning a grand celebration or an intimate gathering, we’re here to preserve those cherished moments for you to relive time and time again.",
  ],
};

export const team = [
  {
    name: "Nikhil Malusare",
    role: "Founder · CEO",
    image: "home/nik-1.png",
    bio: "The driving force behind Frozen Vibes. Nikhil’s journey began as a photographer during his early engineering days, and a deep passion for crafting timeless wedding memories has led him to lead a team of talented creatives today.",
  },
  {
    name: "Rahul Gosavi",
    role: "Co-founder · COO",
    image: "home/rah-1.png",
    bio: "With a keen eye for detail and a passion for storytelling, Rahul shapes the creative direction of Frozen Vibes — making sure every wedding we cover is a true reflection of the couple’s love story.",
  },
];

export const services = [
  "Wedding Photography",
  "Cinematic Wedding Films",
  "Pre-Wedding",
  "Engagement Sessions",
  "Maternity",
  "Family Days",
];

export const contactCopy = {
  heading: "We are honored and humbled.",
  body: "Tell us about your celebration with as much detail as you can so we can prepare an accurate quote. We aim to respond within 48 hours — if you haven’t heard from us by then, or it’s urgent, please give us a call.",
  interests: [
    "Wedding Photography",
    "Engagement Session/Pre Wedding",
    "Cinematic Wedding Films",
    "Maternity Session",
    "Family Day",
    "Others",
  ],
  referral: ["Instagram", "Google", "Press/Media", "We shot your friend’s wedding.", "Facebook"],
};

/**
 * Set to a Formspree (or similar) endpoint to submit the inquiry form over HTTP.
 * While empty, the form opens the visitor's email client with a pre-filled message.
 */
export const FORM_ENDPOINT = "";

/** Client testimonials. The section is hidden while this list is empty. */
export const testimonials: { couple: string; quote: string }[] = [];
