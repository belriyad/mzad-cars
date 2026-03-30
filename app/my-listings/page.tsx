"use client";

import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, Pencil, PlusCircle, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusChip } from "@/components/common/status-chip";
import { listingsService } from "@/services/listings.service";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrencyQAR } from "@/lib/utils";
import type { Listing } from "@/types/domain";

function approvalStatus(listing: Listing) {
  if (listing.is_approved === true)  return "active";
  if (listing.is_approved === false) return "rejected";
  return "pending_review";
}

export default function MyListingsPage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user  = useAuthStore((s) => s.user);
  const qc    = useQueryClient();

  const query = useQuery({
    queryKey: ["my-listings", user?.id],
    queryFn: () =>
      listingsService.list({ seller_user_id: user?.id, limit: 100 }, token),
    enabled: !!token && !!user?.id,
  });

  const remove = useMutation({
    mutationFn: (productId: string) => listingsService.remove(productId, token),
    onSuccess: () => {
      toast.success("Listing removed");
      qc.invalidateQueries({ queryKey: ["my-listings"] });
    },
    onError: () => toast.error("Failed to remove listing"),
  });

  if (!token || !user) {
    return (
      <Card className="flex flex-col items-center gap-3 py-14 text-center">
        <User className="h-10 w-10 text-neutral-300" />
        <p className="font-medium">Sign in to see your listings</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </Card>
    );
  }

  const listings = query.data?.rows ?? [];

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My listings</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Manage your active and pending car listings.
          </p>
        </div>
        <Link href="/sell">
          <Button className="gap-2">
            <PlusCircle className="h-4 w-4" /> New listing
          </Button>
        </Link>
      </div>

      {/* loading */}
      {query.isLoading && (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      )}
      {query.isError && (
        <Card className="text-red-600">Failed to load your listings.</Card>
      )}

      {/* empty */}
      {!query.isLoading && listings.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <Car className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-600">No listings yet</p>
          <p className="text-sm text-neutral-400">Post your first car for free in minutes.</p>
          <Link href="/sell"><Button>Sell a car</Button></Link>
        </Card>
      )}

      {/* list */}
      <div className="space-y-2">
        {listings.map((listing) => {
          const status = approvalStatus(listing);
          return (
            <div
              key={listing.product_id}
              className="flex flex-wrap items-center gap-3 rounded-2xl border border-neutral-100 bg-white px-4 py-3 shadow-sm"
            >
              {/* thumbnail */}
              {listing.main_image_url ? (
                <img
                  src={listing.main_image_url}
                  alt={listing.title}
                  className="h-14 w-20 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-14 w-20 shrink-0 items-center justify-center rounded-xl bg-neutral-100">
                  <Car className="h-5 w-5 text-neutral-400" />
                </div>
              )}

              {/* info */}
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-neutral-900">{listing.title}</p>
                <p className="text-sm text-neutral-500">{formatCurrencyQAR(listing.price_qar)}</p>
              </div>

              {/* status */}
              <StatusChip status={status} />

              {/* actions */}
              <div className="flex shrink-0 items-center gap-1.5">
                <Link href={`/listings/${listing.product_id}`}>
                  <Button size="sm" variant="secondary" className="gap-1">
                    View
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="danger"
                  className="gap-1"
                  disabled={remove.isPending}
                  onClick={() => {
                    if (confirm("Remove this listing?")) {
                      remove.mutate(listing.product_id);
                    }
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
