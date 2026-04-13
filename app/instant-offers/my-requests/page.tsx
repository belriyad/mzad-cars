"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Car, ChevronRight, Clock, CheckCircle2, XCircle, AlertCircle, Loader2, MessageSquare } from "lucide-react";
import Link from "next/link";
import { instantOffersService } from "@/services/instant-offers.service";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyQAR } from "@/lib/utils";
import type { OfferRequest, OfferBid } from "@/types/api";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
  open:        { label: "Open",        color: "bg-blue-100 text-blue-700",    icon: <Clock className="h-3 w-3" /> },
  under_offer: { label: "Under offer", color: "bg-amber-100 text-amber-700",  icon: <AlertCircle className="h-3 w-3" /> },
  accepted:    { label: "Accepted",    color: "bg-emerald-100 text-emerald-700", icon: <CheckCircle2 className="h-3 w-3" /> },
  rejected:    { label: "Rejected",    color: "bg-neutral-100 text-neutral-500", icon: <XCircle className="h-3 w-3" /> },
  cancelled:   { label: "Cancelled",   color: "bg-neutral-100 text-neutral-500", icon: <XCircle className="h-3 w-3" /> },
  expired:     { label: "Expired",     color: "bg-red-100 text-red-600",      icon: <Clock className="h-3 w-3" /> },
};

const BID_STATUS_COLOR: Record<string, string> = {
  pending:   "bg-blue-100 text-blue-700",
  accepted:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-neutral-100 text-neutral-500",
  withdrawn: "bg-neutral-100 text-neutral-500",
  expired:   "bg-red-100 text-red-600",
};

function BidCard({ bid, requestUid, onAccept, onReject, isPending }: {
  bid: OfferBid;
  requestUid: string;
  onAccept: (bidUid: string) => void;
  onReject: (bidUid: string) => void;
  isPending: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-neutral-100 p-3 bg-neutral-50">
      <div className="space-y-1">
        <p className="font-semibold text-lg">{formatCurrencyQAR(bid.amount_qar)}</p>
        {bid.message && <p className="text-xs text-neutral-500 line-clamp-1">{bid.message}</p>}
        <Badge className={`text-xs ${BID_STATUS_COLOR[bid.status] ?? "bg-neutral-100 text-neutral-500"}`}>
          {bid.status}
        </Badge>
      </div>
      {bid.status === "pending" && (
        <div className="flex gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="secondary"
            disabled={isPending}
            onClick={() => onReject(bid.bid_uid)}
            className="text-xs"
          >
            Decline
          </Button>
          <Button
            size="sm"
            disabled={isPending}
            onClick={() => onAccept(bid.bid_uid)}
            className="text-xs gap-1"
          >
            {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <CheckCircle2 className="h-3 w-3" />}
            Accept
          </Button>
        </div>
      )}
    </div>
  );
}

function RequestCard({ req }: { req: OfferRequest }) {
  const token = useAuthStore((s) => s.accessToken) ?? "";
  const qc = useQueryClient();
  const cfg = STATUS_CONFIG[req.status] ?? STATUS_CONFIG.open;
  const [expanded, setExpanded] = useState(false);

  const acceptMutation = useMutation({
    mutationFn: (bidUid: string) => instantOffersService.acceptBid(req.request_uid, bidUid, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-io-requests"] }),
  });
  const rejectMutation = useMutation({
    mutationFn: (bidUid: string) => instantOffersService.rejectBid(req.request_uid, bidUid, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-io-requests"] }),
  });
  const cancelMutation = useMutation({
    mutationFn: () => instantOffersService.cancelRequest(req.request_uid, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-io-requests"] }),
  });

  const bids = req.bids ?? [];

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-semibold">
            {req.year} {req.make} {req.model ?? ""}{" "}
            <span className="text-neutral-400 text-sm font-normal">{req.class_name}</span>
          </p>
          <p className="text-sm text-neutral-500">{req.km.toLocaleString()} km · {req.city}</p>
          {req.asking_price_qar && (
            <p className="text-sm">Asking: <span className="font-semibold">{formatCurrencyQAR(req.asking_price_qar)}</span></p>
          )}
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <Badge className={`flex items-center gap-1 text-xs ${cfg.color}`}>
            {cfg.icon} {cfg.label}
          </Badge>
        </div>
      </div>

      {bids.length > 0 && (
        <div>
          <button
            className="flex items-center gap-1 text-xs font-medium text-blue-600 mb-2"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "Hide" : "Show"} {bids.length} bid{bids.length !== 1 ? "s" : ""}
            <ChevronRight className={`h-3 w-3 transition-transform ${expanded ? "rotate-90" : ""}`} />
          </button>
          {expanded && (
            <div className="space-y-2">
              {bids.map((bid) => (
                <BidCard
                  key={bid.bid_uid}
                  bid={bid}
                  requestUid={req.request_uid}
                  onAccept={(uid) => acceptMutation.mutate(uid)}
                  onReject={(uid) => rejectMutation.mutate(uid)}
                  isPending={acceptMutation.isPending || rejectMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      )}
      {bids.length === 0 && req.status === "open" && (
        <p className="text-xs text-neutral-400">No bids yet — dealers are reviewing your request.</p>
      )}

      <div className="flex gap-2 border-t border-neutral-100 pt-2">
        <Link href={`/instant-offers/${req.request_uid}`}>
          <Button variant="secondary" size="sm" className="gap-1 text-xs">
            <MessageSquare className="h-3.5 w-3.5" /> Messages
          </Button>
        </Link>
        {(req.status === "open" || req.status === "under_offer") && (
          <Button
            variant="secondary"
            size="sm"
            className="text-xs text-red-600"
            disabled={cancelMutation.isPending}
            onClick={() => cancelMutation.mutate()}
          >
            {cancelMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Cancel"}
          </Button>
        )}
      </div>
    </Card>
  );
}

export default function MyRequestsPage() {
  const token = useAuthStore((s) => s.accessToken);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-io-requests"],
    queryFn: () => instantOffersService.myRequests(token ?? ""),
    enabled: !!token,
  });

  const requests = data?.rows ?? [];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My instant offer requests</h1>
          <p className="mt-1 text-sm text-neutral-500">Track bids from dealers and accept the best offer.</p>
        </div>
        <Link href="/instant-offers/sell">
          <Button size="sm" className="gap-1.5">
            <Car className="h-4 w-4" /> New request
          </Button>
        </Link>
      </div>

      {!token && (
        <Card className="text-center py-8 text-neutral-500">
          <p className="font-medium">Please log in to see your requests.</p>
          <Link href="/login"><Button className="mt-3">Log in</Button></Link>
        </Card>
      )}

      {token && isLoading && (
        <div className="flex items-center justify-center py-12 text-neutral-500 gap-2">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading…
        </div>
      )}

      {token && isError && (
        <Card className="text-center py-8 text-red-600">Failed to load requests. Please try again.</Card>
      )}

      {token && !isLoading && requests.length === 0 && (
        <Card className="text-center py-10 space-y-3">
          <Car className="h-10 w-10 mx-auto text-neutral-300" />
          <p className="font-medium text-neutral-700">No requests yet</p>
          <p className="text-sm text-neutral-400">Submit your car and get dealer bids within 24 hours.</p>
          <Link href="/instant-offers/sell">
            <Button>Get started</Button>
          </Link>
        </Card>
      )}

      {requests.map((req) => (
        <RequestCard key={req.request_uid} req={req} />
      ))}
    </div>
  );
}
