"use client";

import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { valuationService } from "@/services/valuation.service";
import { formatCurrencyQAR } from "@/lib/utils";

const schema = z.object({
  make: z.string().min(1, "Make is required"),
  class_name: z.string().min(1, "Body type is required"),
  model: z.string().optional(),
  year: z.coerce.number().min(1990).max(2030),
  km: z.coerce.number().min(0),
});

export function CarWorthWidget() {
  const form = useForm<z.input<typeof schema>, unknown, z.output<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: {
      make: "",
      class_name: "SUV",
      model: "",
      year: 2020,
      km: 60000,
    },
  });

  const mutation = useMutation({
    mutationFn: valuationService.estimate,
  });

  return (
    <Card className="flex h-full flex-col space-y-3">
      <div>
        <h3 className="text-lg font-semibold">How much is my car worth?</h3>
        <p className="text-sm text-neutral-600">Answer a few basics and get an instant price range.</p>
      </div>

      <form
        className="grid gap-2.5 md:grid-cols-2"
        onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      >
        <Input placeholder="Make (Toyota, BMW...)" {...form.register("make")} />
        <Input placeholder="Body type (SUV, Sedan...)" {...form.register("class_name")} />
        <Input placeholder="Model" {...form.register("model")} />
        <Input type="number" placeholder="Year" {...form.register("year")} />
        <Input type="number" placeholder="KM" {...form.register("km")} />
        <Button className="md:col-span-2" disabled={mutation.isPending}>
          {mutation.isPending ? "Estimating..." : "Check car value"}
        </Button>
      </form>

      {mutation.data && (
        <div className="rounded-2xl bg-neutral-50 p-3 text-sm">
          <p className="text-neutral-600">Estimated market range</p>
          <p className="mt-1 text-lg font-semibold">
            {formatCurrencyQAR(mutation.data.low)} - {formatCurrencyQAR(mutation.data.high)}
          </p>
        </div>
      )}
    </Card>
  );
}
