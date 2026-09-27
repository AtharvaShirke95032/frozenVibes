/** Endless horizontal ticker. Content is duplicated so the loop is seamless. */
export default function Marquee({ items, duration = 40, className = "" }: { items: string[]; duration?: number; className?: string }) {
  const row = (
    <div className="flex shrink-0 items-center">
      {items.map((item, i) => (
        <span key={i} className="flex items-center">
          <span className="display px-6 md:px-10 leading-[1.2] py-[0.08em]">{item}</span>
          <span className="inline-block size-2 rounded-full bg-current opacity-40" />
        </span>
      ))}
    </div>
  );
  return (
    <div className={`overflow-hidden whitespace-nowrap ${className}`} aria-label={items.join(", ")}>
      <div className="marquee-track flex w-max" style={{ ["--marquee-duration" as string]: `${duration}s` }} aria-hidden>
        {row}
        {row}
      </div>
    </div>
  );
}
