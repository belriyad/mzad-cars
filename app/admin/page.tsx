import Link from "next/link";
import { Card } from "@/components/ui/card";
import { RoleGate } from "@/components/auth/role-gate";

const links = [
  ["Moderation queue", "/admin/moderation"],
  ["Users & dealers", "/admin/users"],
  ["Suspicious activity", "/admin/suspicious"],
] as const;

export default function AdminPage() {
  return (
    <RoleGate
      allow={["admin"]}
      title="Admin access only"
      description="This section is restricted to moderation and platform operations teams."
    >
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <div className="grid gap-3 md:grid-cols-3">
          {links.map(([label, href]) => (
            <Link key={label} href={href}>
              <Card>{label}</Card>
            </Link>
          ))}
        </div>
      </section>
    </RoleGate>
  );
}
