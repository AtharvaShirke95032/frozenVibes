import type { Metadata } from "next";
import InquiryForm from "@/components/InquiryForm";
import { FadeUp, Photo, RevealText } from "@/components/Reveal";
import { contactCopy, site } from "@/data/site";
import { img } from "@/lib/media";

export const metadata: Metadata = {
  title: "Contact",
  alternates: { canonical: "/contact/" },
  description: "Tell us about your wedding. Frozen Vibes — Mumbai & India. hello@frozenvibes.in · +91 77095 55551.",
};

export default function ContactPage() {
  return (
    <>
      <header className="gutter pt-40 md:pt-48 pb-16 md:pb-24">
        <p className="label text-mute mb-6">Inquiries</p>
        <RevealText as="h1" immediate className="display text-[17vw] md:text-[11vw] leading-[0.85]">
          Say hello.
        </RevealText>
      </header>

      <section className="gutter pb-28 md:pb-40 grid gap-16 md:grid-cols-12">
        <aside className="md:col-span-4">
          <FadeUp>
            <p className="display text-3xl md:text-4xl leading-[1.1]">{contactCopy.heading}</p>
            <p className="mt-6 text-mute leading-relaxed">{contactCopy.body}</p>
            <dl className="mt-12 space-y-6">
              <div>
                <dt className="label text-mute mb-1">Email</dt>
                <dd>
                  <a href={`mailto:${site.email}`} className="display text-2xl border-b border-current">
                    {site.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label text-mute mb-1">Phone</dt>
                <dd>
                  <a href={site.phoneHref} className="display text-2xl">
                    {site.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="label text-mute mb-1">Based in</dt>
                <dd className="display text-2xl">{site.location}</dd>
              </div>
            </dl>
          </FadeUp>
          <div className="mt-14 hidden md:block w-2/3">
            <Photo image={img("home/FRV_8399-scaled.jpg")} alt="" aspect="3/4" parallax={8} sizes="25vw" />
          </div>
        </aside>

        <div className="md:col-span-7 md:col-start-6">
          <InquiryForm />
        </div>
      </section>
    </>
  );
}
