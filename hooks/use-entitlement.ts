"use client";

import { getEntitlements } from "@/lib/entitlements";
import { useAuthStore } from "@/store/auth-store";

export function useEntitlement() {
  const user = useAuthStore((s) => s.user);

  const role = user?.role ?? "guest";
  const tier = user?.tier ?? "guest";

  return {
    user,
    role,
    tier,
    entitlements: getEntitlements(role, tier),
  };
}
