import Link from "next/link";
import { Calendar, Gauge, MapPin, MessageCircle, Shield, Users } from "lucide-react";
import type { Listing } from "@/types/domain";
import { parseImageUrls } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/listings/image-carousel";
import { CompareCheckbox } from "@/components/listings/compare-bar";
import { SaveLikeButtons } from "@/components/listings/save-like-buttons";
import { formatCurrencyQAR } from "@/lib/utils";
import { LockedValuation } from "@/components/common/locked-valuation";

// ── Deal badge helpers ─────────────────────────────────────────────────────
function DealBadge({ listing }: { listing: Listing }) {
  const pct = listing.discount_pct;
  if (pct !== undefined && pct !== null) {
    const isGood = pct > 0;
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
          isGood
            ? "bg-emerald-100 text-emerald-800"
            : pct < -5
            ? "bg-rose-100 text-rose-700"
            : "bg-neutral-100 text-neutral-700"
        }`}
      >
        {isGood ? `${pct.toFixed(1)}% below market` : pct < 0 ? `${Math.abs(pct).toFixed(1)}% above market` : "At market price"}
      </span>
    );
  }
  const ratingMap: Record<string, { label: string; cls: string }> = {
    great_deal: { label: "Great Deal", cls: "bg-emerald-100 text-emerald-800" },
    good_deal: { label: "Good Deal", cls: "bg-teal-100 text-teal-800" },
    fair_price: { label: "Fair Price", cls: "bg-neutral-100 text-neutral-700" },
    expensive: { label: "Expensive", cls: "bg-rose-100 text-rose-700" },
  };
  const r = ratingMap[listing.deal_rating ?? "fair_price"];
  return <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${r.cls}`}>{r.label}</span>;
}

export function ListingCard({
  listing,
  showValuation,
  onViewDetails,
}: {
  listing: Listing;
  showValuation: boolean;
  /** Called when the user taps "View details". If omitted, falls back to a plain link. */
  onViewDetails?: () => void;
}) {
  const images = parseImageUrls(listing);
  const isDealer = listing.is_company === "1" || listing.seller_type === "dealer";
  const whatsappHref = listing.seller_whatsapp
    ? `https://wa.me/${listing.seller_whatsapp.replace(/\D/g, "")}`
    : listing.url ?? "#";

  return (
    <Card className="space-y-3 p-3 shadow-[0_8px_24px_rgba(15,23,42,0.06)] sm:p-4">
      {/* image */}
      <ImageCarousel images={images} />

      <div className="space-y-2">
        {/* title row */}
        <div className="flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 text-base font-semibold text-neutral-900 leading-snug">{listing.title}</h3>
          {isDealer && (
            <Badge className="shrink-0 bg-blue-100 text-blue-800">Dealer</Badge>
          )}
        </div>

        {/* price + expected */}
        <div className="flex flex-wrap items-baseline gap-2">
          <p className="text-2xl font-bold tracking-tight text-neutral-900">
            {formatCurrencyQAR(listing.price_qar)}
          </p>
          {listing.expected_price_qar && listing.expected_price_qar !== listing.price_qar && (
            <p className="text-sm text-neutral-400 line-through">
              {formatCurrencyQAR(listing.expected_price_qar)}
            </p>
          )}
        </div>

        {/* key specs row */}
        <div className="flex flex-wrap gap-1.5 text-xs text-neutral-600">
          {listing.manufacture_year && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-neutral-50 px-2 py-1.5">
              <Calendar className="h-3.5 w-3.5" />{listing.manufacture_year}
            </span>
          )}
          {listing.km !== undefined && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-neutral-50 px-2 py-1.5">
              <Gauge className="h-3.5 w-3.5" />{listing.km.toLocaleString()} km
            </span>
          )}
          {listing.city && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-neutral-50 px-2 py-1.5">
              <MapPin className="h-3.5 w-3.5" />{listing.city}
            </span>
          )}
          {listing.warranty_status && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-neutral-50 px-2 py-1.5">
              <Shield className="h-3.5 w-3.5" />{listing.warranty_status}
            </span>
          )}
          {listing.cylinder_count && (
            <span className="inline-flex items-center gap-1 rounded-xl bg-neutral-50 px-2 py-1.5">
              {listing.cylinder_count}cyl
            </span>
          )}
        </div>
      </div>

      {/* deal intel */}
      {showValuation ? (
        <div className="space-y-1">
          <DealBadge listing={listing} />
          {listing.deal_reason && (
            <p className="text-xs text-neutral-500">{listing.deal_reason}</p>
          )}
          {listing.peer_count !== undefined && (
            <p className="inline-flex items-center gap-1 text-xs text-neutral-400">
              <Users className="h-3 w-3" />
              Based on {listing.peer_count} similar listings
              {listing.mileage_window_km ? ` ±${listing.mileage_window_km.toLocaleString()} km` : ""}
            </p>
          )}
        </div>
      ) : (
        <LockedValuation />
      )}

      {/* CTAs */}
      <div className="grid grid-cols-2 gap-2">
        <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="col-span-1">
          <Button variant="premium" className="w-full rounded-2xl">
            <MessageCircle className="h-4 w-4" />
            <span className="ml-1">WhatsApp</span>
          </Button>
        </a>
        {onViewDetails ? (
          <Button className="col-span-1 w-full rounded-2xl" onClick={onViewDetails}>
            View details
          </Button>
        ) : (
          <Link href={`/listings/${listing.product_id}`} className="col-span-1">
            <Button className="w-full rounded-2xl">View details</Button>
          </Link>
        )}
      </div>

      <div className="flex items-center justify-between pt-0.5">
        <CompareCheckbox productId={listing.product_id} />
        <SaveLikeButtons productId={listing.product_id} />
      </div>
    </Card>
  );
}
