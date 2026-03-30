"use client";

import { Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DealerTeamPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Team management</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Invite staff members and control what each person can do in your dealer account.
        </p>
      </div>

      <Card className="flex flex-col items-center gap-4 py-16 text-center">
        <Users className="h-12 w-12 text-neutral-200" />
        <Badge className="bg-amber-100 text-amber-700">Beta — coming soon</Badge>
        <div className="max-w-sm space-y-1">
          <p className="font-semibold text-neutral-700">Team management is on the way</p>
          <p className="text-sm text-neutral-400">
            Invite agents, assign manager roles, and audit activity logs — available in the next
            release. We&apos;ll notify you when it&apos;s live.
          </p>
        </div>
      </Card>
    </div>
  );
}
