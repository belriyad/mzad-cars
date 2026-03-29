"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart2,
  Car,
  FileSpreadsheet,
  LayoutDashboard,
  MessageCircle,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RoleGate } from "@/components/auth/role-gate";
import { dealerService } from "@/services/dealer.service";
import { formatCurrencyQAR } from "@/lib/utils";

const QUICK_LINKS = [
  {
    href: "/dealer/inventory",
    icon: Car,
    label: "Inventory",
    description: "Manage and publish your car stock",
    color: "bg-blue-50 text-blue-700",
  },
  {
    href: "/dealer/analytics",
    icon: BarChart2,
    label: "Analytics",
    description: "Views, leads, and conversion metrics",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    href: "/dealer/team",
    icon: Users,
    label: "Team",
    description: "Invite staff and manage permissions",
    color: "bg-purple-50 text-purple-700",
  },
  {
    href: "/dealer/csv-import",
    icon: FileSpreadsheet,
    label: "CSV Import",
    description: "Bulk-upload listings from a spreadsheet",
    color: "bg-amber-50 text-amber-700",
  },
  {
    href: "/dealer/profile",
    icon: LayoutDashboard,
    label: "Dealer Profile",
    description: "Showroom name, logo, and contact info",
    color: "bg-rose-50 text-rose-700",
  },
];

const TIPS = [
  { icon: Zap,           text: "Add full specs and real photos — listings with 5+ images get 3× more leads." },
  { icon: TrendingUp,    text: "Price 5–10% below market to earn the deal badge and move cars 2× faster." },
  { icon: MessageCircle, text: "Enable WhatsApp so buyers can reach you in one tap from the listing page." },
];

export default function DealerDashboardPage() {
  const analytics = useQuery({
    queryKey: ["dealer-analytics"],
    queryFn: () => dealerService.analytics(),
  });

  const inventory = useQuery({
    queryKey: ["dealer-inventory"],
    queryFn: () => dealerService.inventory(),
  });

  const recentListings = inventory.data?.slice(0, 3) ?? [];

  return (
    <RoleGate
      allow={["dealer", "admin"]}
      title="Dealer package required"
      description="Upgrade to the Dealer plan to unlock team management, bulk CSV upload, and advanced analytics."
    >
      <div className="space-y-6">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Dealer Dashboard</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              Manage your showroom, track performance, and grow your leads.
            </p>
          </div>
          <Link href="/dealer/inventory">
            <Button variant="premium" className="gap-2">
              <Car className="h-4 w-4" /> Add listing
            </Button>
          </Link>
        </div>

        {/* KPI strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "Active listings",  value: analytics.data?.inventoryCount ?? inventory.data?.length ?? "—" },
            { label: "Total views",      value: analytics.data?.views ?? "—" },
            { label: "Leads this month", value: analytics.data?.leads ?? "—" },
            { label: "Avg. days live",   value: "12" },
          ].map(({ label, value }) => (
            <Card key={label} className="space-y-1">
              <p className="text-xs text-neutral-400">{label}</p>
              <p className="text-2xl font-bold text-neutral-900">{String(value)}</p>
            </Card>
          ))}
        </div>

        {/* quick-action grid */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Quick actions
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {QUICK_LINKS.map(({ href, icon: Icon, label, description, color }) => (
              <Link key={href} href={href}>
                <Card className="group flex items-start gap-3 transition hover:shadow-md">
                  <span className={`mt-0.5 rounded-xl p-2 ${color}`}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div>
                    <p className="font-medium text-neutral-800 group-hover:text-neutral-900">{label}</p>
                    <p className="text-xs text-neutral-500">{description}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* recent inventory */}
        {recentListings.length > 0 && (
          <div>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
                Recent inventory
              </h2>
              <Link href="/dealer/inventory" className="text-xs text-neutral-500 underline">
                View all
              </Link>
            </div>
            <div className="space-y-2">
              {recentListings.map((row) => (
                <Card key={row.product_id} className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{row.title}</p>
                    <p className="text-xs text-neutral-500">
                      {row.make} · {row.manufacture_year ?? "—"} · {row.km?.toLocaleString() ?? "—"} km
                    </p>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="font-semibold">{formatCurrencyQAR(row.price_qar)}</p>
                    <Badge className="bg-emerald-100 text-emerald-700 text-xs">Active</Badge>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* tips */}
        <div>
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Pro tips
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {TIPS.map(({ icon: Icon, text }) => (
              <Card key={text} className="flex items-start gap-3 bg-neutral-50">
                <Icon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400" />
                <p className="text-sm text-neutral-600">{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </RoleGate>
  );
}

