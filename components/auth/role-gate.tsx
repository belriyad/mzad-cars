"use client";

import { useEntitlement } from "@/hooks/use-entitlement";
import { UpgradePrompt } from "@/components/common/upgrade-prompt";

type RoleGateProps = {
  allow: Array<"guest" | "user" | "dealer" | "admin">;
  title: string;
  description: string;
  children: React.ReactNode;
};

export function RoleGate({ allow, title, description, children }: RoleGateProps) {
  const { role } = useEntitlement();

  if (!allow.includes(role)) {
    return <UpgradePrompt title={title} description={description} />;
  }

  return <>{children}</>;
}
