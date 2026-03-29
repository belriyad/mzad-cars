import type { ListingStatus } from "@/types/domain";
import { Badge } from "@/components/ui/badge";

const statusText: Record<ListingStatus, string> = {
  draft: "Draft",
  pending_review: "Pending Review",
  approved: "Approved",
  rejected: "Rejected",
  needs_changes: "Needs Changes",
};

const statusClass: Record<ListingStatus, string> = {
  draft: "bg-neutral-100",
  pending_review: "bg-amber-100",
  approved: "bg-emerald-100",
  rejected: "bg-rose-100",
  needs_changes: "bg-orange-100",
};

export function StatusChip({ status }: { status: ListingStatus }) {
  return <Badge className={statusClass[status]}>{statusText[status]}</Badge>;
}
