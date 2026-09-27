import { Link } from "@/components/PageTransition";

export default function NotFound() {
  return (
    <section className="gutter min-h-[80svh] flex flex-col justify-center pt-32">
      <p className="label text-mute mb-6">404</p>
      <h1 className="display text-[18vw] md:text-[10vw] leading-[0.85]">
        This moment <span className="italic">slipped away.</span>
      </h1>
      <Link href="/" className="mt-12 label border-b border-current pb-1 w-fit">
        Back home →
      </Link>
    </section>
  );
}
