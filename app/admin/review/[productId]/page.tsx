"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CheckCircle, XCircle, ChevronLeft, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ImageCarousel } from "@/components/listings/image-carousel";
import { adminService } from "@/services/admin.service";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { parseImageUrls, parseProperties } from "@/types/domain";
import { formatCurrencyQAR } from "@/lib/utils";
import {
  Calendar, Gauge, MapPin, Shield,
} from "lucide-react";

export default function AdminReviewPage({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = use(params);
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAdmin, token: adminToken } = useAdminAuth();

  // ── fetch listing ──────────────────────────────────────────────────────
  // The backend /listings/:id returns 404 for unapproved listings, so we
  // fetch via the admin list endpoint with is_approved=any and match by ID.
  const { data: listing, isLoading, isError } = useQuery({
    queryKey: ["admin-listing-review", productId],
    queryFn: async () => {
      const res = await adminService.listAll({ is_approved: "any", limit: 500 }, adminToken);
      const found = res.rows.find((r) => r.product_id === productId);
      if (!found) throw new Error("listing not found");
      return found;
    },
    enabled: isAdmin && !!adminToken,
  });

  // ── approve / reject mutations ─────────────────────────────────────────
  const approve = useMutation({
    mutationFn: () => adminService.setApproval(productId, true, adminToken),
    onSuccess: () => {
      toast.success("Listing approved");
      queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      router.push("/admin/moderation");
    },
    onError: () => toast.error("Failed to approve listing"),
  });

  const reject = useMutation({
    mutationFn: () => adminService.setApproval(productId, false, adminToken),
    onSuccess: () => {
      toast.success("Listing rejected");
      queryClient.invalidateQueries({ queryKey: ["admin-moderation"] });
      queryClient.invalidateQueries({ queryKey: ["admin-listings"] });
      router.push("/admin/moderation");
    },
    onError: () => toast.error("Failed to reject listing"),
  });

  const busy = approve.isPending || reject.isPending;

  // ── render ─────────────────────────────────────────────────────────────
  if (!isAdmin) {
    return <Card className="text-red-600">Admin access required.</Card>;
  }

  return (
    <section className="space-y-4">
      {/* header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-900"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>
        <h1 className="text-xl font-semibold">Review #{productId}</h1>
        <span className="text-xs text-neutral-400">Admin only</span>
      </div>

      {/* loading / error */}
      {isLoading && (
        <div className="space-y-3">
          <div className="h-64 animate-pulse rounded-2xl bg-neutral-100" />
          <Card className="h-28 animate-pulse bg-neutral-100" />
        </div>
      )}
      {isError && (
        <Card className="flex items-center gap-2 text-amber-700">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          Could not load listing. It may have been removed or the ID is invalid.
        </Card>
      )}

      {listing && (
        <>
          {/* images */}
          <ImageCarousel images={parseImageUrls(listing)} />

          {/* title + price */}
          <Card className="space-y-2">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-xl font-semibold leading-snug">{listing.title}</h2>
              <div className="flex flex-wrap gap-1.5">
                {listing.is_company === "1" || listing.seller_type === "dealer" ? (
                  <Badge className="bg-blue-100 text-blue-800">Dealer</Badge>
                ) : null}
                {!listing.is_approved ? (
                  <Badge className="bg-amber-100 text-amber-700">Pending</Badge>
                ) : listing.is_approved === true ? (
                  <Badge className="bg-green-100 text-green-700">Approved</Badge>
                ) : (
                  <Badge className="bg-red-100 text-red-700">Rejected</Badge>
                )}
              </div>
            </div>
            <p className="text-3xl font-bold">{formatCurrencyQAR(listing.price_qar)}</p>
            <p className="text-sm text-neutral-500">
              {[listing.make, listing.class_name, listing.model].filter(Boolean).join(" · ")}
            </p>
          </Card>

          {/* specs */}
          <Card>
            <h3 className="mb-3 font-semibold">Specifications</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm sm:grid-cols-3">
              {listing.manufacture_year && (
                <div className="flex flex-col gap-0.5">
                  <dt className="flex items-center gap-1 text-xs text-neutral-400"><Calendar className="h-3.5 w-3.5" />Year</dt>
                  <dd className="font-medium">{listing.manufacture_year}</dd>
                </div>
              )}
              {listing.km !== undefined && (
                <div className="flex flex-col gap-0.5">
                  <dt className="flex items-center gap-1 text-xs text-neutral-400"><Gauge className="h-3.5 w-3.5" />Mileage</dt>
                  <dd className="font-medium">{listing.km.toLocaleString()} km</dd>
                </div>
              )}
              {listing.city && (
                <div className="flex flex-col gap-0.5">
                  <dt className="flex items-center gap-1 text-xs text-neutral-400"><MapPin className="h-3.5 w-3.5" />Location</dt>
                  <dd className="font-medium">{listing.city}</dd>
                </div>
              )}
              {listing.warranty_status && (
                <div className="flex flex-col gap-0.5">
                  <dt className="flex items-center gap-1 text-xs text-neutral-400"><Shield className="h-3.5 w-3.5" />Warranty</dt>
                  <dd className="font-medium">{listing.warranty_status}</dd>
                </div>
              )}
            </dl>

            {/* extra properties */}
            {parseProperties(listing).length > 0 && (
              <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-neutral-100 pt-4 text-sm sm:grid-cols-3">
                {parseProperties(listing).map((p, i) => (
                  <div key={`${p.label}-${i}`} className="flex flex-col gap-0.5">
                    <dt className="text-xs text-neutral-400">{p.label}</dt>
                    <dd className="font-medium">{p.value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Card>

          {/* seller info */}
          <Card className="space-y-1">
            <h3 className="font-semibold">Seller</h3>
            <p className="text-sm text-neutral-700">{listing.seller_name ?? "—"}</p>
            {listing.seller_phone && (
              <p className="text-sm text-neutral-500">{listing.seller_phone}</p>
            )}
            {listing.seller_user_id && (
              <p className="text-xs text-neutral-400">User ID: {listing.seller_user_id}</p>
            )}
          </Card>

          {/* description */}
          {listing.description && (
            <Card>
              <h3 className="mb-2 font-semibold">Description</h3>
              <p className="whitespace-pre-line text-sm leading-relaxed text-neutral-700">
                {listing.description}
              </p>
            </Card>
          )}

          {/* ── decision bar ─────────────────────────────────────────────── */}
          <div className="sticky bottom-20 z-20 rounded-2xl border border-neutral-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur md:bottom-4">
            <p className="mb-2.5 text-center text-xs font-medium text-neutral-500 uppercase tracking-wide">
              Admin decision
            </p>
            <div className="flex gap-2">
              <Button
                className="flex-1 gap-1.5 bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => approve.mutate()}
                disabled={busy}
              >
                <CheckCircle className="h-4 w-4" />
                {approve.isPending ? "Approving…" : "Approve"}
              </Button>
              <Button
                variant="danger"
                className="flex-1 gap-1.5"
                onClick={() => reject.mutate()}
                disabled={busy}
              >
                <XCircle className="h-4 w-4" />
                {reject.isPending ? "Rejecting…" : "Reject"}
              </Button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}
