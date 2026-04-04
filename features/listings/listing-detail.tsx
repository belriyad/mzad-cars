"use client";

import { useQuery } from "@tanstack/react-query";
import { Calendar, ChevronLeft, ChevronRight, Gauge, MapPin, MessageCircle, Phone, Shield, TrendingDown, TrendingUp, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { listingsService } from "@/services/listings.service";
import { parseImageUrls, parseProperties } from "@/types/domain";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/listings/image-carousel";
import { useEntitlement } from "@/hooks/use-entitlement";
import { LockedValuation } from "@/components/common/locked-valuation";
import { WatchButton } from "@/components/listings/watch-button";
import { CostCalculator } from "@/components/listings/cost-calculator";
import { PeerPricingPanel } from "@/components/listings/peer-pricing-panel";
import { formatCurrencyQAR } from "@/lib/utils";

export function ListingDetail({
  productId,
  ids = [],
  from,
}: {
  productId: string;
  ids?: string[];
  from?: string;
}) {
  const { user, entitlements } = useEntitlement();
  const router = useRouter();

  const hasContext = ids.length > 0;
  const currentIndex = hasContext ? ids.indexOf(productId) : -1;
  const prevId = currentIndex > 0 ? ids[currentIndex - 1] : null;
  const nextId = currentIndex !== -1 && currentIndex < ids.length - 1 ? ids[currentIndex + 1] : null;
  const backUrl = from ? decodeURIComponent(from) : "/listings";

  const navTo = (id: string) => {
    const idsParam = ids.join(",");
    const fromParam = encodeURIComponent(from ?? "/listings");
    router.push(`/listings/${id}?ids=${idsParam}&from=${fromParam}`);
  };

  const query = useQuery({
    queryKey: ["listing", productId],
    queryFn: () => listingsService.getById(productId),
  });

  if (query.isLoading) return <Card className="h-64 animate-pulse bg-neutral-100" />;
  if (query.isError || !query.data) return <Card>Listing unavailable.</Card>;

  const listing = query.data;
  const images = parseImageUrls(listing);
  const properties = parseProperties(listing);
  const isDealer = listing.is_company === "1" || listing.seller_type === "dealer";
  const whatsappHref = listing.seller_whatsapp
    ? `https://wa.me/${listing.seller_whatsapp.replace(/\D/g, "")}`
    : listing.url ?? "#";
  const discountPct = listing.discount_pct;
  const isGoodDeal = discountPct !== undefined && discountPct > 0;
  const isExpensive = discountPct !== undefined && discountPct < -5;

  return (
    <div className="space-y-4">
      {/* ── sticky navigation bar ───────────────────────────────────────── */}
      {hasContext && (
        <div className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-2 bg-white/90 px-4 py-2.5 shadow-sm backdrop-blur-sm">
          {/* back to results */}
          <a
            href={backUrl}
            className="flex items-center gap-1 text-sm font-medium text-neutral-600 hover:text-neutral-900"
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to results</span>
            <span className="sm:hidden">Back</span>
          </a>

          {/* position counter */}
          <span className="text-xs text-neutral-400">
            {currentIndex + 1} / {ids.length}
          </span>

          {/* prev / next */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => prevId && navTo(prevId)}
              disabled={!prevId}
              className="flex items-center gap-0.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <button
              onClick={() => nextId && navTo(nextId)}
              disabled={!nextId}
              className="flex items-center gap-0.5 rounded-xl border border-neutral-200 px-3 py-1.5 text-sm font-medium text-neutral-700 hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {/* images */}
      <ImageCarousel images={images} />

      {/* title & price */}
      <Card className="space-y-2">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h1 className="text-xl font-semibold leading-snug">{listing.title}</h1>
          {isDealer && <Badge className="bg-blue-100 text-blue-800">Dealer</Badge>}
        </div>

        <div className="flex flex-wrap items-baseline gap-3">
          <p className="text-3xl font-bold">{formatCurrencyQAR(listing.price_qar)}</p>
          {listing.expected_price_qar && listing.expected_price_qar !== listing.price_qar && (
            <p className="text-base text-neutral-400 line-through">
              {formatCurrencyQAR(listing.expected_price_qar)}
            </p>
          )}
          {listing.discount_qar !== undefined && listing.discount_qar !== 0 && (
            <span className={`text-sm font-semibold ${listing.discount_qar > 0 ? "text-emerald-700" : "text-rose-600"}`}>
              {listing.discount_qar > 0 ? "−" : "+"}{formatCurrencyQAR(Math.abs(listing.discount_qar))}
            </span>
          )}
        </div>

        <p className="text-sm text-neutral-500">
          {[listing.make, listing.class_name, listing.model].filter(Boolean).join(" · ")}
        </p>
      </Card>

      {/* key specs */}
      <Card>
        <h2 className="mb-3 font-semibold">Specifications</h2>
        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
          {listing.manufacture_year && (
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1 text-xs text-neutral-400">
                <Calendar className="h-3.5 w-3.5" /> Year
              </dt>
              <dd className="font-medium text-neutral-800">{listing.manufacture_year}</dd>
            </div>
          )}
          {listing.km !== undefined && (
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1 text-xs text-neutral-400">
                <Gauge className="h-3.5 w-3.5" /> Mileage
              </dt>
              <dd className="font-medium text-neutral-800">{listing.km.toLocaleString()} km</dd>
            </div>
          )}
          {listing.city && (
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1 text-xs text-neutral-400">
                <MapPin className="h-3.5 w-3.5" /> Location
              </dt>
              <dd className="font-medium text-neutral-800">{listing.city}</dd>
            </div>
          )}
          {listing.warranty_status && (
            <div className="flex flex-col gap-0.5">
              <dt className="flex items-center gap-1 text-xs text-neutral-400">
                <Shield className="h-3.5 w-3.5" /> Warranty
              </dt>
              <dd className="font-medium text-neutral-800">{listing.warranty_status}</dd>
            </div>
          )}
          {listing.cylinder_count && (
            <div className="flex flex-col gap-0.5">
              <dt className="text-xs text-neutral-400">Cylinders</dt>
              <dd className="font-medium text-neutral-800">{listing.cylinder_count}</dd>
            </div>
          )}
        </dl>

        {/* extra properties from JSON */}
        {properties.length > 0 && (
          <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-3">
            {properties.map((p, i) => (
              <div key={`${p.label}-${i}`} className="flex flex-col gap-0.5">
                <dt className="text-xs text-neutral-400">{p.label}</dt>
                <dd className="font-medium text-neutral-800">{p.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Card>

      {/* deal intelligence */}
      <Card>
        <h2 className="mb-3 font-semibold">Deal analysis</h2>
        {entitlements.canSeeValuationOnListings ? (
          <div className="space-y-2">
            {discountPct !== undefined ? (
              <div className={`flex items-center gap-2 rounded-2xl px-3 py-2 text-sm font-semibold ${
                isGoodDeal ? "bg-emerald-50 text-emerald-800" : isExpensive ? "bg-rose-50 text-rose-700" : "bg-neutral-50 text-neutral-700"
              }`}>
                {isGoodDeal
                  ? <TrendingDown className="h-4 w-4" />
                  : isExpensive
                  ? <TrendingUp className="h-4 w-4" />
                  : null}
                {isGoodDeal
                  ? `${discountPct.toFixed(1)}% below market — good deal`
                  : isExpensive
                  ? `${Math.abs(discountPct).toFixed(1)}% above market`
                  : "Priced at market value"}
              </div>
            ) : (
              <p className="text-sm text-emerald-700">Fair Price based on recent market peers.</p>
            )}
            {listing.deal_reason && (
              <p className="text-sm text-neutral-600">{listing.deal_reason}</p>
            )}
            {listing.peer_count !== undefined && (
              <p className="inline-flex items-center gap-1 text-xs text-neutral-400">
                <Users className="h-3 w-3" />
                Compared against {listing.peer_count} similar cars
                {listing.mileage_window_km ? ` within ±${listing.mileage_window_km.toLocaleString()} km` : ""}
              </p>
            )}
            {listing.deal_last_computed_at && (
              <p className="text-xs text-neutral-400">
                Updated {new Date(listing.deal_last_computed_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ) : (
          <LockedValuation />
        )}
      </Card>

      {/* peer pricing rationale + similar cars */}
      {entitlements.canSeeValuationOnListings && <PeerPricingPanel listing={listing} />}

      {/* description */}
      {listing.description && (
        <Card>
          <h2 className="mb-2 font-semibold">Description</h2>
          <p className="whitespace-pre-line text-sm text-neutral-700 leading-relaxed">{listing.description}</p>
          {listing.comments_count !== undefined && listing.comments_count > 0 && (
            <p className="mt-3 text-xs text-neutral-400">{listing.comments_count} buyer questions on original listing</p>
          )}
        </Card>
      )}

      {/* seller + CTAs */}
      <Card className="space-y-3">
        {listing.seller_name && (
          <div>
            <p className="text-xs text-neutral-400">Seller</p>
            <p className="font-medium text-neutral-800">{listing.seller_name}</p>
            {isDealer && <p className="text-xs text-blue-600">Verified Dealer</p>}
          </div>
        )}
        <div className="grid grid-cols-2 gap-2">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer">
            <Button variant="premium" className="w-full">
              <MessageCircle className="mr-1 h-4 w-4" /> WhatsApp
            </Button>
          </a>
          <Button variant="secondary" className="w-full">
            <Phone className="mr-1 h-4 w-4" />
            {user ? listing.seller_phone ?? "No phone" : "Login to reveal"}
          </Button>
        </div>
        {listing.url && (
          <a
            href={listing.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block text-center text-xs text-neutral-400 hover:text-neutral-600 underline"
          >
            View original listing source ↗
          </a>
        )}
        <WatchButton listing={listing} />
      </Card>

      <CostCalculator listing={listing} />
    </div>
  );
}
