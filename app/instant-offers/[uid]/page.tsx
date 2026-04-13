"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useState } from "react";
import { instantOffersService } from "@/services/instant-offers.service";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatCurrencyQAR } from "@/lib/utils";
import type { OfferMessage } from "@/types/api";

function MessageBubble({ msg, myId }: { msg: OfferMessage; myId: string }) {
  const isMine = msg.sender_id === myId;
  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
          isMine ? "bg-blue-600 text-white" : "bg-neutral-100 text-neutral-800"
        }`}
      >
        <p>{msg.body}</p>
        <p className={`text-xs mt-1 ${isMine ? "text-blue-200" : "text-neutral-400"}`}>
          {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
        </p>
      </div>
    </div>
  );
}

export default function RequestDetailPage() {
  const { uid } = useParams<{ uid: string }>();
  const token = useAuthStore((s) => s.accessToken) ?? "";
  const userId = useAuthStore((s) => s.user?.id) ?? "";
  const qc = useQueryClient();
  const [body, setBody] = useState("");

  const requestQuery = useQuery({
    queryKey: ["io-request", uid],
    queryFn: () => instantOffersService.getRequest(uid, token),
    enabled: !!token && !!uid,
  });

  const messagesQuery = useQuery({
    queryKey: ["io-messages", uid],
    queryFn: () => instantOffersService.listMessages(uid, token),
    refetchInterval: 5000,
    enabled: !!token && !!uid,
  });

  const sendMutation = useMutation({
    mutationFn: (text: string) => instantOffersService.sendMessage(uid, { body: text }, token),
    onSuccess: () => {
      setBody("");
      qc.invalidateQueries({ queryKey: ["io-messages", uid] });
    },
  });

  const req = requestQuery.data;
  const messages = messagesQuery.data?.rows ?? [];

  return (
    <div className="max-w-2xl mx-auto flex flex-col h-[calc(100dvh-8rem)] gap-4">
      {/* Back + header */}
      <div className="flex items-center gap-3 shrink-0">
        <Link href="/instant-offers/my-requests">
          <Button variant="secondary" size="sm" className="gap-1">
            <ArrowLeft className="h-3.5 w-3.5" /> Back
          </Button>
        </Link>
        {req && (
          <div>
            <p className="font-semibold">{req.year} {req.make} {req.model ?? ""}</p>
            <p className="text-xs text-neutral-500">
              {req.km.toLocaleString()} km · {req.city}
              {req.asking_price_qar ? ` · Asking ${formatCurrencyQAR(req.asking_price_qar)}` : ""}
            </p>
          </div>
        )}
        {requestQuery.isLoading && <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />}
      </div>

      {/* Bids summary */}
      {req?.bids && req.bids.length > 0 && (
        <Card className="shrink-0">
          <p className="text-xs font-medium text-neutral-500 mb-2">{req.bids.length} bid{req.bids.length !== 1 ? "s" : ""}</p>
          <div className="flex flex-wrap gap-2">
            {req.bids.map((b) => (
              <div key={b.bid_uid} className="text-sm font-semibold bg-neutral-50 border border-neutral-100 rounded-lg px-3 py-1.5">
                {formatCurrencyQAR(b.amount_qar)}
                <span className="text-xs font-normal text-neutral-400 ml-1">({b.status})</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 min-h-0">
        {messagesQuery.isLoading && (
          <div className="flex items-center justify-center py-8 text-neutral-400 gap-2">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading messages…
          </div>
        )}
        {!messagesQuery.isLoading && messages.length === 0 && (
          <div className="text-center py-8 text-neutral-400 text-sm">
            No messages yet. Start the conversation with the dealer.
          </div>
        )}
        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} myId={userId} />
        ))}
      </div>

      {/* Composer */}
      <div className="flex gap-2 shrink-0 border-t border-neutral-100 pt-3">
        <Input
          placeholder="Type a message…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && body.trim()) { e.preventDefault(); sendMutation.mutate(body.trim()); }}}
          disabled={sendMutation.isPending}
        />
        <Button
          disabled={!body.trim() || sendMutation.isPending}
          onClick={() => sendMutation.mutate(body.trim())}
          className="shrink-0 gap-1"
        >
          {sendMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}
