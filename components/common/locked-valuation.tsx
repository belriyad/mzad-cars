import { Lock } from "lucide-react";
import { Card } from "@/components/ui/card";

export function LockedValuation() {
  return (
    <Card className="border-dashed border-neutral-300 bg-neutral-50/80 p-3">
      <div className="flex items-center gap-2 text-sm text-neutral-600">
        <Lock className="h-4 w-4" />
        Unlock deal rating with a free account
      </div>
    </Card>
  );
}
