"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ocrService } from "@/services/ocr.service";
import { listingsService } from "@/services/listings.service";
import { useEntitlement } from "@/hooks/use-entitlement";
import { useAuthStore } from "@/store/auth-store";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";
import type { OCRExtractionResult } from "@/types/api";

const listingSchema = z.object({
  title:            z.string().min(3, "Title must be at least 3 characters"),
  price_qar:        z.coerce.number().positive("Price must be positive"),
  make:             z.string().min(1, "Make is required"),
  class_name:       z.string().min(1, "Body type is required"),
  model:            z.string().optional(),
  manufacture_year: z.coerce.number().min(1980).max(2030),
  km:               z.coerce.number().min(0),
  city:             z.string().min(1, "City is required"),
  description:      z.string().optional(),
});

type ListingFormInput = z.input<typeof listingSchema>;
type ListingForm = z.output<typeof listingSchema>;

const CITIES = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];

export function SellWizard() {
  const router  = useRouter();
  const [step, setStep]           = useState(1);
  const [ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const { tier, entitlements } = useEntitlement();
  const token = useAuthStore((s) => s.accessToken) ?? undefined;

  const form = useForm<ListingFormInput, unknown, ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "", price_qar: 0, make: "", class_name: "",
      model: "", manufacture_year: 2020, km: 0, city: "Doha", description: "",
    },
  });

  if (tier === "guest") {
    return (
      <UpgradePrompt
        title="Start with a free account"
        description="Guests can browse only. Sign up to unlock deal ratings, favorites, alerts, and one free listing per month."
      />
    );
  }

  if (!entitlements.monthlyListingLimit) {
    return (
      <UpgradePrompt
        title="Upgrade to start listing"
        description="Your current plan has no listing credits. Upgrade to Private or Dealer package."
      />
    );
  }

  if (submitted) {
    return (
      <Card className="flex flex-col items-center gap-4 py-14 text-center">
        <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        <h2 className="text-xl font-semibold">Listing submitted!</h2>
        <p className="text-sm text-neutral-500 max-w-xs">
          Your listing is pending admin review. You will be notified once approved.
        </p>
        <div className="flex gap-2 flex-wrap justify-center">
          <Button onClick={() => { setSubmitted(false); setStep(1); form.reset(); }}>
            List another car
          </Button>
          <Button variant="secondary" onClick={() => router.push("/my-listings")}>
            View my listings
          </Button>
        </div>
      </Card>
    );
  }

  const steps = ["Seller context", "Registration card", "Car details", "Review & submit"];

  return (
    <div className="space-y-4">
      {/* progress */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          {steps.map((label, i) => (
            <div key={label} className="flex items-center gap-1">
              <span
                className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-bold ${
                  i + 1 < step
                    ? "bg-emerald-500 text-white"
                    : i + 1 === step
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-400"
                }`}
              >
                {i + 1 < step ? "✓" : i + 1}
              </span>
              <span className={`hidden sm:block text-xs ${i + 1 === step ? "font-semibold text-neutral-900" : "text-neutral-400"}`}>
                {label}
              </span>
              {i < steps.length - 1 && <span className="text-neutral-200 mx-1">›</span>}
            </div>
          ))}
        </div>
        <p className="text-xs text-neutral-400">Step {step} of {steps.length}</p>
      </Card>

      {step === 1 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Who are you listing for?</h2>
          <p className="text-sm text-neutral-600">
            Own car is available for all users. On behalf of owner requires a dealer account.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setStep(2)}>Own car</Button>
            <Button variant="secondary" onClick={() => setStep(2)} disabled={!entitlements.canPostOnBehalfOfOwner}>
              On behalf of owner
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Registration card</h2>
          <p className="text-sm text-neutral-600">
            Upload your registration card — OCR pre-fills the form fields automatically.
          </p>
          <div className="flex gap-2 flex-wrap">
            <Button
              onClick={async () => {
                const res = await ocrService.extractFromRegistrationCard();
                setOcrResult(res);
                if (res.make)             form.setValue("make", res.make);
                if (res.model)            form.setValue("model", res.model);
                if (res.manufacture_year) form.setValue("manufacture_year", res.manufacture_year);
                setStep(3);
              }}
            >
              Simulate OCR extraction
            </Button>
            <Button variant="secondary" onClick={() => setStep(3)}>Skip, enter manually</Button>
          </div>
          {ocrResult && (
            <pre className="overflow-auto rounded-xl bg-neutral-100 p-3 text-xs">
              {JSON.stringify(ocrResult, null, 2)}
            </pre>
          )}
        </Card>
      )}

      {step === 3 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Car details</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-neutral-500">Listing title *</label>
              <Input placeholder="e.g. Toyota Camry 2022 2.5L" {...form.register("title")} />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Price (QAR) *</label>
              <Input type="number" placeholder="78000" {...form.register("price_qar")} />
              {form.formState.errors.price_qar && (
                <p className="text-xs text-red-500">{form.formState.errors.price_qar.message}</p>
              )}
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Make *</label>
              <Input placeholder="Toyota" {...form.register("make")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Body type *</label>
              <Input placeholder="Sedan" {...form.register("class_name")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Model</label>
              <Input placeholder="Camry" {...form.register("model")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Year *</label>
              <Input type="number" placeholder="2022" {...form.register("manufacture_year")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">Mileage (km) *</label>
              <Input type="number" placeholder="45000" {...form.register("km")} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-neutral-500">City *</label>
              <select {...form.register("city")} className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300">
                {CITIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="sm:col-span-2 space-y-1">
              <label className="text-xs font-medium text-neutral-500">Description</label>
              <textarea {...form.register("description")} rows={3} placeholder="Full options, accident history, reason for sale..." className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 resize-none" />
            </div>
          </div>
          <Button onClick={() => form.trigger().then((ok) => { if (ok) setStep(4); })}>
            Continue to review
          </Button>
        </Card>
      )}

      {step === 4 && (
        <Card className="space-y-4">
          <h2 className="font-semibold">Review your listing</h2>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {(["title","make","class_name","model","manufacture_year","km","price_qar","city"] as const).map((k) => (
              <div key={k}>
                <dt className="text-xs text-neutral-400 capitalize">{k.replace("_", " ")}</dt>
                <dd className="font-medium text-neutral-800">{String(form.getValues(k) ?? "—")}</dd>
              </div>
            ))}
          </dl>
          {form.getValues("description") && (
            <p className="text-sm text-neutral-600 border-t border-neutral-100 pt-3">{form.getValues("description")}</p>
          )}
          <div className="flex gap-2 flex-wrap">
            <Button
              disabled={submitting}
              onClick={form.handleSubmit(async (data) => {
                if (!token) { toast.error("Please log in first"); return; }
                setSubmitting(true);
                try {
                  await listingsService.create(data, token);
                  setSubmitted(true);
                  toast.success("Listing submitted for review");
                } catch {
                  toast.error("Failed to submit listing. Please try again.");
                } finally {
                  setSubmitting(false);
                }
              })}
            >
              {submitting ? <><Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Submitting…</> : "Submit for admin review"}
            </Button>
            <Button variant="secondary" onClick={() => setStep(3)}>Edit</Button>
          </div>
        </Card>
      )}
    </div>
  );
}
