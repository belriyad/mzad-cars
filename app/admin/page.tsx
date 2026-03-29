"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RoleGate } from "@/components/auth/role-gate";
import { adminService } from "@/services/admin.service";
import { useAdminAuth } from "@/hooks/use-admin-auth";

const NAV_TILES = [
  {
    label: "All Listings",
    href: "/admin/listings",
    icon: "🚗",
    desc: "View, approve, reject — individually or in bulk",
  },
  {
    label: "Users & Dealers",
    href: "/admin/users",
    icon: "👥",
    desc: "Manage roles, activate or deactivate accounts",
  },
  {
    label: "Moderation Queue",
    href: "/admin/moderation",
    icon: "🔍",
    desc: "Listings awaiting first review",
  },
  {
    label: "Suspicious Activity",
    href: "/admin/suspicious",
    icon: "⚠️",
    desc: "Flagged listings and accounts",
  },
] as const;

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string | number | undefined;
  accent?: string;
}) {
  return (
    <Card className="flex flex-col gap-1 p-4">
      <p className="text-xs text-neutral-500 font-medium uppercase tracking-wide">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${accent ?? "text-neutral-900"}`}>
        {value ?? "—"}
      </p>
    </Card>
  );
}

export default function AdminDashboard() {
  const { token, isAdmin } = useAdminAuth();

  const stats = useQuery({
    queryKey: ["admin-stats"],
    queryFn: () => adminService.stats(token),
    enabled: isAdmin && !!token,
  });

  const allListings = useQuery({
    queryKey: ["admin-all-listings-count"],
    queryFn: () => adminService.listAll({ limit: 1000 }, token),
    enabled: isAdmin && !!token,
  });

  const users = useQuery({
    queryKey: ["admin-users-count"],
    queryFn: () => adminService.users(token),
    enabled: isAdmin && !!token,
  });

  const listings = allListings.data?.rows ?? [];
  const approvedCount = listings.filter((l) => l.is_approved === true).length;
  const pendingCount = listings.filter(
    (l) => l.is_approved === null || l.is_approved === undefined
  ).length;
  const rejectedCount = listings.filter((l) => l.is_approved === false).length;
  const totalUsers = users.data?.rows?.length ?? 0;
  const adminUsers = users.data?.rows?.filter((u) => u.role === "admin").length ?? 0;

  const recentListings = listings
    .slice()
    .sort((a, b) =>
      (b.listing_date ?? "").localeCompare(a.listing_date ?? "")
    )
    .slice(0, 5);

  return (
    <RoleGate
      allow={["admin"]}
      title="Admin access only"
      description="This section is restricted to moderation and platform operations teams."
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Admin Dashboard</h1>
            <p className="text-sm text-neutral-500">Platform overview and moderation controls</p>
          </div>
          <Link
            href="/admin/listings"
            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition-colors"
          >
            Manage Listings →
          </Link>
        </div>

        {/* KPI Stats */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Total Listings"
            value={allListings.isLoading ? "…" : listings.length}
          />
          <StatCard
            label="Approved"
            value={allListings.isLoading ? "…" : approvedCount}
            accent="text-green-600"
          />
          <StatCard
            label="Pending Review"
            value={allListings.isLoading ? "…" : pendingCount}
            accent="text-amber-600"
          />
          <StatCard
            label="Rejected"
            value={allListings.isLoading ? "…" : rejectedCount}
            accent="text-red-600"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <StatCard
            label="Total Users"
            value={users.isLoading ? "…" : totalUsers}
          />
          <StatCard
            label="Admins"
            value={users.isLoading ? "…" : adminUsers}
            accent="text-purple-600"
          />
          <StatCard
            label="Total Listings (API)"
            value={stats.data?.totalListings ?? (stats.isLoading ? "…" : "—")}
          />
          <StatCard
            label="Unique Phones"
            value={
              stats.data?.phoneStats?.uniquePhoneNumbers ??
              (stats.isLoading ? "…" : "—")
            }
          />
        </div>

        {/* Navigation tiles */}
        <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          {NAV_TILES.map(({ label, href, icon, desc }) => (
            <Link key={href} href={href}>
              <Card className="flex flex-col gap-2 p-4 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer h-full">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{icon}</span>
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <p className="text-xs text-neutral-500">{desc}</p>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent listings */}
        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Listings</h2>
          {allListings.isLoading ? (
            <Card className="animate-pulse bg-neutral-50 p-4">Loading recent listings…</Card>
          ) : recentListings.length === 0 ? (
            <Card className="p-4 text-neutral-500">No listings found.</Card>
          ) : (
            <div className="space-y-2">
              {recentListings.map((listing) => (
                <Link
                  key={listing.product_id}
                  href={`/admin/listings`}
                  className="block"
                >
                  <Card className="flex items-center justify-between gap-4 p-3 hover:border-blue-200 transition-colors">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{listing.title}</p>
                      <p className="text-xs text-neutral-500">
                        {listing.make} {listing.model} · {listing.seller_phone ?? "No phone"} ·{" "}
                        {listing.listing_date ?? ""}
                      </p>
                    </div>
                    <Badge
                      className={
                        listing.is_approved === true
                          ? "border-green-300 bg-green-50 text-green-700"
                          : listing.is_approved === false
                          ? "border-red-300 bg-red-50 text-red-700"
                          : "border-amber-300 bg-amber-50 text-amber-700"
                      }
                    >
                      {listing.is_approved === true
                        ? "Approved"
                        : listing.is_approved === false
                        ? "Rejected"
                        : "Pending"}
                    </Badge>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleGate>
  );
}

