"use client";

import { useState } from "react";
import { Bell, BellOff, Plus, Loader2, Lock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { alertsService } from "@/services/alerts.service";
import { useAuthStore } from "@/store/auth-store";
import type { AlertCreate } from "@/types/domain";

const MAKES = ["Toyota", "Nissan", "Hyundai", "Kia", "BMW", "Mercedes", "Land Rover", "Lexus", "Mitsubishi", "Honda", "Ford", "Chevrolet"];
const CITIES = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

interface AlertRow {
  id: number;
  make?: string;
  city?: string;
  min_price_qar?: number;
  max_price_qar?: number;
  min_year?: number;
  max_year?: number;
  deals_only?: boolean;
  active?: boolean;
}

export default function AlertsPage() {
  const token   = useAuthStore((s) => s.accessToken);
  const user    = useAuthStore((s) => s.user);
  const userKey = user?.email ?? user?.id ?? "";
  const qc = useQueryClient();

  const [showForm, setShowForm] = useState(false);
  const [make, setMake]           = useState("");
  const [city, setCity]           = useState("");
  const [maxPrice, setMaxPrice]   = useState("");
  const [minYear, setMinYear]     = useState("");
  const [maxYear, setMaxYear]     = useState("");
  const [dealsOnly, setDealsOnly] = useState(false);

  const query = useQuery({
    queryKey: ["alerts", userKey],
    queryFn: () => alertsService.list(userKey),
    enabled: !!userKey,
  });

  const create = useMutation({
    mutationFn: (body: AlertCreate) => alertsService.create(body),
    onSuccess: () => {
      toast.success("Alert created");
      qc.invalidateQueries({ queryKey: ["alerts", userKey] });
      setShowForm(false);
      setMake(""); setCity(""); setMaxPrice(""); setMinYear(""); setMaxYear(""); setDealsOnly(false);
    },
    onError: () => toast.error("Failed to create alert"),
  });

  const toggle = useMutation({
    mutationFn: ({ alert_id, active }: { alert_id: number; active: boolean }) =>
      alertsService.setActive(alert_id, active),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["alerts", userKey] }),
    onError: () => toast.error("Failed to update alert"),
  });

  const handleSave = () => {
    if (!userKey) return;
    const body: AlertCreate = {
      user_key: userKey,
      ...(make ? { make } : {}),
      ...(city ? { city } : {}),
      ...(maxPrice ? { max_price_qar: Number(maxPrice) } : {}),
      ...(minYear ? { min_year: Number(minYear) } : {}),
      ...(maxYear ? { max_year: Number(maxYear) } : {}),
      deals_only: dealsOnly,
    };
    create.mutate(body);
  };

  if (!token || !user) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold">Price alerts</h1>
          <p className="mt-0.5 text-sm text-neutral-500">Get notified the moment the right car is listed.</p>
        </div>
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <Lock className="h-10 w-10 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Sign in to create alerts</p>
          <p className="max-w-xs text-sm text-neutral-400">
            Free with any account — get notified instantly when a matching car is listed.
          </p>
          <div className="flex gap-2">
            <Link href="/login"><Button>Sign in</Button></Link>
            <Link href="/register"><Button variant="secondary">Create account</Button></Link>
          </div>
        </Card>
      </div>
    );
  }

  const alerts: AlertRow[] = (query.data?.rows ?? []) as unknown as AlertRow[];

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Price alerts</h1>
          <p className="mt-0.5 text-sm text-neutral-500">We notify you the moment a car matching your criteria is listed.</p>
        </div>
        <Button onClick={() => setShowForm((v) => !v)} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> New alert
        </Button>
      </div>

      {showForm && (
        <Card className="space-y-4">
          <h2 className="font-semibold text-neutral-800">Create a new alert</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Make</label>
              <select value={make} onChange={(e) => setMake(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm">
                <option value="">Any make</option>
                {MAKES.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Max price (QAR)</label>
              <Input type="number" placeholder="e.g. 80,000" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">City</label>
              <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-xl border border-neutral-200 bg-white px-3 py-2.5 text-sm">
                <option value="">Any city</option>
                {CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Year range</label>
              <div className="flex gap-2">
                <Input type="number" placeholder="From" value={minYear} onChange={(e) => setMinYear(e.target.value)} />
                <Input type="number" placeholder="To" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} />
              </div>
            </div>
          </div>
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input type="checkbox" checked={dealsOnly} onChange={(e) => setDealsOnly(e.target.checked)} className="accent-neutral-800" />
            Deals only (below-market cars)
          </label>
          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={create.isPending} className="gap-2">
              {create.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
              Save alert
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
          </div>
        </Card>
      )}

      {query.isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-16 animate-pulse rounded-2xl bg-neutral-100" />
          ))}
        </div>
      ) : alerts.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-12 text-center">
          <BellOff className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">No alerts yet</p>
          <p className="max-w-xs text-sm text-neutral-400">
            Create an alert and get notified the moment the right car is listed.
          </p>
          <Button onClick={() => setShowForm(true)} className="mt-2 gap-2">
            <Plus className="h-4 w-4" /> Create your first alert
          </Button>
        </Card>
      ) : (
        <div className="space-y-2">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-neutral-400">
            Active alerts ({alerts.length})
          </h2>
          {alerts.map((a) => (
            <Card key={a.id} className="flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {a.make ?? "All makes"}
                  {a.max_price_qar ? ` · max ${a.max_price_qar.toLocaleString()} QAR` : ""}
                </p>
                <p className="text-xs text-neutral-500">
                  {[
                    a.city,
                    a.min_year && a.max_year ? `${a.min_year}–${a.max_year}` : a.min_year ? `From ${a.min_year}` : null,
                    a.deals_only ? "Deals only" : null,
                  ].filter(Boolean).join(" · ") || "Any criteria"}
                </p>
              </div>
              <button
                onClick={() => toggle.mutate({ alert_id: a.id, active: !(a.active !== false) })}
                title={a.active !== false ? "Disable" : "Enable"}
                className={`relative inline-flex h-5 w-9 shrink-0 rounded-full transition-colors ${a.active !== false ? "bg-neutral-900" : "bg-neutral-200"}`}
              >
                <span className={`inline-block h-4 w-4 translate-y-0.5 rounded-full bg-white shadow transition-transform ${a.active !== false ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </Card>
          ))}
        </div>
      )}

      <p className="text-xs text-neutral-400">
        Alerts are delivered via push notification and, if configured, WhatsApp.
      </p>
    </div>
  );
}
