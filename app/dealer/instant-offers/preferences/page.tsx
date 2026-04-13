"use client";

import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Loader2, Save, Bell } from "lucide-react";
import { useEffect } from "react";
import { instantOffersService } from "@/services/instant-offers.service";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DealerPreferences } from "@/types/api";

const MAKES = ["Toyota", "Lexus", "Nissan", "Infiniti", "BMW", "Mercedes-Benz", "Audi", "Hyundai", "Kia", "Ford", "Chevrolet", "Land Rover"];
const CITIES_LIST = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

export default function DealerPreferencesPage() {
  const token = useAuthStore((s) => s.accessToken) ?? "";

  const { data, isLoading } = useQuery({
    queryKey: ["io-prefs"],
    queryFn: () => instantOffersService.getPreferences(token),
    enabled: !!token,
  });

  const form = useForm<DealerPreferences>({ defaultValues: data });

  // Populate form when data arrives
  useEffect(() => { if (data) form.reset(data); }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (prefs: DealerPreferences) => instantOffersService.savePreferences(prefs, token),
    onSuccess: (updated) => form.reset(updated),
  });

  const makes   = form.watch("makes")   ?? [];
  const cities  = form.watch("cities")  ?? [];

  function toggleMake(m: string) {
    const curr = form.getValues("makes") ?? [];
    form.setValue("makes", curr.includes(m) ? curr.filter((x) => x !== m) : [...curr, m]);
  }
  function toggleCity(c: string) {
    const curr = form.getValues("cities") ?? [];
    form.setValue("cities", curr.includes(c) ? curr.filter((x) => x !== c) : [...curr, c]);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 gap-2 text-neutral-500">
        <Loader2 className="h-5 w-5 animate-spin" /> Loading preferences…
      </div>
    );
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Bell className="h-6 w-6 text-blue-600" /> Instant Offer preferences
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Control which buyer requests you see and how you get notified.
        </p>
      </div>

      <Card className="space-y-5">
        {/* Makes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Makes you deal in</label>
          <div className="flex flex-wrap gap-1.5">
            {MAKES.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleMake(m)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  makes.includes(m)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-blue-300"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Cities */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Cities you cover</label>
          <div className="flex flex-wrap gap-1.5">
            {CITIES_LIST.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleCity(c)}
                className={`rounded-full px-3 py-1 text-xs font-medium border transition-colors ${
                  cities.includes(c)
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-neutral-50 text-neutral-600 border-neutral-200 hover:border-blue-300"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Year + KM range */}
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Min year</label>
            <Input type="number" placeholder="2010" {...form.register("min_year", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Max year</label>
            <Input type="number" placeholder="2026" {...form.register("max_year", { valueAsNumber: true })} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Max km</label>
            <Input type="number" placeholder="150000" {...form.register("max_km", { valueAsNumber: true })} />
          </div>
        </div>

        {/* Notifications */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notifications</label>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...form.register("notify_push")} className="rounded" />
              Push notifications
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...form.register("notify_whatsapp")} className="rounded" />
              WhatsApp notifications
            </label>
          </div>
        </div>

        {/* Active toggle */}
        <div className="flex items-center gap-3 border-t border-neutral-100 pt-4">
          <label className="text-sm font-medium cursor-pointer">
            <input type="checkbox" {...form.register("active")} className="rounded mr-2" />
            Active (receive new requests)
          </label>
        </div>

        <Button
          className="w-full gap-2"
          disabled={saveMutation.isPending}
          onClick={form.handleSubmit((data) => saveMutation.mutate(data))}
        >
          {saveMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {saveMutation.isPending ? "Saving…" : "Save preferences"}
        </Button>

        {saveMutation.isSuccess && (
          <p className="text-sm text-emerald-600 text-center">Preferences saved!</p>
        )}
        {saveMutation.isError && (
          <p className="text-sm text-red-600 text-center">Failed to save. Please try again.</p>
        )}
      </Card>
    </div>
  );
}
