"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { RefreshCw, MessageCircle } from "lucide-react";
import { listingsService } from "@/services/listings.service";
import { DealBadge } from "@/components/listings/deal-badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrencyQAR } from "@/lib/utils";
import { proxyImageUrl } from "@/types/domain";
import type { Listing } from "@/types/domain";

function whatsappHref(listing: Listing): string {
  const num = (listing.seller_whatsapp ?? listing.seller_phone ?? "").replace(/\D/g, "");
  if (!num) return listing.url ?? "#";
  return `https://wa.me/${num}?text=${encodeURIComponent("Hi, I saw your car on Mzad Cars — is it still available?")}`;
}

interface Group {
  label: string;
  icon: string;
  items: Listing[];
}

function groupListings(listings: Listing[]): Group[] {
  const hot: Listing[] = [];
  const good: Listing[] = [];
  const fair: Listing[] = [];

  for (const l of listings) {
    const pct = l.discount_pct;
    if (pct === undefined || pct === null) { fair.push(l); continue; }
    if (pct > 15) hot.push(l);
    else if (pct > 5) good.push(l);
    else fair.push(l);
  }

  return [
    { label: "Hot (>15% below market)", icon: "🔥", items: hot },
    { label: "Good (5–15% below market)", icon: "✅", items: good },
    { label: "Fair (<5% below market)", icon: "🏷️", items: fair },
  ];
}

function DropRow({ listing }: { listing: Listing }) {
  const imgUrl = listing.main_image_url
    ? proxyImageUrl(listing.main_image_url)
    : null;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-3 py-2.5 shadow-sm">
      {imgUrl ? (
        <img src={imgUrl} alt={listing.title} className="h-14 w-20 shrink-0 rounded-xl object-cover" />
      ) : (
        <div className="h-14 w-20 shrink-0 rounded-xl bg-neutral-100" />
      )}

      <div className="min-w-0 flex-1 space-y-0.5">
        <p className="truncate text-sm font-semibold text-neutral-900">{listing.title}</p>
        <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
          {listing.manufacture_year && <span>{listing.manufacture_year}</span>}
          {listing.km !== undefined && <span>{listing.km.toLocaleString()} km</span>}
          {listing.city && <span>{listing.city}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-neutral-900">{formatCurrencyQAR(listing.price_qar)}</span>
          <DealBadge listing={listing} />
        </div>
      </div>

      <a href={whatsappHref(listing)} target="_blank" rel="noopener noreferrer" className="shrink-0">
        <Button size="sm" variant="premium" className="gap-1">
          <MessageCircle className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">WhatsApp</span>
        </Button>
      </a>
    </div>
  );
}

export default function PriceDropsPage() {
  const [tick, setTick] = useState(0);

  const query = useQuery({
    queryKey: ["price-drops", tick],
    queryFn: () =>
      listingsService.list({ sort: "discount_pct", deals_only: "1", limit: 100 }),
  });

  const groups = groupListings(query.data?.rows ?? []);

  return (
    <section className="mx-auto max-w-3xl space-y-6 px-4 py-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Price Drops</h1>
          <p className="text-sm text-neutral-500">Cars priced below their market value — updated live.</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          className="gap-2"
          onClick={() => setTick((t) => t + 1)}
          disabled={query.isFetching}
        >
          <RefreshCw className={`h-4 w-4 ${query.isFetching ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {query.isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      )}

      {query.isError && (
        <Card className="py-10 text-center text-neutral-500">Could not load listings. Try refreshing.</Card>
      )}

      {!query.isLoading &&
        groups.map(({ label, icon, items }) =>
          items.length === 0 ? null : (
            <div key={label} className="space-y-3">
              <h2 className="flex items-center gap-2 font-semibold text-neutral-700">
                <span>{icon}</span> {label}
                <span className="ml-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs text-neutral-500">
                  {items.length}
                </span>
              </h2>
              <div className="space-y-2">
                {items.map((l) => (
                  <DropRow key={l.product_id} listing={l} />
                ))}
              </div>
            </div>
          )
        )}

      {!query.isLoading && groups.every((g) => g.items.length === 0) && (
        <Card className="py-16 text-center text-neutral-400">
          No price drops available right now — check back soon!
        </Card>
      )}
    </section>
  );
}
