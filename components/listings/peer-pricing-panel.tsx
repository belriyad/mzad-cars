"use client";

/**
 * PeerPricingPanel
 *
 * Two sections shown inside the listing detail page:
 *
 * 1. "How was this price calculated?" — visual rationale using the peer stats
 *    already embedded on the listing object (peer_count, mileage_window_km,
 *    expected_price_qar, discount_pct, deal_reason).
 *
 * 2. "Similar cars on the market" — live query to GET /listings with
 *    make + class_name + optional model + ±2 year window, excluding the
 *    current listing.  Falls back gracefully to make-only if no results.
 *
 * Backend note: when GET /listings/:id/peers is available it will return
 * the exact cars used in the deal computation. Until then we approximate
 * via the public listings search.
 */

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BarChart2, Info, TrendingDown, TrendingUp, Minus, Car } from "lucide-react";
import { listingsService } from "@/services/listings.service";
import { proxyImageUrl } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import type { Listing } from "@/types/domain";

// ─── Price rationale ────────────────────────────────────────────────────────

function RationaleBar({
  price,
  expected,
  discountPct,
}: {
  price: number;
  expected: number;
  discountPct: number;
}) {
  // Clamp to ±40 % for the visual bar
  const clamped = Math.max(-40, Math.min(40, discountPct));
  const isGood = discountPct > 0;
  const barWidth = `${Math.abs(clamped) * 2.5}%`; // 40% swing → full bar

  return (
    <div className="space-y-2">
      {/* numeric summary */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl font-bold text-neutral-900">{formatCurrencyQAR(price)}</span>
        <span className="text-sm text-neutral-400">listing price</span>
        <span className="mx-1 text-neutral-300">vs</span>
        <span className="text-lg font-semibold text-neutral-600">{formatCurrencyQAR(expected)}</span>
        <span className="text-sm text-neutral-400">market avg</span>
        <span
          className={`flex items-center gap-1 rounded-full px-2.5 py-0.5 text-sm font-semibold ${
            isGood ? "bg-emerald-50 text-emerald-700" : discountPct < -5 ? "bg-rose-50 text-rose-700" : "bg-neutral-100 text-neutral-600"
          }`}
        >
          {isGood ? <TrendingDown className="h-3.5 w-3.5" /> : discountPct < 0 ? <TrendingUp className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
          {isGood ? `−${discountPct.toFixed(1)}%` : discountPct < 0 ? `+${Math.abs(discountPct).toFixed(1)}%` : "at market"}
        </span>
      </div>

      {/* horizontal bar */}
      <div className="relative h-3 rounded-full bg-neutral-100 overflow-hidden">
        {/* centre line = market avg */}
        <div className="absolute inset-y-0 left-1/2 w-px bg-neutral-300" />
        {/* coloured fill from centre */}
        <div
          className={`absolute inset-y-0 rounded-full transition-all ${isGood ? "bg-emerald-400 right-1/2" : "bg-rose-400 left-1/2"}`}
          style={{ width: barWidth }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>Cheaper than avg</span>
        <span>Market avg</span>
        <span>More expensive</span>
      </div>
    </div>
  );
}

function PriceRationale({ listing }: { listing: Listing }) {
  const {
    price_qar,
    expected_price_qar,
    discount_pct,
    discount_qar,
    peer_count,
    mileage_window_km,
    deal_reason,
    deal_last_computed_at,
  } = listing;

  if (!expected_price_qar || discount_pct === undefined) {
    return (
      <p className="text-sm text-neutral-400 italic">
        Price analysis not yet available for this listing — check back after the next market update.
      </p>
    );
  }

  const saved = discount_qar ?? Math.round((expected_price_qar * discount_pct) / 100);
  const isGood = discount_pct > 0;

  return (
    <div className="space-y-4">
      <RationaleBar price={price_qar} expected={expected_price_qar} discountPct={discount_pct} />

      {/* key takeaway */}
      <div
        className={`rounded-xl px-4 py-3 text-sm ${
          isGood ? "bg-emerald-50 text-emerald-800" : discount_pct < -5 ? "bg-rose-50 text-rose-700" : "bg-neutral-50 text-neutral-700"
        }`}
      >
        {isGood ? (
          <>
            <strong>You save {formatCurrencyQAR(Math.abs(saved))}</strong> compared to the market
            average for comparable cars.
          </>
        ) : discount_pct < -5 ? (
          <>
            This car is priced <strong>{formatCurrencyQAR(Math.abs(saved))} above</strong> the
            market average for comparable cars.
          </>
        ) : (
          "This car is priced close to the market average."
        )}
      </div>

      {/* methodology */}
      {(peer_count !== undefined || mileage_window_km) && (
        <div className="flex flex-wrap gap-4 text-xs text-neutral-500 border-t border-neutral-100 pt-3">
          {peer_count !== undefined && (
            <span className="flex items-center gap-1">
              <Car className="h-3.5 w-3.5" />
              Based on <strong className="text-neutral-700">{peer_count} comparable cars</strong>
            </span>
          )}
          {mileage_window_km && (
            <span className="flex items-center gap-1">
              <Info className="h-3.5 w-3.5" />
              Mileage window: ±{mileage_window_km.toLocaleString()} km
            </span>
          )}
          {deal_last_computed_at && (
            <span>
              Updated {new Date(deal_last_computed_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
            </span>
          )}
        </div>
      )}

      {deal_reason && (
        <p className="text-xs text-neutral-500 italic border-l-2 border-neutral-200 pl-3">{deal_reason}</p>
      )}
    </div>
  );
}

// ─── Similar cars ────────────────────────────────────────────────────────────

function SimilarCard({ listing, currentId }: { listing: Listing; currentId: string }) {
  if (listing.product_id === currentId) return null;
  const img = listing.main_image_url ? proxyImageUrl(listing.main_image_url) : null;
  const isGood = (listing.discount_pct ?? 0) > 0;
  const isAbove = (listing.discount_pct ?? 0) < -5;

  return (
    <Link href={`/listings/${listing.product_id}`} className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-2.5 hover:shadow-sm transition">
      {/* thumbnail */}
      <div className="h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {img ? (
          <img src={img} alt={listing.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Car className="h-5 w-5 text-neutral-300" />
          </div>
        )}
      </div>

      {/* info */}
      <div className="flex flex-1 flex-col justify-between gap-1 min-w-0">
        <p className="truncate text-sm font-medium text-neutral-800">{listing.title}</p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-bold text-neutral-900">{formatCurrencyQAR(listing.price_qar)}</span>
          {listing.discount_pct !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                isGood ? "bg-emerald-100 text-emerald-700" : isAbove ? "bg-rose-100 text-rose-700" : "bg-neutral-100 text-neutral-500"
              }`}
            >
              {isGood ? `−${listing.discount_pct.toFixed(1)}%` : isAbove ? `+${Math.abs(listing.discount_pct).toFixed(1)}%` : "avg"}
            </span>
          )}
        </div>
        <div className="flex gap-2 text-[11px] text-neutral-400">
          {listing.manufacture_year && <span>{listing.manufacture_year}</span>}
          {listing.km !== undefined && <span>{listing.km.toLocaleString()} km</span>}
          {listing.city && <span>{listing.city}</span>}
        </div>
      </div>
    </Link>
  );
}

function SimilarCars({ listing }: { listing: Listing }) {
  const year = listing.manufacture_year;

  // Primary query: same make + class_name + model, ±2 years
  const primaryQuery = useQuery({
    queryKey: ["similar-primary", listing.product_id],
    queryFn: () =>
      listingsService.list({
        make: listing.make,
        class_name: listing.class_name,
        model: listing.model,
        min_year: year ? year - 2 : undefined,
        max_year: year ? year + 2 : undefined,
        sort: "discount_pct_desc",
        limit: 10,
      }),
    staleTime: 10 * 60_000,
    enabled: !!listing.make,
  });

  // Fallback query: just make + class_name if model returns too few
  const fallbackQuery = useQuery({
    queryKey: ["similar-fallback", listing.product_id],
    queryFn: () =>
      listingsService.list({
        make: listing.make,
        class_name: listing.class_name,
        sort: "discount_pct_desc",
        limit: 12,
      }),
    staleTime: 10 * 60_000,
    // only run if primary has < 3 results (excluding current)
    enabled:
      !primaryQuery.isLoading &&
      (primaryQuery.data?.rows ?? []).filter((r) => r.product_id !== listing.product_id).length < 3,
  });

  const primaryPeers = (primaryQuery.data?.rows ?? []).filter(
    (r) => r.product_id !== listing.product_id
  );
  const fallbackPeers = (fallbackQuery.data?.rows ?? []).filter(
    (r) => r.product_id !== listing.product_id
  );

  const peers = primaryPeers.length >= 3 ? primaryPeers : fallbackPeers;
  const isLoading = primaryQuery.isLoading || (peers.length < 3 && fallbackQuery.isLoading);

  // Sort: good deals first, then by price ascending
  const sorted = [...peers].sort((a, b) => {
    const da = a.discount_pct ?? -99;
    const db = b.discount_pct ?? -99;
    if (da !== db) return db - da; // higher discount first
    return a.price_qar - b.price_qar;
  });

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (sorted.length === 0) {
    return (
      <p className="text-sm text-neutral-400 italic">No similar cars found on the market right now.</p>
    );
  }

  // Price stats from the peer set
  const prices = sorted.map((p) => p.price_qar);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  return (
    <div className="space-y-3">
      {/* mini price band summary */}
      <div className="flex flex-wrap gap-4 rounded-xl bg-neutral-50 px-4 py-3 text-xs text-neutral-600">
        <span>
          <span className="text-neutral-400">Low </span>
          <strong className="text-neutral-800">{formatCurrencyQAR(minPrice)}</strong>
        </span>
        <span>
          <span className="text-neutral-400">Avg </span>
          <strong className="text-neutral-800">{formatCurrencyQAR(avgPrice)}</strong>
        </span>
        <span>
          <span className="text-neutral-400">High </span>
          <strong className="text-neutral-800">{formatCurrencyQAR(maxPrice)}</strong>
        </span>
        <span className="ml-auto text-neutral-400">{sorted.length} listings</span>
      </div>

      {/* list */}
      <div className="space-y-2">
        {sorted.slice(0, 8).map((peer) => (
          <SimilarCard key={peer.product_id} listing={peer} currentId={listing.product_id} />
        ))}
      </div>

      {sorted.length > 8 && (
        <Link
          href={`/listings?make=${encodeURIComponent(listing.make)}&class_name=${encodeURIComponent(listing.class_name ?? "")}&model=${encodeURIComponent(listing.model ?? "")}`}
          className="block text-center text-xs text-blue-600 hover:underline pt-1"
        >
          View all {sorted.length}+ similar listings →
        </Link>
      )}
    </div>
  );
}

// ─── Public export ──────────────────────────────────────────────────────────

export function PeerPricingPanel({ listing }: { listing: Listing }) {
  return (
    <>
      {/* ── 1. Price rationale ── */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-neutral-500" />
          <h2 className="font-semibold">How was this price rated?</h2>
        </div>
        <PriceRationale listing={listing} />
      </Card>

      {/* ── 2. Similar cars ── */}
      <Card>
        <div className="mb-4 flex items-center gap-2">
          <Car className="h-4 w-4 text-neutral-500" />
          <h2 className="font-semibold">Similar cars on the market</h2>
          {listing.model && (
            <span className="ml-auto text-xs text-neutral-400">
              {[listing.make, listing.model].filter(Boolean).join(" ")}
              {listing.manufacture_year ? ` · ±2 yrs from ${listing.manufacture_year}` : ""}
            </span>
          )}
        </div>
        <SimilarCars listing={listing} />
      </Card>
    </>
  );
}
