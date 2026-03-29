import { Card } from "@/components/ui/card";
import { StatusChip } from "@/components/common/status-chip";

export default function MyListingsPage() {
  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">My listings</h1>
      <Card className="flex items-center justify-between">
        <div>
          <p className="font-medium">Mercedes C200 2020</p>
          <p className="text-sm text-neutral-500">Awaiting moderation decision</p>
        </div>
        <StatusChip status="pending_review" />
      </Card>
    </section>
  );
}
