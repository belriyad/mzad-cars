"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { TrendingDown, TrendingUp, Zap, Info, ChevronRight } from "lucide-react";
import Link from "next/link";
import { insightsService } from "@/services/insights.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyQAR } from "@/lib/utils";
import { CAR_CATALOGUE, BODY_TYPES, CITIES_QA, YEARS, getModels, getTrims } from "@/lib/car-data";

const FUEL_TYPES = ["Petrol", "Diesel", "Hybrid", "Electric"];
const GEAR_TYPES = ["Automatic", "Manual"];

const SELECT_CLS = "w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:opacity-40 disabled:cursor-not-allowed";

const schema = z.object({
  make:             z.string().min(1, "Required"),
  class_name:       z.string().min(1, "Required"),
  manufacture_year: z.coerce.number().min(1990).max(2026),
  km:               z.coerce.number().min(0),
  model:            z.string().optional(),
  fuel_type:        z.string().optional(),
  gear_type:        z.string().optional(),
  cylinder_count:   z.coerce.number().optional(),
  city:             z.string().optional(),
  warranty_status:  z.string().optional(),
});

type FormInput = z.input<typeof schema>;
type FormOutput = z.output<typeof schema>;

function ConfidenceBar({ r2 }: { r2: number }) {
  const pct = Math.round(r2 * 100);
  const color = pct >= 80 ? "bg-emerald-400" : pct >= 60 ? "bg-amber-400" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-neutral-500">
        <span>Model confidence</span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-neutral-100">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ValuationPage() {
  const [selectedMake, setSelectedMake] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const models = getModels(selectedMake);
  const trims  = getTrims(selectedMake, selectedModel);

  const form = useForm<FormInput, unknown, FormOutput>({
    resolver: zodResolver(schema),
    defaultValues: { manufacture_year: 2020, km: 50000, city: "Doha" },
  });

  const mutation = useMutation({
    mutationFn: (data: FormOutput) =>
      insightsService.mlEstimate({
        make: data.make,
        class_name: data.class_name,
        manufacture_year: data.manufacture_year,
        km: data.km,
        model: data.model,
        fuel_type: data.fuel_type,
        gear_type: data.gear_type,
        city: data.city,
        cylinder_count: data.cylinder_count,
        warranty_status: data.warranty_status,
      }),
  });

  const result = mutation.data;

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-2xl font-semibold flex items-center gap-2">
          <Zap className="h-6 w-6 text-amber-500" /> ML Car Valuation
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          Powered by machine learning trained on thousands of Qatar listings. Get an instant market
          estimate with a confidence range.
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="font-semibold text-neutral-800">Car details</h2>
        <div className="grid gap-3 sm:grid-cols-2">
          {/* Make */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Make *</label>
            <select
              {...form.register("make")}
              value={selectedMake}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedMake(v);
                setSelectedModel("");
                form.setValue("make", v);
                form.setValue("model", "");
              }}
              className={SELECT_CLS}
            >
              <option value="">Select make…</option>
              {CAR_CATALOGUE.map((m) => <option key={m.name} value={m.name}>{m.name}</option>)}
            </select>
            {form.formState.errors.make && (
              <p className="text-xs text-red-500">{form.formState.errors.make.message}</p>
            )}
          </div>

          {/* Body type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Body type *</label>
            <select {...form.register("class_name")} className={SELECT_CLS}>
              <option value="">Select body type…</option>
              {BODY_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
            </select>
            {form.formState.errors.class_name && (
              <p className="text-xs text-red-500">{form.formState.errors.class_name.message}</p>
            )}
          </div>

          {/* Model — cascades from make */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Model</label>
            <select
              {...form.register("model")}
              value={selectedModel}
              onChange={(e) => {
                const v = e.target.value;
                setSelectedModel(v);
                form.setValue("model", v);
              }}
              disabled={!selectedMake}
              className={SELECT_CLS}
            >
              <option value="">{!selectedMake ? "Select make first…" : "Select model…"}</option>
              {models.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Trim (informational — not sent to API but useful for UX) */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Trim</label>
            <select
              disabled={!selectedModel || trims.length === 0}
              className={SELECT_CLS}
            >
              <option value="">{!selectedModel ? "Select model first…" : trims.length === 0 ? "N/A" : "Select trim…"}</option>
              {trims.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          {/* Year */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Year *</label>
            <select {...form.register("manufacture_year")} className={SELECT_CLS}>
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          {/* Mileage */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Mileage (km) *</label>
            <Input type="number" placeholder="55000" {...form.register("km")} />
          </div>

          {/* City */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">City</label>
            <select {...form.register("city")} className={SELECT_CLS}>
              {CITIES_QA.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Fuel type */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Fuel type</label>
            <select {...form.register("fuel_type")} className={SELECT_CLS}>
              <option value="">Any</option>
              {FUEL_TYPES.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>

          {/* Transmission */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Transmission</label>
            <select {...form.register("gear_type")} className={SELECT_CLS}>
              <option value="">Any</option>
              {GEAR_TYPES.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </div>

          {/* Cylinders */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Cylinders</label>
            <select {...form.register("cylinder_count")} className={SELECT_CLS}>
              <option value="">Any</option>
              {[3, 4, 5, 6, 8, 10, 12, 16].map((n) => (
                <option key={n} value={n}>{n} cylinders</option>
              ))}
            </select>
          </div>

          {/* Warranty */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Warranty</label>
            <select {...form.register("warranty_status")} className={SELECT_CLS}>
              <option value="">Unknown</option>
              <option value="Under warranty">Under warranty</option>
              <option value="Expired">Expired</option>
            </select>
          </div>
        </div>

        <Button
          className="w-full gap-2"
          disabled={mutation.isPending}
          onClick={form.handleSubmit((data) => mutation.mutate(data))}
        >
          <Zap className="h-4 w-4" />
          {mutation.isPending ? "Estimating…" : "Get ML estimate"}
        </Button>

        {mutation.isError && (
          <p className="text-sm text-red-600 text-center">
            Estimation failed — try again or check your inputs.
          </p>
        )}
      </Card>

      {result && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-neutral-800">Valuation result</h2>
            <Badge className="bg-blue-100 text-blue-700 text-xs">
              Model {result.model_version}
            </Badge>
          </div>

          <div className="text-center py-2">
            <p className="text-xs uppercase tracking-widest text-neutral-400 mb-1">Estimated value</p>
            <p className="text-4xl font-bold text-neutral-900">
              {formatCurrencyQAR(result.estimated_price_qar)}
            </p>
          </div>

          <div className="flex items-stretch gap-2 rounded-2xl border border-neutral-100 bg-neutral-50 overflow-hidden">
            <div className="flex-1 text-center py-3 border-r border-neutral-100">
              <div className="flex items-center justify-center gap-1 text-emerald-600 mb-0.5">
                <TrendingDown className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">Low</span>
              </div>
              <p className="font-semibold text-neutral-800">{formatCurrencyQAR(result.confidence_range[0])}</p>
            </div>
            <div className="flex-1 text-center py-3">
              <div className="flex items-center justify-center gap-1 text-red-500 mb-0.5">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">High</span>
              </div>
              <p className="font-semibold text-neutral-800">{formatCurrencyQAR(result.confidence_range[1])}</p>
            </div>
          </div>

          <ConfidenceBar r2={result.r2} />

          <div className="flex items-start gap-2 text-xs text-neutral-400">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>
              RMSE ±{formatCurrencyQAR(Math.round(result.rmse))} · R²{" "}
              {(result.r2 * 100).toFixed(1)}% variance explained · trained on active Qatar listings.
            </span>
          </div>

          <div className="flex flex-wrap gap-2 border-t border-neutral-100 pt-4">
            <Link href="/instant-offers/sell" className="flex-1">
              <Button className="w-full gap-2">
                Get dealer offers <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/sell" className="flex-1">
              <Button variant="secondary" className="w-full">List it yourself</Button>
            </Link>
          </div>
        </Card>
      )}

      {!result && !mutation.isPending && (
        <Card className="flex items-start gap-3 bg-neutral-50">
          <Info className="h-4 w-4 mt-0.5 shrink-0 text-neutral-400" />
          <p className="text-sm text-neutral-500">
            Our ML model is trained on thousands of real Qatar market transactions.
            It considers make, year, mileage, city, fuel type, and more to give you
            a data-driven estimate — not just comparable averages.
          </p>
        </Card>
      )}
    </div>
  );
}
