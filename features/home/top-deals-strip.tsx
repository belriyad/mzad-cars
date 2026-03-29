"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listingsService } from "@/services/listings.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyQAR } from "@/lib/utils";

export function TopDealsStrip() {
  const query = useQuery({
    queryKey: ["landing-top-deals"],
    queryFn: () => listingsService.list({ limit: 40, sort: "discount_pct_desc", deals_only: "1" }),
  });

  const topDeals = useMemo(() => {
    const rows = query.data?.rows ?? [];
    // Use real discount_pct; fall back to 0 so unknowns sort last
    return [...rows]
      .filter((r) => r.discount_pct !== undefined && r.discount_pct !== null)
      .sort((a, b) => (b.discount_pct ?? 0) - (a.discount_pct ?? 0))
      .slice(0, 8);
  }, [query.data?.rows]);

  if (query.isLoading) {
    return (
      <div className="grid gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-28 animate-pulse bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (query.isError || !topDeals.length) {
    return <Card className="text-sm text-neutral-600">Top deals will appear once live inventory loads.</Card>;
  }

  return (
    /* w-full + min-w-0 confine the scroll container to its parent column width */
    <div className="hide-scrollbar w-full min-w-0 flex gap-3 overflow-x-auto pb-1">
      {topDeals.map((deal) => (
        <Link href={`/listings/${deal.product_id}`} key={deal.product_id} className="min-w-[230px] max-w-[260px] flex-shrink-0 snap-start">
          <Card className="flex h-full flex-col space-y-2 border-neutral-200/90 transition hover:-translate-y-0.5 hover:shadow-md">
            <div className="flex items-center justify-between">
              <Badge className={
                (deal.discount_pct ?? 0) > 0
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-rose-100 text-rose-700"
              }>
                {(deal.discount_pct ?? 0) > 0
                  ? `${(deal.discount_pct!).toFixed(1)}% below market`
                  : `${Math.abs(deal.discount_pct ?? 0).toFixed(1)}% over`}
              </Badge>
            </div>
            <p className="line-clamp-2 font-semibold text-sm leading-snug">{deal.title}</p>
            <p className="text-sm text-neutral-600">{deal.city ?? "Qatar"} • {deal.make}</p>
            <p className="mt-auto text-lg font-bold">{formatCurrencyQAR(deal.price_qar)}</p>
            {deal.expected_price_qar && deal.expected_price_qar !== deal.price_qar && (
              <p className="text-xs text-neutral-400 line-through">{formatCurrencyQAR(deal.expected_price_qar)}</p>
            )}
          </Card>
        </Link>
      ))}
    </div>
  );
}
