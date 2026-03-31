"use client";

import { useQuery } from "@tanstack/react-query";
import { insightsService } from "@/services/insights.service";
import { listingsService } from "@/services/listings.service";
import { DealBadge } from "@/components/listings/deal-badge";
import { Card } from "@/components/ui/card";
import { proxyImageUrl } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";
import type { Listing } from "@/types/domain";

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "Unknown";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "Just now";
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function StatCard({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Card className="space-y-1 text-center">
      <p className="text-xs text-neutral-400">{label}</p>
      <p className="text-2xl font-bold text-neutral-900 truncate">{value}</p>
    </Card>
  );
}

function dealCategory(l: Listing): "hot" | "good" | "fair" | "over" | "unknown" {
  const p = l.discount_pct;
  if (p === undefined || p === null || (l.peer_count ?? 0) < 3) return "unknown";
  if (p > 15) return "hot";
  if (p > 5) return "good";
  if (p >= -5) return "fair";
  return "over";
}

export default function PulsePage() {
  const summary = useQuery({
    queryKey: ["pulse-summary"],
    queryFn: () => insightsService.summary(),
    staleTime: 60_000,
  });

  const recent = useQuery({
    queryKey: ["pulse-recent"],
    queryFn: () => listingsService.list({ sort: "listing_date", limit: 10 }),
    staleTime: 60_000,
  });

  const dealsData = useQuery({
    queryKey: ["pulse-deals"],
    queryFn: () => listingsService.list({ limit: 500 }),
    staleTime: 5 * 60_000,
  });

  const s = summary.data;
  const makes = s?.topMakes ?? [];
  const maxCount = makes[0]?.count ?? 1;
  const total = s?.totalListings ?? 0;

  const categories = { hot: 0, good: 0, fair: 0, over: 0, unknown: 0 };
  for (const l of dealsData.data?.rows ?? []) {
    categories[dealCategory(l)]++;
  }
  const dealTotal = Object.values(categories).reduce((a, b) => a + b, 0) || 1;

  const recentRows = recent.data?.rows ?? [];

  return (
    <section className="mx-auto max-w-4xl space-y-8 px-4 py-6">
      <div>
        <h1 className="text-2xl font-semibold">Market Pulse</h1>
        <p className="text-sm text-neutral-500">Live intelligence on Qatar's car market.</p>
      </div>

      {/* A — Top-line stats */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Overview</h2>
        {summary.isLoading ? (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatCard label="Total listings" value={total.toLocaleString()} />
            <StatCard label="Approved" value={(s?.approvalStats?.approved ?? "—").toLocaleString()} />
            <StatCard label="Top make" value={makes[0]?.name ?? "—"} />
            <StatCard
              label="Last updated"
              value={timeAgo(s?.collectionRunStats?.lastFinishedAt)}
            />
          </div>
        )}
      </div>

      {/* B — Top makes bar chart */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Top Makes</h2>
        <Card className="space-y-2">
          {summary.isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-7 animate-pulse rounded-lg bg-neutral-100" />
              ))
            : makes.slice(0, 10).map(({ name, count }) => (
                <div key={name} className="flex items-center gap-3 text-sm">
                  <span className="w-24 shrink-0 truncate font-medium text-neutral-700">{name}</span>
                  <div className="flex-1 rounded-full bg-neutral-100">
                    <div
                      className="h-5 rounded-full bg-blue-500 transition-all"
                      style={{ width: `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="w-16 shrink-0 text-right text-neutral-400">
                    {count.toLocaleString()} ({total ? Math.round((count / total) * 100) : 0}%)
                  </span>
                </div>
              ))}
        </Card>
      </div>

      {/* C — Deal distribution */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Deal Distribution</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "🔥 Hot deals", key: "hot" as const, cls: "text-emerald-700" },
            { label: "✅ Good deals", key: "good" as const, cls: "text-teal-700" },
            { label: "🏷️ Fair price", key: "fair" as const, cls: "text-neutral-700" },
            { label: "⚠️ Overpriced", key: "over" as const, cls: "text-amber-700" },
          ].map(({ label, key, cls }) => (
            <Card key={key} className="text-center">
              <p className="text-xs text-neutral-400">{label}</p>
              <p className={`text-2xl font-bold ${cls}`}>
                {dealsData.isLoading ? "…" : categories[key].toLocaleString()}
              </p>
              <p className="text-xs text-neutral-400">
                {dealsData.isLoading
                  ? ""
                  : `${Math.round((categories[key] / dealTotal) * 100)}%`}
              </p>
            </Card>
          ))}
        </div>
      </div>

      {/* D — Latest arrivals */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-neutral-400">Latest Arrivals</h2>
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
          {recent.isLoading
            ? Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-36 w-40 shrink-0 animate-pulse rounded-2xl bg-neutral-100 snap-start" />
              ))
            : recentRows.map((l) => {
                const img = l.main_image_url ? proxyImageUrl(l.main_image_url) : null;
                return (
                  <a
                    key={l.product_id}
                    href={`/listings/${l.product_id}`}
                    className="w-40 shrink-0 snap-start rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden hover:shadow-md transition"
                  >
                    {img ? (
                      <img src={img} alt={l.title} className="h-24 w-full object-cover" />
                    ) : (
                      <div className="h-24 w-full bg-neutral-100" />
                    )}
                    <div className="p-2 space-y-0.5">
                      <p className="text-xs font-semibold truncate text-neutral-900">{l.make}</p>
                      <p className="text-xs font-bold text-neutral-800">{formatCurrencyQAR(l.price_qar)}</p>
                      <DealBadge listing={l} showPct={false} />
                    </div>
                  </a>
                );
              })}
        </div>
      </div>
    </section>
  );
}
