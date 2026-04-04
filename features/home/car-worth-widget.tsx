"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
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
  make: z.string().min(1, "Required"),
  class_name: z.string().min(1, "Required"),
  model: z.string().optional(),
  year: z.coerce.number().min(1990).max(2030),
  km: z.coerce.number().min(0),
});

type FormValues = z.infer<typeof schema>;

// ── Animated number ──────────────────────────────────────────────────────────
function AnimatedPrice({ value, className }: { value: number; className?: string }) {
  return (
    <span className={className}>
      {formatCurrencyQAR(value)}
    </span>
  );
}

// ── Gauge bar ────────────────────────────────────────────────────────────────
function ValueGauge({ low, fair, high, confidence }: { low: number; fair: number; high: number; confidence?: number }) {
  const range = high - low;
  const fairPct = range > 0 ? ((fair - low) / range) * 100 : 50;

  return (
    <div className="space-y-2">
      {/* bar */}
      <div className="relative h-3 overflow-hidden rounded-full bg-gradient-to-r from-emerald-200 via-amber-200 to-rose-200">
        {/* fair value marker */}
        <div
          className="absolute top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-neutral-800 shadow"
          style={{ left: `calc(${fairPct}% - 2px)` }}
        />
      </div>
      <div className="flex justify-between text-[10px] text-neutral-400">
        <span>Low {formatCurrencyQAR(low)}</span>
        <span className="text-neutral-600 font-medium">Fair {formatCurrencyQAR(fair)}</span>
        <span>High {formatCurrencyQAR(high)}</span>
      </div>
      {confidence !== undefined && (
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

export function CarWorthWidget() {
  const [submitted, setSubmitted] = useState(false);

  // fetch filter options for smart dropdowns
  const filterQuery = useQuery({
    queryKey: ["listing-filter-options"],
    queryFn: () => listingsService.list({ limit: 1 }),
    staleTime: 60 * 60_000,
  });
  const makes = filterQuery.data?.makes ?? [];
  const classes = filterQuery.data?.classes ?? [];

  const form = useForm<FormValues>({
    resolver: zodResolver(schema) as any, // eslint-disable-line @typescript-eslint/no-explicit-any
    defaultValues: { make: "", class_name: "SUV", model: "", year: 2021, km: 50000 },
  });

  const mutation = useMutation({
    mutationFn: valuationService.estimate,
    onSuccess: () => setSubmitted(true),
  });

  const onSubmit = (values: FormValues) => mutation.mutate(values);

  const result = mutation.data;
  const watchValues = form.watch();

  return (
    <Card className="flex h-full flex-col space-y-0 overflow-hidden p-0">
      {/* header */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 px-5 pt-5 pb-4 text-white">
        <div className="flex items-center gap-2">
          <BarChart2 className="h-4 w-4 text-amber-400" />
          <span className="text-xs font-medium uppercase tracking-widest text-amber-400">
            Instant Valuation
          </span>
        </div>
        <h3 className="mt-1.5 text-xl font-bold">What is your car worth?</h3>
        <p className="mt-0.5 text-xs text-neutral-400">
          Based on {10000}+ live listings in Qatar &mdash; updated daily
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* result panel */}
        {result && submitted ? (
          <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-neutral-500">Market value for your car</p>
                <p className="text-3xl font-extrabold text-neutral-900 tracking-tight">
                  <AnimatedPrice value={result.fair} />
                </p>
              </div>
              <div className={`flex flex-col items-center rounded-2xl px-3 py-2 text-xs font-semibold ${
                result.fair > 0 ? "bg-emerald-50 text-emerald-700" : "bg-neutral-100 text-neutral-600"
              }`}>
                <Sparkles className="h-4 w-4 mb-0.5" />
                Fair price
              </div>
            </div>

            <ValueGauge
              low={result.low}
              fair={result.fair}
              high={result.high}
              confidence={result.confidence}
            />

            {/* insight chip */}
            <div className="flex flex-wrap gap-2">
              {result.fair - result.low > 0 && (
                <span className="flex items-center gap-1 rounded-full bg-teal-50 px-2.5 py-1 text-xs font-medium text-teal-700">
                  <TrendingDown className="h-3 w-3" />
                  Sell fast: list at {formatCurrencyQAR(Math.round(result.low * 1.02))}
                </span>
              )}
              <span className="flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                <TrendingUp className="h-3 w-3" />
                Max out: list at {formatCurrencyQAR(Math.round(result.high * 0.97))}
              </span>
            </div>

            {/* CTA row */}
            <div className="flex gap-2 pt-1">
              <Link
                href={`/listings?make=${encodeURIComponent(watchValues.make)}&class_name=${encodeURIComponent(watchValues.class_name)}&model=${encodeURIComponent(watchValues.model ?? "")}`}
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
          /* form */
          <form
            className="space-y-2.5"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            {/* make */}
            <div className="relative">
              {makes.length > 0 ? (
                <>
                  <select
                    {...form.register("make")}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
                  >
                    <option value="">Select make…</option>
                    {makes.map((m) => <option key={m} value={m}>{m}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </>
              ) : (
                <Input placeholder="Make (Toyota, BMW…)" {...form.register("make")} />
              )}
              {form.formState.errors.make && (
                <p className="mt-0.5 text-xs text-rose-500">{form.formState.errors.make.message}</p>
              )}
            </div>

            {/* body type */}
            <div className="relative">
              {classes.length > 0 ? (
                <>
                  <select
                    {...form.register("class_name")}
                    className="w-full appearance-none rounded-xl border border-neutral-200 bg-white px-3 py-2.5 pr-8 text-sm text-neutral-800 focus:border-neutral-400 focus:outline-none"
                  >
                    <option value="">Select body type…</option>
                    {classes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                </>
              ) : (
                <Input placeholder="Body type (SUV, Sedan…)" {...form.register("class_name")} />
              )}
            </div>

            {/* model */}
            <Input placeholder="Model (optional)" {...form.register("model")} />

            {/* year + km side by side */}
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
                  placeholder="Km"
                  {...form.register("km")}
                  className="pl-8"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={mutation.isPending}
              variant="premium"
            >
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
