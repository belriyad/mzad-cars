import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RoleGate } from "@/components/auth/role-gate";

const items = [
  ["Team", "/dealer/team"],
  ["Inventory", "/dealer/inventory"],
  ["CSV Import", "/dealer/csv-import"],
  ["Analytics", "/dealer/analytics"],
  ["Profile", "/dealer/profile"],
] as const;

export default function DealerDashboardPage() {
  return (
    <RoleGate
      allow={["dealer", "admin"]}
      title="Dealer package required"
      description="Upgrade to Dealer plan to unlock team, inventory, CSV, and analytics workflows."
    >
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Dealer dashboard</h1>
        <div className="grid gap-3 md:grid-cols-2">
          {items.map(([name, href]) => (
            <Link key={name} href={href}>
              <Card>{name}</Card>
            </Link>
          ))}
        </div>
      </section>
    </RoleGate>
  );
}
