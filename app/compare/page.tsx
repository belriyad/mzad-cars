"use client";

import { useSearchParams } from "next/navigation";
import { useQueries } from "@tanstack/react-query";
import { MessageCircle } from "lucide-react";
import { Suspense } from "react";
import { listingsService } from "@/services/listings.service";
import { DealBadge } from "@/components/listings/deal-badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { proxyImageUrl, parseImageUrls } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";
import type { Listing } from "@/types/domain";

const ROWS: Array<{ label: string; key: keyof Listing; numeric?: boolean }> = [
  { label: "Price (QAR)", key: "price_qar", numeric: true },
  { label: "Make", key: "make" },
  { label: "Model", key: "model" },
  { label: "Year", key: "manufacture_year", numeric: true },
  { label: "KM", key: "km", numeric: true },
  { label: "City", key: "city" },
  { label: "Warranty", key: "warranty_status" },
  { label: "Cylinders", key: "cylinder_count", numeric: true },
];

function bestIndex(listings: Listing[], key: keyof Listing, better: "lower" | "higher"): number {
  const vals = listings.map((l) => Number(l[key])).filter((v) => !isNaN(v) && v > 0);
  if (vals.length < 2) return -1;
  const target = better === "lower" ? Math.min(...vals) : Math.max(...vals);
  return listings.findIndex((l) => Number(l[key]) === target);
}

function ComparePage() {
  const params = useSearchParams();
  const ids = (params.get("ids") ?? "").split(",").filter(Boolean).slice(0, 3);

  const queries = useQueries({
    queries: ids.map((id) => ({
      queryKey: ["listing", id],
      queryFn: () => listingsService.getById(id),
    })),
  });

  const loading = queries.some((q) => q.isLoading);
  const listings = queries.map((q) => q.data).filter(Boolean) as Listing[];

  if (ids.length < 2) {
    return (
      <Card className="mx-auto max-w-2xl py-20 text-center text-neutral-400">
        Select 2–3 cars to compare from the listings page.
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
        ))}
      </div>
    );
  }

  const priceWinner = bestIndex(listings, "price_qar", "lower");
  const kmWinner = bestIndex(listings, "km", "lower");

  return (
    <section className="mx-auto max-w-4xl space-y-6 px-4 py-6">
      <h1 className="text-2xl font-semibold">Compare Cars</h1>

      {/* Photos — swipe on mobile */}
      <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-2">
        {listings.map((l, i) => {
          const imgs = parseImageUrls(l);
          const img = imgs[0] ?? null;
          return (
            <div key={l.product_id} className="w-56 shrink-0 snap-start space-y-2">
              {img ? (
                <img src={img} alt={l.title} className="h-36 w-full rounded-2xl object-cover" />
              ) : (
                <div className="h-36 w-full rounded-2xl bg-neutral-100" />
              )}
              <p className="text-xs font-semibold line-clamp-2 text-neutral-800">{l.title}</p>
              <DealBadge listing={l} />
              <a
                href={`https://wa.me/${(l.seller_whatsapp ?? l.seller_phone ?? "").replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="sm" variant="premium" className="w-full gap-1 mt-1">
                  <MessageCircle className="h-3.5 w-3.5" />
                  WhatsApp
                </Button>
              </a>
            </div>
          );
        })}
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto rounded-2xl border border-neutral-100">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-xs font-semibold uppercase tracking-wide text-neutral-400">
            <tr>
              <th className="px-4 py-3 text-left w-28">Spec</th>
              {listings.map((l) => (
                <th key={l.product_id} className="px-4 py-3 text-left">{l.make} {l.model}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {ROWS.map(({ label, key, numeric }) => {
              const winner = key === "price_qar" ? priceWinner : key === "km" ? kmWinner : -1;
              return (
                <tr key={key}>
                  <td className="px-4 py-3 text-neutral-400 text-xs font-medium whitespace-nowrap">{label}</td>
                  {listings.map((l, i) => {
                    const val = l[key];
                    const isWinner = winner === i && winner !== -1;
                    let display = val === undefined || val === null ? "—" : String(val);
                    if (key === "price_qar" && typeof val === "number") display = formatCurrencyQAR(val);
                    if (key === "km" && typeof val === "number") display = `${val.toLocaleString()} km`;
                    return (
                      <td
                        key={l.product_id}
                        className={`px-4 py-3 font-medium ${isWinner ? "text-emerald-700 bg-emerald-50" : "text-neutral-800"}`}
                      >
                        {display}
                        {isWinner && <span className="ml-1 text-xs">✓</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function ComparePageWrapper() {
  return (
    <Suspense fallback={<div className="py-20 text-center text-neutral-400">Loading…</div>}>
      <ComparePage />
    </Suspense>
  );
}
