"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Car, ChevronDown, ChevronUp, Send, X } from "lucide-react";
import Link from "next/link";
import { instantOffersService } from "@/services/instant-offers.service";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyQAR } from "@/lib/utils";
import type { OfferRequest } from "@/types/api";

const CITIES = ["All", "Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

const bidSchema = z.object({
  amount_qar: z.coerce.number().min(1, "Required"),
  message:    z.string().optional(),
  expires_at: z.string().optional(),
});
type BidFormInput  = z.input<typeof bidSchema>;
type BidFormOutput = z.output<typeof bidSchema>;

function RequestCard({ req, token }: { req: OfferRequest; token: string }) {
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);

  const form = useForm<BidFormInput, unknown, BidFormOutput>({ resolver: zodResolver(bidSchema) });

  const bidMutation = useMutation({
    mutationFn: (data: BidFormOutput) =>
      instantOffersService.placeBid(req.request_uid, { amount_qar: data.amount_qar, message: data.message, expires_at: data.expires_at }, token),
    onSuccess: () => {
      form.reset();
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["io-pool"] });
    },
  });

  const declineMutation = useMutation({
    mutationFn: () => instantOffersService.declineRequest(req.request_uid, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["io-pool"] }),
  });

  const conditionColor: Record<string, string> = {
    excellent: "bg-emerald-100 text-emerald-700",
    good:      "bg-blue-100 text-blue-700",
    fair:      "bg-amber-100 text-amber-700",
    poor:      "bg-red-100 text-red-600",
  };

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="font-semibold">
            {req.year} {req.make} {req.model ?? ""}{" "}
            <span className="text-neutral-400 text-sm font-normal">{req.class_name}</span>
          </p>
          <p className="text-sm text-neutral-500">{req.km.toLocaleString()} km · {req.city}</p>
          <div className="flex flex-wrap gap-1.5">
            <Badge className={`text-xs ${conditionColor[req.condition] ?? "bg-neutral-100 text-neutral-500"}`}>
              {req.condition}
            </Badge>
            {req.color && <Badge className="text-xs bg-neutral-100 text-neutral-600">{req.color}</Badge>}
          </div>
        </div>
        <div className="text-right shrink-0 space-y-1">
          {req.asking_price_qar && (
            <p className="font-semibold text-sm">{formatCurrencyQAR(req.asking_price_qar)}</p>
          )}
          <p className="text-xs text-neutral-400">
            {req.bids?.length ?? 0} bid{(req.bids?.length ?? 0) !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {req.description && (
        <p className="text-sm text-neutral-500 line-clamp-2">{req.description}</p>
      )}

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Button
          size="sm"
          variant="secondary"
          className="gap-1 text-xs"
          onClick={() => setOpen(!open)}
        >
          <Send className="h-3.5 w-3.5" />
          Place bid
          {open ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </Button>
        <Button
          size="sm"
          variant="secondary"
          className="text-xs text-neutral-500 gap-1"
          disabled={declineMutation.isPending}
          onClick={() => declineMutation.mutate()}
        >
          <X className="h-3.5 w-3.5" />
          {declineMutation.isPending ? "Passing…" : "Pass"}
        </Button>
        <Link href={`/instant-offers/${req.request_uid}`}>
          <Button size="sm" variant="secondary" className="text-xs">Messages</Button>
        </Link>
      </div>

      {/* Bid form */}
      {open && (
        <div className="border-t border-neutral-100 pt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Bid amount (QAR) *</label>
              <Input type="number" placeholder="55000" {...form.register("amount_qar")} />
              {form.formState.errors.amount_qar && (
                <p className="text-xs text-red-500">{form.formState.errors.amount_qar.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Offer expires</label>
              <Input type="datetime-local" {...form.register("expires_at")} />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Message to seller</label>
            <Input placeholder="Any notes, inspection availability…" {...form.register("message")} />
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="gap-1"
              disabled={bidMutation.isPending}
              onClick={form.handleSubmit((data: BidFormOutput) => bidMutation.mutate(data))}
            >
              {bidMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
              Submit bid
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setOpen(false)}>Cancel</Button>
          </div>
          {bidMutation.isError && (
            <p className="text-xs text-red-600">Failed to place bid. Please try again.</p>
          )}
        </div>
      )}
    </Card>
  );
}

export default function DealerInstantOffersPage() {
  const token = useAuthStore((s) => s.accessToken) ?? "";
  const [cityFilter, setCityFilter] = useState("All");
  const [makeFilter, setMakeFilter] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["io-pool", cityFilter, makeFilter],
    queryFn: () =>
      instantOffersService.openPool(token, {
        city: cityFilter !== "All" ? cityFilter : undefined,
        make: makeFilter || undefined,
        status: "open",
      }),
    enabled: !!token,
  });

  const requests = data?.rows ?? [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-2xl font-semibold">Instant offer pool</h1>
          <p className="mt-1 text-sm text-neutral-500">
            Browse open requests and place competitive bids.
          </p>
        </div>
        <Link href="/dealer/instant-offers/bids">
          <Button variant="secondary" size="sm">My bids</Button>
        </Link>
      </div>

      {/* Filters */}
      <Card className="flex flex-wrap gap-3">
        <Input
          placeholder="Filter by make…"
          className="w-40"
          value={makeFilter}
          onChange={(e) => setMakeFilter(e.target.value)}
        />
        <div className="flex flex-wrap gap-1.5">
          {CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c)}
              className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                cityFilter === c
                  ? "bg-blue-600 text-white"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-2 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading pool…
        </div>
      )}

      {isError && (
        <Card className="text-center py-8 text-red-600">Failed to load pool.</Card>
      )}

      {!isLoading && requests.length === 0 && (
        <Card className="text-center py-10 space-y-2">
          <Car className="h-10 w-10 mx-auto text-neutral-300" />
          <p className="font-medium text-neutral-700">No open requests</p>
          <p className="text-xs text-neutral-400">Check back later or adjust your filters.</p>
        </Card>
      )}

      <div className="space-y-4">
        {requests.map((req) => (
          <RequestCard key={req.request_uid} req={req} token={token} />
        ))}
      </div>
    </div>
  );
}
