"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth-store";
import type { UserRole } from "@/types/domain";
import { Card } from "@/components/ui/card";

type ProtectedRouteProps = {
  allowRoles?: UserRole[];
  children: React.ReactNode;
};

export function ProtectedRoute({ allowRoles = ["user", "dealer", "admin"], children }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useAuthStore((s) => s.hydrated);
  const token = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (!hydrated) return;

    if (!token || !user) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
      return;
    }

    if (!allowRoles.includes(user.role)) {
      router.replace("/");
    }
  }, [allowRoles, hydrated, pathname, router, token, user]);

  if (!hydrated) {
    return (
      <div className="space-y-3 p-4">
        <div className="h-7 w-40 animate-pulse rounded-xl bg-neutral-100" />
        <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
        <div className="h-20 animate-pulse rounded-2xl bg-neutral-100" />
      </div>
    );
  }

  if (!token || !user || !allowRoles.includes(user.role)) return null;

  return <>{children}</>;
}
