"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { listingsService } from "@/services/listings.service";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyQAR } from "@/lib/utils";
import { parseImageUrls } from "@/types/domain";

const FALLBACK_IMG =
  "https://images.unsplash.com/photo-1493238792000-8113da705763?q=80&w=600&auto=format&fit=crop";

export function TopDealsStrip() {
  const query = useQuery({
    queryKey: ["landing-top-deals"],
    queryFn: () => listingsService.list({ limit: 40, sort: "discount_pct_desc", deals_only: "1" }),
  });

  const topDeals = useMemo(() => {
    const rows = query.data?.rows ?? [];
    return [...rows]
      .filter((r) => r.discount_pct !== undefined && r.discount_pct !== null)
      .sort((a, b) => (b.discount_pct ?? 0) - (a.discount_pct ?? 0))
      .slice(0, 8);
  }, [query.data?.rows]);

  if (query.isLoading) {
    return (
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="min-w-[230px] flex-shrink-0">
            <Card className="h-56 animate-pulse bg-neutral-100" />
          </div>
        ))}
      </div>
    );
  }

  if (query.isError || !topDeals.length) {
    return (
      <Card className="text-sm text-neutral-600">
        Top deals will appear once live inventory loads.
      </Card>
    );
  }

  return (
    <div className="hide-scrollbar w-full min-w-0 flex gap-3 overflow-x-auto pb-1">
      {topDeals.map((deal) => {
        const images = parseImageUrls(deal);
        const thumb = images[0] ?? FALLBACK_IMG;
        const pct = deal.discount_pct ?? 0;

        return (
          <Link
            href={`/listings/${deal.product_id}`}
            key={deal.product_id}
            className="min-w-[220px] max-w-[250px] flex-shrink-0 snap-start"
          >
            <Card className="flex h-full flex-col overflow-hidden p-0 border-neutral-200/90 transition hover:-translate-y-0.5 hover:shadow-md">
              {/* thumbnail */}
              <div className="relative h-36 w-full overflow-hidden bg-neutral-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={thumb}
                  alt={deal.title}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
                {/* deal badge overlaid on image */}
                <div className="absolute left-2 top-2">
                  <Badge
                    className={
                      pct > 0
                        ? "bg-emerald-500 text-white shadow"
                        : "bg-rose-500 text-white shadow"
                    }
                  >
                    {pct > 0
                      ? `${pct.toFixed(1)}% below`
                      : `${Math.abs(pct).toFixed(1)}% over`}
                  </Badge>
                </div>
              </div>

              {/* text */}
              <div className="flex flex-1 flex-col gap-1 p-3">
                <p className="line-clamp-2 text-sm font-semibold leading-snug">
                  {deal.title}
                </p>
                <p className="text-xs text-neutral-500">
                  {deal.city ?? "Qatar"} · {deal.make}
                </p>
                <div className="mt-auto pt-1">
                  <p className="text-base font-bold">{formatCurrencyQAR(deal.price_qar)}</p>
                  {deal.expected_price_qar &&
                    deal.expected_price_qar !== deal.price_qar && (
                      <p className="text-xs text-neutral-400 line-through">
                        {formatCurrencyQAR(deal.expected_price_qar)}
                      </p>
                    )}
                </div>
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
