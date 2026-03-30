"use client";

import { useEffect, useState } from "react";
import { Building2, Globe, Loader2, MapPin, Phone, Save, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { profileService } from "@/services/profile.service";
import { useQuery, useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

const CITIES = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

export default function DealerProfilePage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user  = useAuthStore((s) => s.user);

  const [fullName, setFullName] = useState("");
  const [city, setCity]         = useState("Doha");

  const profile = useQuery({
    queryKey: ["me-profile"],
    queryFn:  () => profileService.getProfile(token),
    enabled:  !!token,
  });

  useEffect(() => {
    if (profile.data) {
      setFullName(profile.data.full_name ?? user?.full_name ?? "");
      setCity(profile.data.city ?? "Doha");
    }
  }, [profile.data, user]);

  const save = useMutation({
    mutationFn: () => profileService.updateProfile({ full_name: fullName, city }, token),
    onSuccess: () => {
      toast.success("Dealer profile saved");
      profile.refetch();
    },
    onError: () => toast.error("Failed to save profile"),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Dealer profile</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          This information appears on your public showroom page visible to buyers.
        </p>
      </div>

      {/* preview badge */}
      <Card className="flex items-center gap-4 bg-neutral-50">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-neutral-200 text-2xl font-bold text-neutral-600">
          {(fullName || user?.full_name || "S")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-neutral-900 truncate">{fullName || user?.full_name || "Showroom name"}</p>
          <p className="flex items-center gap-1 text-xs text-neutral-500">
            <MapPin className="h-3.5 w-3.5" /> {city}
          </p>
        </div>
        <Badge className="bg-amber-100 text-amber-700 shrink-0">
          <Star className="mr-1 h-3 w-3" /> Verified dealer
        </Badge>
      </Card>

      {/* form */}
      <Card className="space-y-4">
        <h2 className="font-semibold text-neutral-800 flex items-center gap-2">
          <Building2 className="h-4 w-4" /> Showroom details
        </h2>

        {profile.isLoading ? (
          <div className="h-16 animate-pulse rounded-xl bg-neutral-100" />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <label className="text-xs font-medium text-neutral-500">Display name</label>
              <Input
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Al Rayyan Motors"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> City / branch
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300"
              >
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" /> Phone
              </label>
              <Input value={user?.email ?? ""} disabled placeholder="From your account" />
              <p className="text-xs text-neutral-400">Phone is linked to your account — update in profile settings.</p>
            </div>
          </div>
        )}

        <Button
          className="gap-2"
          disabled={save.isPending || profile.isLoading}
          onClick={() => save.mutate()}
        >
          {save.isPending
            ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</>
            : <><Save className="h-4 w-4" /> Save profile</>}
        </Button>
        {save.isError && (
          <p className="text-sm text-red-600">Failed to save. Please try again.</p>
        )}
      </Card>

      <p className="text-xs text-neutral-400">
        Buyers will see your display name and city on every listing you publish.
      </p>
    </div>
  );
}
