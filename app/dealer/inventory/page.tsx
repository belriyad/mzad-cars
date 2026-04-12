"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Car,
  Edit2,
  Eye,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { dealerService } from "@/services/dealer.service";
import { formatCurrencyQAR } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { RoleGate } from "@/components/auth/role-gate";
import type { Listing } from "@/types/domain";

type StatusFilter = "all" | "active" | "pending" | "paused";

function getListingStatus(row: Listing): { label: string; cls: string } {
  if (!row.is_approved) return { label: "Pending review", cls: "bg-amber-100 text-amber-700" };
  return { label: "Active", cls: "bg-emerald-100 text-emerald-700" };
}

function daysAgo(dateStr?: string | null): string {
  if (!dateStr) return "—";
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
  if (diff === 0) return "Today";
  if (diff === 1) return "1 day";
  return `${diff} days`;
}

function ListingRow({
  row,
  onDelete,
  deleting,
}: {
  row: Listing;
  onDelete: (id: string) => void;
  deleting: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const status = getListingStatus(row);

  return (
    <div className="relative flex flex-col gap-3 rounded-2xl border border-neutral-100 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
      {/* title + meta */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-neutral-900 truncate max-w-xs">{row.title}</p>
          <Badge className={`text-xs ${status.cls}`}>{status.label}</Badge>
        </div>
        <p className="mt-0.5 text-xs text-neutral-400">
          {[row.make, row.model, row.manufacture_year].filter(Boolean).join(" · ")}
          {row.km != null && ` · ${row.km.toLocaleString()} km`}
          {row.city && ` · ${row.city}`}
        </p>
      </div>

      {/* stats strip */}
      <div className="flex shrink-0 gap-5 text-center">
        <div>
          <p className="text-xs text-neutral-400">Price</p>
          <p className="text-sm font-semibold text-neutral-800">{formatCurrencyQAR(row.price_qar)}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400 flex items-center justify-center gap-0.5">
            <Eye className="h-3 w-3" /> Views
          </p>
          <p className="text-sm font-semibold text-neutral-800">{(row as Listing & { views_count?: number | null }).views_count ?? "—"}</p>
        </div>
        <div>
          <p className="text-xs text-neutral-400">Days live</p>
          <p className="text-sm font-semibold text-neutral-800">{daysAgo(row.listing_date)}</p>
        </div>
      </div>

      {/* actions */}
      <div className="flex shrink-0 items-center gap-1.5">
        <Link href={`/listings/${row.product_id}`} target="_blank">
          <Button variant="ghost" size="sm" className="gap-1.5 text-xs" aria-label="Preview listing">
            <Eye className="h-3.5 w-3.5" /> Preview
          </Button>
        </Link>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            aria-label="More actions"
            onClick={() => setMenuOpen((o) => !o)}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-44 rounded-xl border border-neutral-100 bg-white py-1 shadow-lg">
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { setMenuOpen(false); toast.info("Edit coming soon"); }}
                >
                  <Edit2 className="h-3.5 w-3.5" /> Edit listing
                </button>
                <button
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50"
                  onClick={() => { setMenuOpen(false); toast.info("Pause/resume coming soon"); }}
                >
                  {row.is_approved ? (
                    <><Pause className="h-3.5 w-3.5" /> Pause listing</>
                  ) : (
                    <><Play className="h-3.5 w-3.5" /> Re-activate</>
                  )}
                </button>
                <button
                  disabled={deleting}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                  onClick={() => {
                    setMenuOpen(false);
                    if (confirm(`Delete "${row.title}"? This cannot be undone.`)) {
                      onDelete(row.product_id);
                    }
                  }}
                >
                  {deleting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="h-3.5 w-3.5" />
                  )}
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function DealerInventoryPage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user  = useAuthStore((s) => s.user);
  const qc    = useQueryClient();

  const [search, setSearch]             = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [deletingId, setDeletingId]     = useState<string | null>(null);

  const { data: listings = [], isLoading } = useQuery({
    queryKey: ["dealer-inventory", user?.id],
    queryFn:  () => dealerService.inventory(user?.id, token),
    enabled:  !!token,
  });

  const deleteMutation = useMutation({
    mutationFn: (productId: string) => {
      if (!token) throw new Error("Not authenticated");
      return dealerService.removeListing(productId, token);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dealer-inventory"] });
      toast.success("Listing removed");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Failed to delete listing");
      setDeletingId(null);
    },
  });

  const handleDelete = (id: string) => {
    setDeletingId(id);
    deleteMutation.mutate(id);
  };

  const filtered = listings.filter((row) => {
    const matchesSearch =
      !search ||
      row.title?.toLowerCase().includes(search.toLowerCase()) ||
      row.make?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && row.is_approved) ||
      (statusFilter === "pending" && !row.is_approved);
    return matchesSearch && matchesStatus;
  });

  const activeCount  = listings.filter((r) => r.is_approved).length;
  const pendingCount = listings.filter((r) => !r.is_approved).length;

  return (
    <RoleGate
      allow={["dealer", "admin"]}
      title="Dealer package required"
      description="Upgrade to the Dealer plan to manage your inventory."
    >
      <div className="space-y-6">
        {/* header */}
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold">Inventory</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              {listings.length} listing{listings.length !== 1 ? "s" : ""} total ·{" "}
              <span className="text-emerald-600">{activeCount} active</span>
              {pendingCount > 0 && (
                <span className="text-amber-600"> · {pendingCount} pending review</span>
              )}
            </p>
          </div>
          <Link href="/sell">
            <Button variant="premium" className="gap-2">
              <Plus className="h-4 w-4" /> Add listing
            </Button>
          </Link>
        </div>

        {/* search + filter bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-neutral-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by title or make…"
              className="pl-9"
            />
          </div>
          {(["all", "active", "pending"] as StatusFilter[]).map((f) => (
            <button
              key={f}
              onClick={() => setStatusFilter(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium capitalize transition ${
                statusFilter === f
                  ? "bg-neutral-900 text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              }`}
            >
              {f}
            </button>
          ))}
        </div>

        {/* list */}
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <Card className="flex flex-col items-center gap-4 py-16 text-center">
            <Car className="h-10 w-10 text-neutral-200" />
            <div className="space-y-1">
              <p className="font-medium text-neutral-700">
                {listings.length === 0 ? "No listings yet" : "No results match your filters"}
              </p>
              <p className="text-sm text-neutral-400">
                {listings.length === 0
                  ? "Add your first car and it will appear here after admin review."
                  : "Try clearing the search or changing the status filter."}
              </p>
            </div>
            {listings.length === 0 && (
              <Link href="/sell">
                <Button variant="premium" className="gap-2">
                  <Plus className="h-4 w-4" /> Add your first listing
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {filtered.map((row) => (
              <ListingRow
                key={row.product_id}
                row={row}
                onDelete={handleDelete}
                deleting={deletingId === row.product_id}
              />
            ))}
          </div>
        )}
      </div>
    </RoleGate>
  );
}
