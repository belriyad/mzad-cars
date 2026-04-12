"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Bookmark, BookmarkX, Lock, MapPin, Calendar, Gauge } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { favoritesService } from "@/services/favorites.service";
import { listingsService } from "@/services/listings.service";
import { useAuthStore } from "@/store/auth-store";
import { formatCurrencyQAR } from "@/lib/utils";
import { parseImageUrls } from "@/types/domain";
import type { FavoriteItem } from "@/types/api";

function FavCard({
  fav,
  onRemove,
  removing,
}: {
  fav: FavoriteItem;
  onRemove: (id: number) => void;
  removing: boolean;
}) {
  const { data } = useQuery({
    queryKey: ["listing", fav.product_id],
    queryFn: () => listingsService.getById(fav.product_id),
    staleTime: 10 * 60_000,
  });

  // getById returns a single Listing — handle possible wrapped shape
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listing = (data as any)?.rows?.[0] ?? data;
  const images = listing ? parseImageUrls(listing) : [];
  const thumb = images[0];

  return (
    <Card className="flex gap-3 p-3">
      <Link href={`/listings/${fav.product_id}`} className="shrink-0">
        {thumb ? (
          <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-36">
            <Image src={thumb} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-28 items-center justify-center rounded-xl bg-neutral-100 sm:h-24 sm:w-36">
            <Bookmark className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 min-w-0 flex-col justify-between gap-1">
        <div className="space-y-0.5">
          <Link
            href={`/listings/${fav.product_id}`}
            className="line-clamp-2 text-sm font-semibold text-neutral-800 hover:underline leading-snug"
          >
            {listing?.title ?? `Listing #${fav.product_id}`}
          </Link>
          {listing?.price_qar && (
            <p className="text-base font-bold text-neutral-900">
              {formatCurrencyQAR(listing.price_qar)}
            </p>
          )}
          <div className="flex flex-wrap gap-1.5 text-xs text-neutral-500">
            {listing?.manufacture_year && (
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-3 w-3" />{listing.manufacture_year}
              </span>
            )}
            {listing?.km !== undefined && (
              <span className="inline-flex items-center gap-1">
                <Gauge className="h-3 w-3" />{listing.km.toLocaleString()} km
              </span>
            )}
            {listing?.city && (
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3 w-3" />{listing.city}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {fav.created_at && (
            <p className="text-[11px] text-neutral-400">
              Saved {new Date(fav.created_at).toLocaleDateString()}
            </p>
          )}
          {listing?.deal_rating && (
            <Badge
              className={
                listing.deal_rating === "great_deal"
                  ? "bg-emerald-100 text-emerald-700"
                  : listing.deal_rating === "good_deal"
                  ? "bg-teal-100 text-teal-700"
                  : listing.deal_rating === "expensive"
                  ? "bg-rose-100 text-rose-700"
                  : "bg-neutral-100 text-neutral-600"
              }
            >
              {listing.deal_rating.replace("_", " ")}
            </Badge>
          )}
          <button
            onClick={() => onRemove(fav.id)}
            disabled={removing}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-red-50 hover:text-red-500 transition disabled:opacity-50"
          >
            <BookmarkX className="h-3.5 w-3.5" />
            Remove
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function FavoritesPage() {
  const queryClient = useQueryClient();
  const token = useAuthStore((s) => s.accessToken);

  const { data, isLoading } = useQuery({
    queryKey: ["favorites"],
    queryFn: () => favoritesService.list(),
    enabled: !!token,
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => favoritesService.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["favorites"] }),
  });

  const favorites: FavoriteItem[] = data?.rows ?? [];

  if (!token) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Saved cars</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Cars you have bookmarked for later.</p>
        </div>
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <Lock className="h-10 w-10 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Sign in to save cars</p>
          <div className="flex gap-2">
            <Link href="/login"><Button>Sign in</Button></Link>
            <Link href="/register"><Button variant="secondary">Create account</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Saved cars</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Cars you have bookmarked — compare and revisit any time.
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : favorites.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <Bookmark className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">No saved cars yet</p>
          <p className="max-w-xs text-sm text-neutral-400">
            Tap the bookmark icon on any listing to save it here.
          </p>
          <Link href="/listings"><Button className="mt-2">Browse listings</Button></Link>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">{favorites.length} saved</p>
          {favorites.map((fav) => (
            <FavCard
              key={fav.id}
              fav={fav}
              onRemove={(id) => removeMutation.mutate(id)}
              removing={removeMutation.isPending}
            />
          ))}
        </div>
      )}
    </div>
  );
}
