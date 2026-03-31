"use client";

import { useQuery } from "@tanstack/react-query";
import { listingsService } from "@/services/listings.service";
import type { Listing } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";

interface PriceSparklineProps {
  productId: string;
  make?: string;
  className?: string;
  model?: string;
  year?: number;
}

function buildSparklinePath(prices: number[], w = 80, h = 30): string {
  if (prices.length < 2) return "";
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;
  const step = w / (prices.length - 1);
  const points = prices.map((p, i) => {
    const x = i * step;
    const y = h - ((p - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  });
  return `M ${points.join(" L ")}`;
}

export function PriceSparkline({ productId, make, model, year, className = "" }: PriceSparklineProps) {
  const listing = useQuery({
    queryKey: ["listing-sparkline", productId],
    queryFn: () => listingsService.getById(productId),
    staleTime: 5 * 60 * 1000,
  });

  const peers = useQuery({
    queryKey: ["listing-peers-sparkline", make, model, year],
    queryFn: () =>
      listingsService.list({
        make,
        model,
        min_year: year ? year - 1 : undefined,
        max_year: year ? year + 1 : undefined,
        limit: 50,
      }),
    enabled: !!(make),
    staleTime: 5 * 60 * 1000,
  });

  if (listing.isLoading) {
    return <div className={`h-8 w-20 animate-pulse rounded bg-neutral-100 ${className}`} />;
  }

  const current = listing.data;
  if (!current) return null;

  const peerPrices: number[] = (peers.data?.rows ?? [])
    .map((l: Listing) => l.price_qar)
    .filter(Boolean)
    .sort((a: number, b: number) => a - b);

  const listingDaysAgo = current.listing_date
    ? Math.floor((Date.now() - new Date(current.listing_date).getTime()) / 86_400_000)
    : null;

  const tooltip = [
    listingDaysAgo !== null ? `Listed ${listingDaysAgo}d ago` : null,
    `${formatCurrencyQAR(current.price_qar)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  if (peerPrices.length < 2) {
    return (
      <span className={`text-xs text-neutral-400 ${className}`}>
        Price stable since listing
      </span>
    );
  }

  // Inject current price into sorted array to show its position
  const allPrices = [...peerPrices, current.price_qar].sort((a, b) => a - b);
  const path = buildSparklinePath(allPrices);
  const currentIdx = allPrices.indexOf(current.price_qar);
  const dotX = (currentIdx / (allPrices.length - 1)) * 80;
  const min = Math.min(...allPrices);
  const max = Math.max(...allPrices);
  const range = max - min || 1;
  const dotY = 30 - ((current.price_qar - min) / range) * 26 - 2;

  return (
    <span title={tooltip} className={`inline-block cursor-help ${className}`}>
      <svg width={80} height={30} className="overflow-visible">
        <path d={path} fill="none" stroke="#d1d5db" strokeWidth={1.5} strokeLinecap="round" />
        <circle cx={dotX} cy={dotY} r={3} fill="#2563eb" />
      </svg>
    </span>
  );
}
