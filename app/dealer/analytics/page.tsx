"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { dealerService } from "@/services/dealer.service";

export default function DealerAnalyticsPage() {
  const query = useQuery({
    queryKey: ["dealer-analytics"],
    queryFn: () => dealerService.analytics(),
  });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Dealer analytics</h1>
      {query.isLoading ? (
        <Card className="animate-pulse bg-neutral-100">Loading analytics...</Card>
      ) : query.isError ? (
        <Card className="text-red-600">Failed to load analytics.</Card>
      ) : (
        <div className="grid gap-3 md:grid-cols-3">
          <Card>
            <p className="text-sm text-neutral-500">Inventory</p>
            <p className="text-2xl font-semibold">{query.data?.inventoryCount ?? 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Views</p>
            <p className="text-2xl font-semibold">{query.data?.views ?? 0}</p>
          </Card>
          <Card>
            <p className="text-sm text-neutral-500">Leads</p>
            <p className="text-2xl font-semibold">{query.data?.leads ?? 0}</p>
          </Card>
        </div>
      )}
    </section>
  );
}
