"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { valuationService } from "@/services/valuation.service";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { formatCurrencyQAR } from "@/lib/utils";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";

const schema = z.object({
  make: z.string().min(1),
  class_name: z.string().min(1),
  model: z.string().optional(),
  year: z.coerce.number().min(1980).max(2030),
  km: z.coerce.number().min(0),
});

export default function ValuationPage() {
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: valuationService.estimate,
  });

  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Standalone Car Valuation</h1>
      <Card>
        <form
          className="grid gap-3 md:grid-cols-2"
          onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
        >
          <Input placeholder="Make" {...form.register("make")} />
          <Input placeholder="Class / Body type" {...form.register("class_name")} />
          <Input placeholder="Model" {...form.register("model")} />
          <Input type="number" placeholder="Year" {...form.register("year")} />
          <Input type="number" placeholder="KM" {...form.register("km")} />
          <Button className="md:col-span-2">Estimate value</Button>
        </form>
      </Card>

      {mutation.data && (
        <Card className="space-y-2">
          <p className="text-sm text-neutral-500">Estimated market range</p>
          <p className="font-semibold">
            {formatCurrencyQAR(mutation.data.low)} - {formatCurrencyQAR(mutation.data.high)}
          </p>
          <UpgradePrompt
            title="Ready to list this car?"
            description="Sign up and choose a package to publish your listing and receive buyer leads."
          />
        </Card>
      )}
    </section>
  );
}
