"use client";

import { useState } from "react";
import Image from "next/image";

const FALLBACK =
  "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=1200&auto=format&fit=crop";

export function ImageCarousel({ images }: { images: string[] }) {
  const all = images.length ? images : [FALLBACK];
  const [active, setActive] = useState(0);

  // Single image — show it at a comfortable height, not full-bleed
  if (all.length === 1) {
    return (
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={all[0]}
          alt="Car photo"
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          priority
        />
      </div>
    );
  }

  // Multi-image — hero + thumbnail strip
  const thumbs = all.slice(1, 5); // show up to 4 thumbs
  const remaining = all.length - 5; // how many more are hidden

  return (
    <div className="space-y-2">
      {/* ── Hero ── */}
      <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-neutral-100">
        <Image
          src={all[active]}
          alt={`Car photo ${active + 1}`}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover transition-opacity duration-300"
          priority={active === 0}
        />
        {/* image counter pill */}
        <span className="absolute bottom-2 right-2 rounded-full bg-black/60 px-2.5 py-1 text-xs font-medium text-white">
          {active + 1} / {all.length}
        </span>
        {/* prev/next arrows */}
        {active > 0 && (
          <button
            onClick={() => setActive((v) => v - 1)}
            className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            aria-label="Previous photo"
          >
            <ChevronLeft />
          </button>
        )}
        {active < all.length - 1 && (
          <button
            onClick={() => setActive((v) => v + 1)}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
            aria-label="Next photo"
          >
            <ChevronRight />
          </button>
        )}
      </div>

      {/* ── Thumbnail strip ── */}
      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
        {thumbs.map((src, idx) => {
          const realIdx = idx + 1;
          const isLast = idx === thumbs.length - 1 && remaining > 0;
          return (
            <button
              key={src}
              onClick={() => setActive(realIdx)}
              className={`relative aspect-[4/3] overflow-hidden rounded-xl bg-neutral-100 focus:outline-none ${
                active === realIdx
                  ? "ring-2 ring-neutral-900 ring-offset-1"
                  : "opacity-80 hover:opacity-100"
              }`}
            >
              <Image
                src={src}
                alt={`Car photo ${realIdx + 1}`}
                fill
                sizes="25vw"
                className="object-cover"
                loading="lazy"
              />
              {isLast && (
                <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/55">
                  <span className="text-sm font-semibold text-white">+{remaining + 1}</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// Inline micro-icons to avoid an extra import
function ChevronLeft() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}
function ChevronRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}
