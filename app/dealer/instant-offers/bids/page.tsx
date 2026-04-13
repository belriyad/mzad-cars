"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronRight, Edit2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { instantOffersService } from "@/services/instant-offers.service";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrencyQAR } from "@/lib/utils";
import type { OfferBid } from "@/types/api";

const STATUS_COLOR: Record<string, string> = {
  pending:   "bg-blue-100 text-blue-700",
  accepted:  "bg-emerald-100 text-emerald-700",
  rejected:  "bg-neutral-100 text-neutral-500",
  withdrawn: "bg-neutral-100 text-neutral-500",
  expired:   "bg-red-100 text-red-600",
};

const updateSchema = z.object({
  amount_qar: z.coerce.number().min(1, "Required"),
  message:    z.string().optional(),
});
type UpdateInput  = z.input<typeof updateSchema>;
type UpdateOutput = z.output<typeof updateSchema>;

function BidRow({ bid }: { bid: OfferBid }) {
  const token = useAuthStore((s) => s.accessToken) ?? "";
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  const form = useForm<UpdateInput, unknown, UpdateOutput>({
    resolver: zodResolver(updateSchema),
    defaultValues: { amount_qar: String(bid.amount_qar) as unknown as number, message: bid.message ?? undefined },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateOutput) =>
      instantOffersService.updateBid(bid.bid_uid, { amount_qar: data.amount_qar, message: data.message }, token),
    onSuccess: () => { setEditing(false); qc.invalidateQueries({ queryKey: ["my-bids"] }); },
  });

  const withdrawMutation = useMutation({
    mutationFn: () => instantOffersService.withdrawBid(bid.bid_uid, token),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["my-bids"] }),
  });

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <p className="text-xl font-bold">{formatCurrencyQAR(bid.amount_qar)}</p>
          {bid.message && <p className="text-sm text-neutral-500">{bid.message}</p>}
          {bid.expires_at && (
            <p className="text-xs text-neutral-400">
              Expires {new Date(bid.expires_at).toLocaleDateString()}
            </p>
          )}
        </div>
        <Badge className={`text-xs shrink-0 ${STATUS_COLOR[bid.status] ?? "bg-neutral-100 text-neutral-500"}`}>
          {bid.status}
        </Badge>
      </div>

      {bid.status === "pending" && (
        <div className="flex gap-2 flex-wrap border-t border-neutral-100 pt-2">
          <Button
            size="sm"
            variant="secondary"
            className="gap-1 text-xs"
            onClick={() => setEditing(!editing)}
          >
            <Edit2 className="h-3.5 w-3.5" /> Edit
          </Button>
          <Button
            size="sm"
            variant="secondary"
            className="gap-1 text-xs text-red-600"
            disabled={withdrawMutation.isPending}
            onClick={() => withdrawMutation.mutate()}
          >
            <X className="h-3.5 w-3.5" />
            {withdrawMutation.isPending ? "Withdrawing…" : "Withdraw"}
          </Button>
          <Link href={`/instant-offers/${bid.bid_uid}`}>
            <Button size="sm" variant="secondary" className="gap-1 text-xs">
              <ChevronRight className="h-3.5 w-3.5" /> View request
            </Button>
          </Link>
        </div>
      )}

      {editing && (
        <div className="border-t border-neutral-100 pt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">New amount (QAR) *</label>
              <Input type="number" {...form.register("amount_qar")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Message</label>
              <Input {...form.register("message")} />
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              disabled={updateMutation.isPending}
              onClick={form.handleSubmit((data: UpdateOutput) => updateMutation.mutate(data))}
            >
              {updateMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Update"}
            </Button>
            <Button size="sm" variant="secondary" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

export default function DealerMyBidsPage() {
  const token = useAuthStore((s) => s.accessToken) ?? "";
  const [statusFilter, setStatusFilter] = useState("all");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["my-bids", statusFilter],
    queryFn: () =>
      instantOffersService.myBids(token, statusFilter !== "all" ? { status: statusFilter } : {}),
    enabled: !!token,
  });

  const bids = data?.rows ?? [];

  const STATUS_TABS = ["all", "pending", "accepted", "rejected", "withdrawn", "expired"];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold">My bids</h1>
        <p className="mt-1 text-sm text-neutral-500">Track, update and withdraw your bids on seller requests.</p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5">
        {STATUS_TABS.map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`rounded-full px-3 py-1 text-xs font-medium capitalize transition-colors ${
              statusFilter === s
                ? "bg-blue-600 text-white"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-12 gap-2 text-neutral-500">
          <Loader2 className="h-5 w-5 animate-spin" /> Loading bids…
        </div>
      )}
      {isError && <Card className="text-center py-8 text-red-600">Failed to load bids.</Card>}

      {!isLoading && bids.length === 0 && (
        <Card className="text-center py-10 space-y-2">
          <p className="font-medium text-neutral-700">No bids found</p>
          <Link href="/dealer/instant-offers">
            <Button size="sm">Browse open requests</Button>
          </Link>
        </Card>
      )}

      <div className="space-y-4">
        {bids.map((bid) => <BidRow key={bid.bid_uid} bid={bid} />)}
      </div>
    </div>
  );
}
