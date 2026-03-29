"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { dealerService } from "@/services/dealer.service";
import { formatCurrencyQAR } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";

export default function DealerInventoryPage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user = useAuthStore((s) => s.user);

  const query = useQuery({
    queryKey: ["dealer-inventory", user?.id],
    queryFn: () => dealerService.inventory(user?.id, token),
    enabled: !!token,
  });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Inventory manager</h1>
      {query.isLoading ? (
        <Card className="animate-pulse bg-neutral-100">Loading inventory...</Card>
      ) : query.isError ? (
        <Card className="text-red-600">Failed to load inventory.</Card>
      ) : query.data && query.data.length > 0 ? (
        <div className="space-y-2">
          {query.data.map((row) => (
            <Card key={row.product_id} className="flex items-center justify-between">
              <div>
                <p className="font-medium">{row.title}</p>
                <p className="text-sm text-neutral-500">{row.city ?? "Qatar"} • {row.make}</p>
              </div>
              <p className="font-semibold">{formatCurrencyQAR(row.price_qar)}</p>
            </Card>
          ))}
        </div>
      ) : (
        <Card>No inventory yet.</Card>
      )}
    </section>
  );
}
