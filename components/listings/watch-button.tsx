"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Bell, X, Check } from "lucide-react";
import { alertsService } from "@/services/alerts.service";
import { channelsService } from "@/services/channels.service";
import { useAuthStore } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import type { Listing } from "@/types/domain";

interface WatchButtonProps {
  listing?: Listing;
}

export function WatchButton({ listing }: WatchButtonProps) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.accessToken);

  const [open, setOpen] = useState(false);
  const [whatsapp, setWhatsapp] = useState("");
  const [done, setDone] = useState(false);

  const userKey = user?.email ?? user?.id ?? "";
  const isGuest = !token || !userKey;

  const alertMutation = useMutation({
    mutationFn: async () => {
      if (whatsapp) {
        await channelsService.upsert({
          user_key: userKey,
          whatsapp_number: whatsapp.replace(/\D/g, ""),
          whatsapp_enabled: true,
        });
      }
      await alertsService.create({
        user_key: userKey,
        make: listing?.make,
        class_name: listing?.class_name,
        model: listing?.model,
        min_year: listing?.manufacture_year
          ? listing.manufacture_year - 1
          : undefined,
        max_year: listing?.manufacture_year
          ? listing.manufacture_year + 1
          : undefined,
        max_price_qar: listing?.price_qar
          ? Math.ceil(listing.price_qar * 1.1)
          : undefined,
      });
    },
    onSuccess: () => setDone(true),
  });

  if (isGuest) {
    return (
      <a href="/register">
        <Button variant="secondary" className="gap-2 w-full">
          <Bell className="h-4 w-4" />
          Sign up to get alerts
        </Button>
      </a>
    );
  }

  if (done) {
    return (
      <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
        <Check className="h-4 w-4 shrink-0" />
        Alert saved. We&apos;ll notify you on WhatsApp when a match appears.
      </div>
    );
  }

  return (
    <>
      <Button variant="secondary" className="gap-2 w-full" onClick={() => setOpen(true)}>
        <Bell className="h-4 w-4" />
        Watch for similar cars
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4 pb-4 sm:pb-0">
          <Card className="w-full max-w-sm space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-semibold">Set price alert</h2>
                <p className="text-xs text-neutral-500">
                  We&apos;ll message you when a similar listing appears.
                </p>
              </div>
              <button onClick={() => setOpen(false)} className="text-neutral-400 hover:text-neutral-700">
                <X className="h-4 w-4" />
              </button>
            </div>

            {listing && (
              <div className="rounded-xl bg-neutral-50 px-3 py-2 text-xs text-neutral-600 space-y-0.5">
                {listing.make && <p><span className="text-neutral-400">Make:</span> {listing.make}</p>}
                {listing.model && <p><span className="text-neutral-400">Model:</span> {listing.model}</p>}
                {listing.manufacture_year && (
                  <p><span className="text-neutral-400">Year:</span> ±1 of {listing.manufacture_year}</p>
                )}
                {listing.price_qar && (
                  <p><span className="text-neutral-400">Max price:</span> QAR {Math.ceil(listing.price_qar * 1.1).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-700">
                WhatsApp number (for alerts)
              </label>
              <Input
                type="tel"
                placeholder="+974 3XXX XXXX"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
              />
            </div>

            {alertMutation.isError && (
              <p className="text-xs text-red-500">Something went wrong. Please try again.</p>
            )}

            <div className="flex gap-2">
              <Button variant="secondary" className="flex-1" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button
                className="flex-1"
                onClick={() => alertMutation.mutate()}
                disabled={alertMutation.isPending}
              >
                {alertMutation.isPending ? "Saving…" : "Save alert"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}
