import { Card } from "@/components/ui/card";
import { ShieldAlert } from "lucide-react";

export default function SuspiciousPage() {
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Suspicious activity</h1>
      <Card className="flex flex-col items-center gap-3 py-16 text-center">
        <ShieldAlert className="h-10 w-10 text-neutral-300" />
        <p className="font-medium text-neutral-600">Coming soon</p>
        <p className="max-w-xs text-sm text-neutral-400">
          Automated anomaly detection and flagged account reports will appear here once the fraud
          detection pipeline is live.
        </p>
      </Card>
    </section>
  );
}

