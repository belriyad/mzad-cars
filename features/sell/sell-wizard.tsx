"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ocrService } from "@/services/ocr.service";
import { useEntitlement } from "@/hooks/use-entitlement";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";
import type { OCRExtractionResult } from "@/types/api";

const listingSchema = z.object({
  title: z.string().min(3),
  price_qar: z.coerce.number().positive(),
  make: z.string().min(1),
  class_name: z.string().min(1),
  model: z.string().optional(),
  manufacture_year: z.coerce.number().min(1980).max(2030),
  km: z.coerce.number().min(0),
  city: z.string().min(1),
});

type ListingFormInput = z.input<typeof listingSchema>;
type ListingForm = z.output<typeof listingSchema>;

export function SellWizard() {
  const [step, setStep] = useState(1);
  const [ocrResult, setOcrResult] = useState<OCRExtractionResult | null>(null);
  const { tier, entitlements } = useEntitlement();

  const form = useForm<ListingFormInput, unknown, ListingForm>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      title: "",
      price_qar: 0,
      make: "",
      class_name: "",
      model: "",
      manufacture_year: 2020,
      km: 0,
      city: "Doha",
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

  return (
    <div className="space-y-4">
      <Card>
        <p className="text-sm text-neutral-500">Step {step} of 6</p>
        <h1 className="text-lg font-semibold">Sell your car wizard</h1>
      </Card>

      {step === 1 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Seller context</h2>
          <p className="text-sm text-neutral-600">
            Own car is available for all users. On behalf of owner is dealer-only.
          </p>
          <div className="flex gap-2">
            <Button onClick={() => setStep(2)}>Own car</Button>
            <Button
              variant="secondary"
              onClick={() => setStep(2)}
              disabled={!entitlements.canPostOnBehalfOfOwner}
            >
              On behalf of owner
            </Button>
          </div>
        </Card>
      )}

      {step === 2 && (
        <Card className="space-y-3">
          <h2 className="font-semibold">Registration card upload</h2>
          <p className="text-sm text-neutral-600">
            OCR and VIN enrichment prefill your listing fields.
          </p>
          <Button
            onClick={async () => {
              const res = await ocrService.extractFromRegistrationCard();
              setOcrResult(res);
              if (res.make) form.setValue("make", res.make);
              if (res.model) form.setValue("model", res.model);
              if (res.manufacture_year) {
                form.setValue("manufacture_year", res.manufacture_year);
              }
              setStep(3);
            }}
          >
            Simulate OCR extraction
          </Button>
          {ocrResult && <pre className="overflow-auto rounded-xl bg-neutral-100 p-3 text-xs">{JSON.stringify(ocrResult, null, 2)}</pre>}
        </Card>
      )}

      {step >= 3 && (
        <Card>
          <form className="space-y-3" onSubmit={form.handleSubmit(() => setStep(6))}>
            <Input placeholder="Title" {...form.register("title")} />
            <Input type="number" placeholder="Price (QAR)" {...form.register("price_qar")} />
            <Input placeholder="Make" {...form.register("make")} />
            <Input placeholder="Class / Body Type" {...form.register("class_name")} />
            <Input placeholder="Model" {...form.register("model")} />
            <Input type="number" placeholder="Year" {...form.register("manufacture_year")} />
            <Input type="number" placeholder="KM" {...form.register("km")} />
            <Input placeholder="City" {...form.register("city")} />
            <Button type="submit" className="w-full">Submit for admin review</Button>
          </form>
        </Card>
      )}
    </div>
  );
}
