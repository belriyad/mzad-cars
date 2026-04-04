"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import {
  ArrowRight,
  BarChart2,
  ChevronDown,
  Gauge,
  RefreshCw,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { valuationService } from "@/services/valuation.service";
import { listingsService } from "@/services/listings.service";
import { formatCurrencyQAR } from "@/lib/utils";

const schema = z.object({
  make:  z.string().min(1, "Required"),
  model: z.string().optional(),
  year:  z.coerce.number().min(1990).max(2030),
  km:    z.coerce.number().min(0),
});

type FormValues = z.infer<typeof schema>;

/** Never renders QAR NaN — returns null if the value is missing/invalid */
function safeQAR(value: number | null | undefined): string | null {
  if (value == null || !isFinite(value) || value <= 0) return null;
  return formatCurrencyQAR(Math.round(value));
}

// ── Gauge bar ──────────────────────────────────────────────────────────────────────────────
function ValueGauge({
  low, fair, high, confidence,
}: {
  low: number; fair: number; high: number; confidence?: number;
}) {
  const range = high - low;
  const validRange = isFinite(range) && range > 0;
  const fairPct = validRange
    ? Math.min(100, Math.max(0, ((fair - low) / range) * 100))
    : 50;

  return (
    <div className="space-y-2">
      <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200">
        <div
          className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-neutral-800 shadow"
          style={{ left: `calc(${fairPct}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>Low {safeQAR(low) ?? "—"}</span>
        <span className="font-medium text-neutral-600">Fair {safeQAR(fair) ?? "—"}</span>
        <span>High {safeQAR(high) ?? "—"}</span>
      </div>
      {confidence != null && isFinite(confidence) && confidence > 0 && (
        <div className="flex items-center gap-2 pt-0.5">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-emerald-400 transition-all duration-700"
              style={{ width: `${Math.round(confidence * 100)}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400">
            {Math.round(confidence * 100)}% confidence
          </span>
        </div>
      )}
    </div>
  );
}

// ── Widget ───────────────────────────────────────────────────────────────────────────────────
const SELECT_CLS =
  "w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none disabled:opacity-40 disabled:cursor-not-allowed";

export function CarWorthWidget() {
  const [submitted, setSubmitted] = useState(false);

  // global filter options (makes only)
  const filterQuery = useQuery({
    queryKey: ["listing-filter-options"],
    queryFn: () => listingsService.list({ limit: 1 }),
    staleTime: 60 * 60_000,
  });
  const makes = filterQuery.data?.makes ?? [];

  const form = useForm<FormValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(schema) as any,
    defaultValues: { make: "", model: "", year: 2021, km: 50_000 },
  });

  // watch the make field so model dropdown updates reactively
  const selectedMake = useWatch({ control: form.control, name: "make" });

  // models derived from actual rows for this make — backend models[] is global, not filtered
  const modelsQuery = useQuery({
    queryKey: ["models-for-make", selectedMake],
    queryFn: () => listingsService.list({ make: selectedMake, limit: 500 }),
    staleTime: 30 * 60_000,
    enabled: !!selectedMake,
  });
  const models = Array.from(
    new Set(
      (modelsQuery.data?.rows ?? [])
        .map((r) => (r.model ?? "").trim())
        .filter(Boolean)
    )
  ).sort();

  const mutation = useMutation({
    mutationFn: valuationService.estimate,
    onSuccess: () => setSubmitted(true),
  });

  // when make changes, clear the model field
  const handleMakeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    form.setValue("make", e.target.value);
    form.setValue("model", "");
  };

  const watchValues  = form.watch();
  const result       = mutation.data;

  // safe result values — guard against NaN / null / 0 from the API
  const fairVal  = result && isFinite(result.fair)  && result.fair  > 0 ? result.fair  : null;
  const lowVal   = result && isFinite(result.low)   && result.low   > 0 ? result.low   : null;
  const highVal  = result && isFinite(result.high)  && result.high  > 0 ? result.high  : null;
  const hasValidResult = fairVal !== null;

  return (
    <Card className="flex h-full flex-col space-y-0 overflow-hidden p-0">
      {/* dark header */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 px-5 pt-5 pb-4 text-white">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium uppercase tracking-widest text-amber-400">
            Instant Valuation
          </span>
        </div>
        <h3 className="mt-1.5 text-xl font-bold">What is your car worth?</h3>
        <p className="mt-0.5 text-xs text-neutral-400">
          Based on 10,000+ live listings in Qatar — updated daily
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">

        {/* ── RESULT PANEL ── */}
        {result && submitted ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            {hasValidResult ? (
              <>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-neutral-500">Market value for your car</p>
                    <p className="text-3xl font-extrabold tracking-tight text-neutral-900">
                      {safeQAR(fairVal)}
                    </p>
                  </div>
                  <div className="flex flex-col items-center rounded-2xl bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700">
                    <Sparkles className="mb-0.5 h-4 w-4" />
                    Fair price
                  </div>
                </div>

                {lowVal && highVal && (
                  <ValueGauge
                    low={lowVal}
                    fair={fairVal!}
                    high={highVal}
                    confidence={result.confidence}
                  />
                )}

                <div className="flex flex-wrap gap-2">
                  {lowVal && safeQAR(lowVal * 1.02) && (
                    <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                      <TrendingDown className="h-3 w-3" />
                      Sell fast: {safeQAR(lowVal * 1.02)}
                    </span>
                  )}
                  {highVal && safeQAR(highVal * 0.97) && (
                    <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                      <TrendingUp className="h-3 w-3" />
                      Max out: {safeQAR(highVal * 0.97)}
                    </span>
                  )}
                </div>
              </>
            ) : (
              /* no peers — friendly message instead of NaN */
              <div className="rounded-2xl bg-amber-50 px-4 py-5 text-center space-y-1">
                <p className="font-semibold text-amber-800">Not enough data yet</p>
                <p className="text-xs text-amber-700">
                  We don’t have enough comparable listings for this combination.
                  Try removing the model or adjusting the year.
                </p>
              </div>
            )}

            {/* CTA row */}
            <div className="flex gap-2 pt-1">
              <Link
                href={`/listings?make=${encodeURIComponent(watchValues.make)}&model=${encodeURIComponent(watchValues.model ?? "")}`}
                className="flex-1"
              >
                <Button size="sm" className="w-full" variant="default">
                  Browse similar <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Button>
              </Link>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => { setSubmitted(false); mutation.reset(); }}
              >
                <RefreshCw className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

        ) : (
          /* ── FORM ── */
          <form className="space-y-2.5" onSubmit={form.handleSubmit((v) => mutation.mutate(v))}>

            {/* 1. Make */}
            <div className="relative">
              <select
                {...form.register("make")}
                onChange={handleMakeChange}
                disabled={makes.length === 0}
                className={SELECT_CLS}
              >
                <option value="">{makes.length === 0 ? "Loading makes…" : "Select make…"}</option>
                {makes.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              {form.formState.errors.make && (
                <p className="mt-0.5 text-xs text-rose-500">{form.formState.errors.make.message}</p>
              )}
            </div>

            {/* 2. Model — filtered to selected make */}
            <div className="relative">
              {models.length > 0 ? (
                <>
                  <select {...form.register("model")} className={SELECT_CLS}>
                    <option value="">Any model</option>
                    {models.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </>
              ) : (
                <Input
                  placeholder={
                    !selectedMake          ? "Select a make first…"
                    : modelsQuery.isLoading ? "Loading models…"
                    :                        "Model (optional — broadens estimate)"
                  }
                  disabled={!selectedMake || modelsQuery.isLoading}
                  {...form.register("model")}
                />
              )}
            </div>

            {/* 3. Year + KM */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Input
                  type="number"
                  placeholder="Year"
                  {...form.register("year")}
                  className="text-center"
                />
                {form.formState.errors.year && (
                  <p className="mt-0.5 text-xs text-rose-500">1990–2030</p>
                )}
              </div>
              <div className="relative">
                <Gauge className="pointer-events-none absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <Input
                  type="number"
                  placeholder="Km driven"
                  {...form.register("km")}
                  className="pl-8"
                />
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={mutation.isPending} variant="premium">
              {mutation.isPending ? (
                <span className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin" /> Calculating…
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Sparkles className="h-4 w-4" /> Get instant valuation
                </span>
              )}
            </Button>

            {mutation.isError && (
              <p className="text-center text-xs text-rose-500">
                Could not estimate — check your inputs and try again.
              </p>
            )}
          </form>
        )}
      </div>
    </Card>
  );
}
