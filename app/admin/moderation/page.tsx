"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/common/status-chip";
import { adminService } from "@/services/admin.service";
import { useAdminAuth } from "@/hooks/use-admin-auth";

export default function ModerationQueuePage() {
  const { token, isAdmin } = useAdminAuth();

  const query = useQuery({
    queryKey: ["admin-moderation"],
    queryFn: () => adminService.moderationQueue(token),
    enabled: isAdmin && !!token,
  });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Moderation queue</h1>
      {query.isLoading ? (
        <Card className="animate-pulse bg-neutral-100">Loading moderation queue...</Card>
      ) : query.isError ? (
        <Card className="text-red-600">Failed to load moderation queue.</Card>
      ) : query.data && query.data.length > 0 ? (
        <div className="space-y-2">
          {query.data.map((listing) => (
            <Link key={listing.product_id} href={`/admin/review/${listing.product_id}`}>
              <Card className="flex items-center justify-between">
                <p>{listing.title} • Pending review</p>
                <StatusChip status="pending_review" />
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>No pending listings right now.</Card>
      )}
    </section>
  );
}
