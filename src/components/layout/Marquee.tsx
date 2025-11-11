interface MarqueeProps {
  text: string;
  className?: string;
}

export function Marquee({ text, className = "" }: MarqueeProps) {
  return (
    <div className={`overflow-hidden bg-zinc-900 text-white py-2 ${className}`}>
      <div className="flex animate-marquee whitespace-nowrap">
        <span className="font-bold italic text-sm tracking-wide px-4">
          {text}
        </span>
        <span className="font-bold italic text-sm tracking-wide px-4">
          {text}
        </span>
        <span className="font-bold italic text-sm tracking-wide px-4">
          {text}
        </span>
        <span className="font-bold italic text-sm tracking-wide px-4">
          {text}
        </span>
        <span className="font-bold italic text-sm tracking-wide px-4">
          {text}
        </span>
      </div>
    </div>
  );
}
