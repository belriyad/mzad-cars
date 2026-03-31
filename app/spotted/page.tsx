"use client";

import { useQuery } from "@tanstack/react-query";
import { MessageCircle, Share2 } from "lucide-react";
import { listingsService } from "@/services/listings.service";
import { DealBadge } from "@/components/listings/deal-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { proxyImageUrl } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";
import type { Listing } from "@/types/domain";

function score(l: Listing): number {
  let s = 0;
  if ((l.discount_pct ?? 0) > 10) s += 3;
  if ((l.km ?? Infinity) < 20_000) s += 2;
  if ((l.manufacture_year ?? 0) >= 2023) s += 2;
  if ((l.peer_count ?? 0) >= 5) s += 1;
  return s;
}

function whyBadge(l: Listing): string {
  const reasons: string[] = [];
  if ((l.discount_pct ?? 0) > 10) reasons.push("Great deal");
  if ((l.km ?? Infinity) < 20_000) reasons.push("Low KM");
  if ((l.manufacture_year ?? 0) >= 2023) reasons.push("New model");
  if ((l.peer_count ?? 0) >= 5) reasons.push("Well compared");
  return reasons.join(" · ") || "Interesting find";
}

function whatsappHref(l: Listing): string {
  const num = (l.seller_whatsapp ?? l.seller_phone ?? "").replace(/\D/g, "");
  if (!num) return l.url ?? "#";
  return `https://wa.me/${num}?text=${encodeURIComponent("Hi, I saw your car on Mzad Cars — is it still available?")}`;
}

function copyUrl(productId: string) {
  const url = `${window.location.origin}/listings/${productId}`;
  navigator.clipboard.writeText(url).catch(() => {});
}

function SpottedCard({ listing }: { listing: Listing }) {
  const img = listing.main_image_url ? proxyImageUrl(listing.main_image_url) : null;
  const why = whyBadge(listing);

  return (
    <div className="break-inside-avoid rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition">
      {img ? (
        <img src={img} alt={listing.title} className="w-full object-cover max-h-48" />
      ) : (
        <div className="h-36 w-full bg-neutral-100" />
      )}
      <div className="p-3 space-y-2">
        <span className="inline-block rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
          {why}
        </span>
        <p className="text-sm font-semibold text-neutral-900 line-clamp-2">{listing.title}</p>
        <p className="text-base font-bold text-neutral-900">{formatCurrencyQAR(listing.price_qar)}</p>
        <DealBadge listing={listing} />
        <div className="flex gap-2 pt-1">
          <a href={whatsappHref(listing)} target="_blank" rel="noopener noreferrer" className="flex-1">
            <Button size="sm" variant="premium" className="w-full gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              WhatsApp
            </Button>
          </a>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1"
            onClick={() => copyUrl(listing.product_id)}
            title="Copy link"
          >
            <Share2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function SpottedPage() {
  const query = useQuery({
    queryKey: ["spotted"],
    queryFn: () => listingsService.list({ limit: 500 }),
    staleTime: 5 * 60_000,
  });

  const top30 = (query.data?.rows ?? [])
    .map((l) => ({ listing: l, score: score(l) }))
    .filter(({ score: s }) => s > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 30)
    .map(({ listing }) => listing);

  return (
    <section className="mx-auto max-w-5xl space-y-6 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Spotted in Qatar 🇶🇦</h1>
        <p className="text-sm text-neutral-500">
          Our algorithm's top picks — low KM, great deals, and rare finds.
        </p>
      </div>

      {query.isLoading && (
        <div className="columns-2 md:columns-3 gap-4 space-y-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="break-inside-avoid h-64 animate-pulse rounded-2xl bg-neutral-100 mb-4" />
          ))}
        </div>
      )}

      {query.isError && (
        <Card className="py-16 text-center text-neutral-400">
          Could not load listings. Please try again.
        </Card>
      )}

      {!query.isLoading && top30.length === 0 && (
        <Card className="py-16 text-center text-neutral-400">
          No spotted listings right now — check back soon!
        </Card>
      )}

      {!query.isLoading && top30.length > 0 && (
        <div className="columns-2 md:columns-3 gap-4">
          {top30.map((l) => (
            <div key={l.product_id} className="mb-4">
              <SpottedCard listing={l} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
