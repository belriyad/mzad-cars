"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, ChevronRight, ChevronLeft, Loader2, BarChart2 } from "lucide-react";
import Link from "next/link";
import { instantOffersService } from "@/services/instant-offers.service";
import { useAuthStore } from "@/store/auth-store";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatCurrencyQAR } from "@/lib/utils";

const CONDITIONS = ["excellent", "good", "fair", "poor"] as const;
const CITIES = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

const step1Schema = z.object({
  make:       z.string().min(1, "Required"),
  class_name: z.string().min(1, "Required"),
  model:      z.string().optional(),
  year:       z.coerce.number().min(1990).max(2026),
  km:         z.coerce.number().min(0),
  color:      z.string().optional(),
  condition:  z.enum(CONDITIONS),
  city:       z.string().min(1, "Required"),
});

const step2Schema = z.object({
  description:      z.string().optional(),
  asking_price_qar: z.coerce.number().optional(),
  contact_name:     z.string().optional(),
  contact_phone:    z.string().optional(),
});

type Step1Input = z.input<typeof step1Schema>;
type Step1Output = z.output<typeof step1Schema>;
type Step2Input = z.input<typeof step2Schema>;
type Step2Output = z.output<typeof step2Schema>;

const CONDITION_LABEL: Record<string, string> = {
  excellent: "Excellent",
  good: "Good",
  fair: "Fair",
  poor: "Poor",
};

export default function SellWithOffersPage() {
  const token = useAuthStore((s) => s.accessToken);
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [step1Data, setStep1Data] = useState<Step1Output | null>(null);
  const [step2Data, setStep2Data] = useState<Step2Output | null>(null);
  const [requestUid, setRequestUid] = useState<string | null>(null);

  const form1 = useForm<Step1Input, unknown, Step1Output>({
    resolver: zodResolver(step1Schema),
    defaultValues: { condition: "good", city: "Doha" },
  });
  const form2 = useForm<Step2Input, unknown, Step2Output>({
    resolver: zodResolver(step2Schema),
  });

  // Step 3: market comps
  const compsQuery = useQuery({
    queryKey: ["io-comps", step1Data],
    queryFn: () =>
      instantOffersService.comps({
        make: step1Data!.make,
        class_name: step1Data!.class_name,
        year: step1Data!.year,
        km: step1Data!.km,
      }),
    enabled: step === 3 && !!step1Data,
  });

  const submitMutation = useMutation({
    mutationFn: () =>
      instantOffersService.createRequest(
        {
          make: step1Data!.make,
          class_name: step1Data!.class_name,
          model: step1Data!.model,
          year: step1Data!.year,
          km: step1Data!.km,
          color: step1Data!.color,
          condition: step1Data!.condition,
          city: step1Data!.city,
          description: step2Data?.description,
          asking_price_qar: step2Data?.asking_price_qar,
          contact_name: step2Data?.contact_name,
          contact_phone: step2Data?.contact_phone,
        },
        token ?? "",
      ),
    onSuccess: (data) => {
      setRequestUid(data.request.request_uid);
      setStep(4);
    },
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">Get dealer offers on your car</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Submit your car details and licensed Qatar dealers will compete with their best prices.
        </p>
      </div>

      {/* step bar */}
      <div className="flex gap-2">
        {(["Car details", "More info", "Market data", "Done"] as const).map((label, i) => (
          <div key={label} className="flex-1 flex flex-col items-center gap-1">
            <div className={`h-1.5 w-full rounded-full ${step >= i + 1 ? "bg-blue-600" : "bg-neutral-100"}`} />
            <span className={`text-xs hidden sm:block ${step >= i + 1 ? "text-blue-700 font-medium" : "text-neutral-400"}`}>
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* Step 1 */}
      {step === 1 && (
        <Card className="space-y-4">
          <h2 className="font-semibold">Step 1 — Car details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Make *</label>
              <Input placeholder="Toyota" {...form1.register("make")} />
              {form1.formState.errors.make && <p className="text-xs text-red-500">{form1.formState.errors.make.message}</p>}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Body type *</label>
              <Input placeholder="SUV, Sedan…" {...form1.register("class_name")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Model</label>
              <Input placeholder="Camry, Patrol…" {...form1.register("model")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Year *</label>
              <Input type="number" placeholder="2021" {...form1.register("year")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Mileage (km) *</label>
              <Input type="number" placeholder="55000" {...form1.register("km")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Color</label>
              <Input placeholder="White, Silver…" {...form1.register("color")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Condition *</label>
              <select {...form1.register("condition")} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                {CONDITIONS.map((c) => <option key={c} value={c}>{CONDITION_LABEL[c]}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">City *</label>
              <select {...form1.register("city")} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <Button
            className="w-full gap-2"
            onClick={form1.handleSubmit((data: Step1Output) => { setStep1Data(data); setStep(2); })}
          >
            Continue <ChevronRight className="h-4 w-4" />
          </Button>
        </Card>
      )}

      {/* Step 2 */}
      {step === 2 && (
        <Card className="space-y-4">
          <h2 className="font-semibold">Step 2 — Additional info</h2>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Description</label>
              <textarea
                {...form2.register("description")}
                rows={4}
                placeholder="Describe the car condition, any issues, service history…"
                className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-neutral-300"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Your asking price (QAR)</label>
              <Input type="number" placeholder="Leave blank to let dealers decide" {...form2.register("asking_price_qar")} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500">Contact name</label>
                <Input placeholder="Your name" {...form2.register("contact_name")} />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-neutral-500">Contact phone</label>
                <Input placeholder="+974 …" {...form2.register("contact_phone")} />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 gap-2" onClick={() => setStep(1)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 gap-2"
              onClick={form2.handleSubmit((data: Step2Output) => { setStep2Data(data); setStep(3); })}
            >
              Continue <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3 — market comps */}
      {step === 3 && (
        <Card className="space-y-4">
          <div className="flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold">Step 3 — Market comparables</h2>
          </div>
          {compsQuery.isLoading && (
            <div className="flex items-center gap-2 text-neutral-500 py-4 justify-center">
              <Loader2 className="h-4 w-4 animate-spin" /> Fetching market data…
            </div>
          )}
          {compsQuery.data && (
            <div>
              <div className="grid grid-cols-3 gap-2 text-center">
                {[
                  { label: "Median", value: compsQuery.data.median },
                  { label: "Low (P25)", value: compsQuery.data.p25 },
                  { label: "High (P75)", value: compsQuery.data.p75 },
                ].map((item) => (
                  <div key={item.label} className="rounded-xl border border-neutral-100 bg-neutral-50 py-3 px-2">
                    <p className="text-xs text-neutral-400 mb-1">{item.label}</p>
                    <p className="font-semibold text-sm">
                      {item.value != null ? formatCurrencyQAR(item.value) : "—"}
                    </p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-neutral-400 mt-2 text-center">
                Based on {compsQuery.data.count} comparable listings
                {compsQuery.data.min != null && compsQuery.data.max != null
                  ? ` · Min ${formatCurrencyQAR(compsQuery.data.min)} → Max ${formatCurrencyQAR(compsQuery.data.max)}`
                  : ""}
              </p>
            </div>
          )}
          {compsQuery.isError && (
            <p className="text-sm text-neutral-400 text-center py-2">Market data unavailable — you can still proceed.</p>
          )}
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1 gap-2" onClick={() => setStep(2)}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              className="flex-1 gap-2"
              disabled={submitMutation.isPending}
              onClick={() => submitMutation.mutate()}
            >
              {submitMutation.isPending
                ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                : <>Submit request <ChevronRight className="h-4 w-4" /></>}
            </Button>
          </div>
          {submitMutation.isError && (
            <p className="text-sm text-red-600 text-center">Failed to submit. Please try again.</p>
          )}
        </Card>
      )}

      {/* Step 4 — success */}
      {step === 4 && (
        <Card className="text-center space-y-4 py-8">
          <div className="flex justify-center">
            <CheckCircle className="h-14 w-14 text-emerald-500" />
          </div>
          <h2 className="text-xl font-semibold">Request submitted!</h2>
          <p className="text-neutral-500 text-sm max-w-xs mx-auto">
            Licensed Qatar dealers can now see your car and place offers. You'll receive bids within 24 hours.
          </p>
          {requestUid && (
            <Badge className="bg-blue-100 text-blue-700 font-mono text-xs">{requestUid}</Badge>
          )}
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link href="/instant-offers/my-requests">
              <Button className="gap-2">View my requests <ChevronRight className="h-4 w-4" /></Button>
            </Link>
            <Link href="/">
              <Button variant="secondary">Back to home</Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  );
}
