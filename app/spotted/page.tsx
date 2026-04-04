"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Gem, Share2, TrendingDown } from "lucide-react";
import { listingsService } from "@/services/listings.service";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { proxyImageUrl } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";
import type { Listing } from "@/types/domain";

/**
 * Quality + condition score. Primary axes are km / year / warranty.
 * Discount is a bonus — it can tip a borderline gem but cannot make one on its own
 * (max +2 bonus, threshold is 3).
 */
function gemScore(l: Listing): number {
  let s = 0;
  // condition
  if ((l.km ?? Infinity) < 10_000) s += 4;
  else if ((l.km ?? Infinity) < 20_000) s += 3;
  else if ((l.km ?? Infinity) < 40_000) s += 1;
  if ((l.manufacture_year ?? 0) >= 2024) s += 3;
  else if ((l.manufacture_year ?? 0) >= 2022) s += 2;
  if (l.warranty_status && !["no warranty", "no", "none", ""].includes(l.warranty_status.toLowerCase())) s += 2;
  // price bonus (secondary)
  if ((l.discount_pct ?? 0) >= 10) s += 2;
  else if ((l.discount_pct ?? 0) >= 5) s += 1;
  return s;
}

interface GemBadge { label: string; cls: string }

function gemBadges(l: Listing): GemBadge[] {
  const badges: GemBadge[] = [];
  if ((l.km ?? Infinity) < 10_000)
    badges.push({ label: "Almost new — <10k km", cls: "bg-emerald-100 text-emerald-800" });
  else if ((l.km ?? Infinity) < 20_000)
    badges.push({ label: "Low mileage — <20k km", cls: "bg-teal-100 text-teal-800" });
  if ((l.manufacture_year ?? 0) >= 2024)
    badges.push({ label: "2024 or newer", cls: "bg-blue-100 text-blue-700" });
  else if ((l.manufacture_year ?? 0) >= 2022)
    badges.push({ label: "Recent model", cls: "bg-blue-50 text-blue-600" });
  if (l.warranty_status && !["no warranty", "no", "none", ""].includes(l.warranty_status.toLowerCase()))
    badges.push({ label: "Under warranty", cls: "bg-violet-100 text-violet-700" });
  if ((l.discount_pct ?? 0) >= 10)
    badges.push({ label: `${Math.round(l.discount_pct!)}% below avg`, cls: "bg-orange-100 text-orange-700" });
  else if ((l.discount_pct ?? 0) >= 5)
    badges.push({ label: `${Math.round(l.discount_pct!)}% below avg`, cls: "bg-amber-50 text-amber-700" });
  return badges;
}

function copyUrl(productId: string) {
  const url = `${window.location.origin}/listings/${productId}`;
  navigator.clipboard.writeText(url).catch(() => {});
}

function GemCard({ listing }: { listing: Listing }) {
  const img = listing.main_image_url ? proxyImageUrl(listing.main_image_url) : null;
  const badges = gemBadges(listing);
  const saved =
    listing.discount_qar ??
    (listing.expected_price_qar && listing.discount_pct
      ? Math.round((listing.expected_price_qar * listing.discount_pct) / 100)
      : null);

  return (
    <div className="break-inside-avoid mb-4 rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden transition hover:shadow-md">
      <Link href={`/listings/${listing.product_id}`} className="block">
        {img ? (
          <img src={img} alt={listing.title} className="w-full max-h-48 object-cover" />
        ) : (
          <div className="h-36 w-full bg-neutral-100 flex items-center justify-center">
            <Gem className="h-8 w-8 text-neutral-300" />
          </div>
        )}
      </Link>

      <div className="p-3 space-y-2">
        {/* why it is a gem */}
        <div className="flex flex-wrap gap-1">
          {badges.map((b) => (
            <span key={b.label} className={`rounded-full px-2 py-0.5 text-xs font-medium ${b.cls}`}>
              {b.label}
            </span>
          ))}
        </div>

        <Link href={`/listings/${listing.product_id}`}>
          <p className="text-sm font-semibold text-neutral-900 line-clamp-2 hover:text-blue-700 transition">
            {listing.title}
          </p>
        </Link>

        <div className="flex flex-wrap gap-2 text-xs text-neutral-500">
          {listing.manufacture_year && <span>{listing.manufacture_year}</span>}
          {listing.km !== undefined && <span>{listing.km.toLocaleString()} km</span>}
          {listing.city && <span>{listing.city}</span>}
        </div>

        {/* price row */}
        <div className="flex items-baseline gap-2 flex-wrap">
          <p className="text-base font-bold text-neutral-900">{formatCurrencyQAR(listing.price_qar)}</p>
          {listing.expected_price_qar && (
            <span className="text-xs text-neutral-400 line-through">
              {formatCurrencyQAR(listing.expected_price_qar)}
            </span>
          )}
          {saved && saved > 0 && (
            <span className="flex items-center gap-0.5 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
              <TrendingDown className="h-3 w-3" />
              Save {formatCurrencyQAR(saved)}
            </span>
          )}
        </div>

        <div className="flex gap-2 pt-1">
          <Link href={`/listings/${listing.product_id}`} className="flex-1">
            <Button size="sm" className="w-full">View listing</Button>
          </Link>
          <Button
            size="sm"
            variant="secondary"
            title="Copy link"
            onClick={() => copyUrl(listing.product_id)}
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

const FILTERS = [
  { label: "All gems", key: "all" },
  { label: "✨ Nearly new (<20k km)", key: "new" },
  { label: "🛡️ Under warranty", key: "warranty" },
  { label: "📅 2024+ model", key: "year" },
  { label: "📉 Priced below avg", key: "deal" },
] as const;
type FilterKey = (typeof FILTERS)[number]["key"];

export default function SpottedPage() {
  const [filter, setFilter] = useState<FilterKey>("all");

  const query = useQuery({
    queryKey: ["hidden-gems"],
    queryFn: () => listingsService.list({ limit: 500 }),
    staleTime: 5 * 60_000,
  });

  const scored = (query.data?.rows ?? [])
    .map((l) => ({ listing: l, score: gemScore(l) }))
    .filter(({ score: s }) => s >= 3)
    .sort((a, b) => b.score - a.score)
    .slice(0, 40)
    .map(({ listing }) => listing);

  const filtered = scored.filter((l) => {
    if (filter === "new") return (l.km ?? Infinity) < 20_000;
    if (filter === "warranty")
      return !!l.warranty_status && !["no warranty", "no", "none", ""].includes(l.warranty_status.toLowerCase());
    if (filter === "year") return (l.manufacture_year ?? 0) >= 2024;
    if (filter === "deal") return (l.discount_pct ?? 0) >= 5;
    return true;
  });

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div className="flex items-start gap-3">
        <Gem className="mt-1 h-6 w-6 shrink-0 text-violet-500" />
        <div>
          <h1 className="text-2xl font-semibold">Hidden Gems 💎</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Low-mileage, nearly new, and under-warranty cars ranked by{" "}
            <strong>condition</strong>. Discount vs market average shown where available.
            Click any card to view the full listing.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {FILTERS.map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              filter === key
                ? "border-neutral-900 bg-neutral-900 text-white"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
            }`}
          >
            {label}
          </button>
        ))}
        {!query.isLoading && (
          <span className="ml-auto self-center text-xs text-neutral-400">
            {filtered.length} gem{filtered.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {query.isLoading && (
        <div className="columns-2 md:columns-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="break-inside-avoid mb-4 h-64 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      )}

      {query.isError && (
        <Card className="py-16 text-center text-neutral-400">
          Could not load listings. Please try again.
        </Card>
      )}

      {!query.isLoading && filtered.length === 0 && (
        <Card className="py-16 text-center text-neutral-400">
          No gems matching this filter right now — try another or check back soon.
        </Card>
      )}

      {!query.isLoading && filtered.length > 0 && (
        <div className="columns-2 md:columns-3 gap-4">
          {filtered.map((l) => (
            <GemCard key={l.product_id} listing={l} />
          ))}
        </div>
      )}
    </section>
  );
}
