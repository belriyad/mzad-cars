"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Lock, ChevronDown, Zap, ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CAR_CATALOGUE, BODY_TYPES, CITIES_QA, YEARS, KM_RANGES, getModels, getTrims } from "@/lib/car-data";
import { instantOffersService } from "@/services/instant-offers.service";
import { formatCurrencyQAR } from "@/lib/utils";

const SELECT_CLS =
  "w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

const DARK_SELECT_CLS =
  "w-full appearance-none rounded-xl border border-white/20 bg-white/10 px-3 py-2.5 pr-8 text-sm text-white focus:border-white/40 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed [&>option]:bg-neutral-900 [&>option]:text-white";

interface FormState {
  make: string;
  model: string;
  trim: string;
  year: string;
  km_range: string;
  body_type: string;
  city: string;
}

const EMPTY: FormState = {
  make: "", model: "", trim: "", year: "", km_range: "", body_type: "", city: "",
};

function SelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
    </div>
  );
}

function DarkSelectWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {children}
      <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" />
    </div>
  );
}

export function InstantOfferWidget() {
  const token = useAuthStore((s) => s.accessToken);
  const isLoggedIn = !!token;

  const [form, setForm] = useState<FormState>(EMPTY);
  const [submitted, setSubmitted] = useState(false);

  const models = getModels(form.make);
  const trims  = getTrims(form.make, form.model);

  // Parse km_range value into a rough midpoint for the comps query
  const kmMid = form.km_range
    ? (() => {
        const [lo, hi] = form.km_range.split("-").map(Number);
        if (!isNaN(lo) && !isNaN(hi)) return Math.round((lo + hi) / 2);
        // "150000+" style
        const single = Number(form.km_range.replace(/\D/g, ""));
        return isNaN(single) ? 50000 : single + 25000;
      })()
    : 50000;

  // Real market comps — enabled once make + year are selected
  const compsQuery = useQuery({
    queryKey: ["widget-comps", form.make, form.model, form.year],
    queryFn: () =>
      instantOffersService.comps({
        make: form.make,
        class_name: form.body_type || "SUV",
        year: Number(form.year),
        km: kmMid,
        model: form.model || undefined,
      }),
    enabled: !!(form.make && form.year),
    staleTime: 5 * 60_000,
  });

  const comps = compsQuery.data;

  function set(field: keyof FormState, value: string) {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // cascade resets
      if (field === "make")  { next.model = ""; next.trim = ""; }
      if (field === "model") { next.trim = ""; }
      return next;
    });
  }

  const isComplete = form.make && form.year && form.km_range && form.city;

  // ── Success state ──────────────────────────────────────────────────────────
  if (submitted && !isLoggedIn) {
    return (
      <Card className="flex h-full flex-col overflow-hidden p-0">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 px-5 pt-5 pb-4 text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400">Instant Offer</span>
          </div>
          <h3 className="mt-1.5 text-xl font-bold">Your request is ready!</h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <div>
            <p className="font-semibold text-neutral-900">Almost there</p>
            <p className="mt-1 text-sm text-neutral-500">
              Create a free account to submit your request and let verified Qatar dealers bid on your car.
            </p>
          </div>
          <div className="flex flex-col gap-2 w-full">
            <Link href={`/register?next=/instant-offers/sell`}>
              <Button className="w-full gap-2">
                Sign up — it's free <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" className="w-full text-sm">Already have an account? Log in</Button>
            </Link>
          </div>
          <button onClick={() => setSubmitted(false)} className="text-xs text-neutral-400 underline">
            Edit car details
          </button>
        </div>
      </Card>
    );
  }

  if (submitted && isLoggedIn) {
    // logged-in: redirect them to the full flow with pre-filled data
    return (
      <Card className="flex h-full flex-col overflow-hidden p-0">
        <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 px-5 pt-5 pb-4 text-white">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-400" />
            <span className="text-xs font-medium uppercase tracking-widest text-amber-400">Instant Offer</span>
          </div>
          <h3 className="mt-1.5 text-xl font-bold">Ready to submit!</h3>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
          <div>
            <p className="font-semibold text-neutral-900">{form.year} {form.make} {form.model}</p>
            <p className="text-sm text-neutral-500">Dealers will see your request and compete with best offers.</p>
          </div>
          <Link
            href={`/instant-offers/sell?make=${encodeURIComponent(form.make)}&model=${encodeURIComponent(form.model)}&year=${form.year}&city=${encodeURIComponent(form.city)}`}
            className="w-full"
          >
            <Button className="w-full gap-2">
              Complete request <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
          <button onClick={() => setSubmitted(false)} className="text-xs text-neutral-400 underline">
            Edit details
          </button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="flex h-full flex-col space-y-0 overflow-hidden p-0">
      {/* dark header */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 px-5 pt-5 pb-4 text-white">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium uppercase tracking-widest text-amber-400">
            Instant Offer
          </span>
        </div>
        <h3 className="mt-1.5 text-xl font-bold">Get dealer bids on your car</h3>
        <p className="mt-0.5 text-xs text-neutral-400">
          Select your car — verified Qatar dealers will compete with their best price
        </p>

        {/* Make + Model in dark header */}
        <div className="mt-4 space-y-2">
          <DarkSelectWrapper>
            <select
              value={form.make}
              onChange={(e) => set("make", e.target.value)}
              className={DARK_SELECT_CLS}
            >
              <option value="">Select make…</option>
              {CAR_CATALOGUE.map((m) => (
                <option key={m.name} value={m.name}>{m.name}</option>
              ))}
            </select>
          </DarkSelectWrapper>

          <DarkSelectWrapper>
            <select
              value={form.model}
              onChange={(e) => set("model", e.target.value)}
              disabled={!form.make}
              className={DARK_SELECT_CLS}
            >
              <option value="">{!form.make ? "Select make first…" : "Select model…"}</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </DarkSelectWrapper>

          {trims.length > 0 && (
            <DarkSelectWrapper>
              <select
                value={form.trim}
                onChange={(e) => set("trim", e.target.value)}
                disabled={!form.model}
                className={DARK_SELECT_CLS}
              >
                <option value="">Select trim (optional)…</option>
                {trims.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </DarkSelectWrapper>
          )}
        </div>
      </div>

      {/* light body */}
      <div className="flex flex-1 flex-col gap-3 p-5">
        {/* Year */}
        <SelectWrapper>
          <select
            value={form.year}
            onChange={(e) => set("year", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Year…</option>
            {YEARS.map((y) => <option key={y} value={String(y)}>{y}</option>)}
          </select>
        </SelectWrapper>

        {/* KM range */}
        <SelectWrapper>
          <select
            value={form.km_range}
            onChange={(e) => set("km_range", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Mileage range…</option>
            {KM_RANGES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </SelectWrapper>

        {/* Body type */}
        <SelectWrapper>
          <select
            value={form.body_type}
            onChange={(e) => set("body_type", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">Body type (optional)…</option>
            {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </SelectWrapper>

        {/* City */}
        <SelectWrapper>
          <select
            value={form.city}
            onChange={(e) => set("city", e.target.value)}
            className={SELECT_CLS}
          >
            <option value="">City…</option>
            {CITIES_QA.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </SelectWrapper>

        {/* Pricing teaser — shows real market data from /instant-offers/comps */}
        {form.make && form.year && (
          <div className="relative rounded-xl border border-neutral-100 bg-neutral-50 p-3 overflow-hidden">
            {compsQuery.isLoading ? (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-neutral-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Fetching market data…
              </div>
            ) : comps && comps.count > 0 ? (
              <>
                {/* blurred when guest */}
                <div className={`space-y-1 ${!isLoggedIn ? "blur-sm select-none pointer-events-none" : ""}`}>
                  <p className="text-xs text-neutral-500">
                    Market range · {form.year} {form.make} {form.model || ""} · {comps.count} listings
                  </p>
                  <p className="text-xl font-bold text-neutral-900">
                    {comps.p25 != null ? formatCurrencyQAR(comps.p25) : "—"}
                    {" – "}
                    {comps.p75 != null ? formatCurrencyQAR(comps.p75) : "—"}
                  </p>
                  {comps.median != null && (
                    <p className="text-xs text-neutral-500">
                      Median: <span className="font-semibold text-neutral-700">{formatCurrencyQAR(comps.median)}</span>
                    </p>
                  )}
                  <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-200">
                    <div className="h-full w-3/5 rounded-full bg-emerald-400" />
                  </div>
                </div>
                {/* lock overlay for guests */}
                {!isLoggedIn && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-white/70 backdrop-blur-[2px] rounded-xl">
                    <Lock className="h-5 w-5 text-neutral-600" />
                    <p className="text-xs font-semibold text-neutral-800">Sign up to see pricing</p>
                    <Link href="/register">
                      <span className="text-xs text-blue-600 underline font-medium">Create free account</span>
                    </Link>
                  </div>
                )}
              </>
            ) : compsQuery.isFetched ? (
              <p className="text-xs text-neutral-400 text-center py-1">
                No comparable listings found — select a model to narrow results.
              </p>
            ) : null}
          </div>
        )}

        {/* CTA */}
        <Button
          className="w-full gap-2"
          disabled={!isComplete}
          onClick={() => setSubmitted(true)}
        >
          <Zap className="h-4 w-4" />
          {isLoggedIn ? "Get dealer offers" : "Check my car value"}
        </Button>

        <p className="text-center text-[11px] text-neutral-400">
          Free • No obligation • Verified dealers only
        </p>
      </div>
    </Card>
  );
}
