"use client";

import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";
import { Heart, MapPin, Calendar, Gauge, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useLikesStore } from "@/store/likes-store";
import { listingsService } from "@/services/listings.service";
import { formatCurrencyQAR } from "@/lib/utils";
import { parseImageUrls } from "@/types/domain";

function LikedCard({ productId }: { productId: string }) {
  const unlike = useLikesStore((s) => s.unlike);

  const { data, isLoading } = useQuery({
    queryKey: ["listing", productId],
    queryFn: () => listingsService.getById(productId),
    staleTime: 10 * 60_000,
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const listing = (data as any)?.rows?.[0] ?? data;
  const images = listing ? parseImageUrls(listing) : [];
  const thumb = images[0];

  if (isLoading) {
    return <div className="h-28 animate-pulse rounded-2xl bg-neutral-100" />;
  }

  return (
    <Card className="flex gap-3 p-3">
      <Link href={`/listings/${productId}`} className="shrink-0">
        {thumb ? (
          <div className="relative h-20 w-28 overflow-hidden rounded-xl bg-neutral-100 sm:h-24 sm:w-36">
            <Image src={thumb} alt="" fill className="object-cover" unoptimized />
          </div>
        ) : (
          <div className="flex h-20 w-28 items-center justify-center rounded-xl bg-neutral-100 sm:h-24 sm:w-36">
            <Heart className="h-6 w-6 text-neutral-300" />
          </div>
        )}
      </Link>

      <div className="flex flex-1 min-w-0 flex-col justify-between gap-1">
        <div className="space-y-0.5">
          <Link
            href={`/listings/${productId}`}
            className="line-clamp-2 text-sm font-semibold text-neutral-800 hover:underline leading-snug"
          >
            {listing?.title ?? `Listing #${productId}`}
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
            onClick={() => unlike(productId)}
            className="ml-auto flex items-center gap-1 rounded-lg px-2 py-1 text-xs text-neutral-400 hover:bg-red-50 hover:text-rose-500 transition"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Unlike
          </button>
        </div>
      </div>
    </Card>
  );
}

export default function LikedPage() {
  const likedIds = useLikesStore((s) => s.likedIds);
  const clear = useLikesStore((s) => s.clear);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Liked cars</h1>
          <p className="mt-0.5 text-sm text-neutral-500">
            Cars you have liked — stored on this device.
          </p>
        </div>
        {likedIds.length > 0 && (
          <button
            onClick={clear}
            className="text-xs text-neutral-400 hover:text-red-500 transition"
          >
            Clear all
          </button>
        )}
      </div>

      {likedIds.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <Heart className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">No liked cars yet</p>
          <p className="max-w-xs text-sm text-neutral-400">
            Tap the <strong>heart</strong> icon on any listing to like it.
          </p>
          <Link href="/listings">
            <Button className="mt-2">Browse listings</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-neutral-400">{likedIds.length} liked</p>
          {likedIds.map((id) => (
            <LikedCard key={id} productId={id} />
          ))}
        </div>
      )}
    </div>
  );
}
