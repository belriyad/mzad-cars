"use client";

import { useQuery } from "@tanstack/react-query";
import { BarChart2, TrendingUp, Eye, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dealerService } from "@/services/dealer.service";
import { formatCurrencyQAR } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { RoleGate } from "@/components/auth/role-gate";

/** Deterministic seeded RNG for stable sparkline values across renders */
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  return (
    <div className="flex items-end gap-1 h-16">
      {values.map((v, i) => (
        <div
          key={i}
          className="flex-1 rounded-t-sm bg-emerald-400 transition-all"
          style={{ height: `${Math.max((v / max) * 100, 4)}%`, opacity: 0.5 + (i / values.length) * 0.5 }}
          title={String(v)}
        />
      ))}
    </div>
  );
}

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function DealerAnalyticsPage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user  = useAuthStore((s) => s.user);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["dealer-inventory", user?.id],
    queryFn:  () => dealerService.inventory(user?.id, token),
    enabled:  !!token,
  });

  const totalListings = listings.length;
  const activeCount   = listings.filter((l) => l.is_approved).length;
  const pendingCount  = listings.filter((l) => !l.is_approved).length;

  const rand       = seeded(user?.id ? parseInt(user.id, 36) % 9999 : 42);
  const weekViews  = WEEKDAYS.map(() => Math.floor(rand() * 120 + 20));
  const totalViews = weekViews.reduce((a, b) => a + b, 0);
  const avgViews   = totalListings > 0 ? Math.round(totalViews / totalListings) : 0;

  const topListings = [...listings]
    .sort((a, b) => (b.discount_pct ?? 0) - (a.discount_pct ?? 0))
    .slice(0, 5);

  return (
    <RoleGate
      allow={["dealer", "admin"]}
      title="Dealer package required"
      description="Upgrade to the Dealer plan to view analytics."
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Analytics</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Performance overview for your showroom listings.
          </p>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Total listings",  value: isLoading ? "…" : totalListings, icon: BarChart2,  color: "text-blue-500" },
            { label: "Active",          value: isLoading ? "…" : activeCount,   icon: TrendingUp, color: "text-emerald-500" },
            { label: "Pending review",  value: isLoading ? "…" : pendingCount,  icon: Star,       color: "text-amber-500" },
            { label: "Est. views / 7d", value: isLoading ? "…" : totalViews,    icon: Eye,        color: "text-purple-500" },
          ].map(({ label, value, icon: Icon, color }) => (
            <Card key={label} className="space-y-2">
              <div className={`flex items-center gap-1.5 ${color}`}>
                <Icon className="h-4 w-4" />
                <p className="text-xs font-medium text-neutral-400">{label}</p>
              </div>
              <p className="text-2xl font-bold text-neutral-900">{String(value)}</p>
            </Card>
          ))}
        </div>

        {/* sparkline */}
        <Card className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-800">Estimated views — last 7 days</h2>
            <Badge className="bg-amber-100 text-amber-700 text-xs">Simulated · real data coming soon</Badge>
          </div>
          <Sparkline values={weekViews} />
          <div className="flex gap-1 text-[10px] text-neutral-400">
            {WEEKDAYS.map((d, i) => (
              <div key={d} className="flex-1 text-center">
                <span>{d}</span>
                <br />
                <span className="font-medium text-neutral-600">{weekViews[i]}</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Average {avgViews} views per listing · Listings with photos get 3× more impressions
          </p>
        </Card>

        {/* top listings */}
        <div>
          <h2 className="mb-3 font-semibold text-neutral-800 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-500" /> Top-performing listings
          </h2>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-14 animate-pulse rounded-2xl bg-neutral-100" />
              ))}
            </div>
          ) : topListings.length === 0 ? (
            <Card className="py-10 text-center text-sm text-neutral-400">
              No listings yet — add your first car to see rankings here.
            </Card>
          ) : (
            <div className="space-y-2">
              {topListings.map((row, idx) => (
                <Card key={row.product_id} className="flex items-center gap-4">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-500">
                    #{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium text-sm text-neutral-800">{row.title}</p>
                    <p className="text-xs text-neutral-400">
                      {row.make} {row.manufacture_year} · {row.city ?? "Qatar"}
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="text-sm font-semibold">{formatCurrencyQAR(row.price_qar)}</p>
                    {row.discount_pct != null && row.discount_pct > 0 ? (
                      <Badge className="bg-emerald-100 text-emerald-700 text-xs">
                        {row.discount_pct.toFixed(0)}% below market
                      </Badge>
                    ) : (
                      <Badge className={row.is_approved ? "bg-emerald-100 text-emerald-700 text-xs" : "bg-amber-100 text-amber-700 text-xs"}>
                        {row.is_approved ? "Active" : "Pending"}
                      </Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* approval breakdown */}
        <Card className="space-y-3">
          <h2 className="font-semibold text-neutral-800">Approval breakdown</h2>
          <div className="flex items-center gap-3">
            <div className="flex-1 overflow-hidden rounded-full bg-neutral-100 h-3">
              <div
                className="h-3 rounded-full bg-emerald-400 transition-all"
                style={{ width: totalListings > 0 ? `${(activeCount / totalListings) * 100}%` : "0%" }}
              />
            </div>
            <span className="text-xs text-neutral-500 shrink-0">
              {activeCount} / {totalListings} approved
            </span>
          </div>
          <p className="text-xs text-neutral-400">
            New listings are reviewed by the Mzad Cars team within 24 hours.
          </p>
        </Card>
      </div>
    </RoleGate>
  );
}
