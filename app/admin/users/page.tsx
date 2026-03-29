"use client";

import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { adminService } from "@/services/admin.service";
import { useAuthStore } from "@/store/auth-store";

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.accessToken);
  const query = useQuery({
    queryKey: ["admin-users", token],
    queryFn: () => adminService.users(token ?? undefined),
    enabled: Boolean(token),
  });

  return (
    <section className="space-y-3">
      <h1 className="text-2xl font-semibold">Users and dealers</h1>
      {query.isLoading ? (
        <Card className="animate-pulse bg-neutral-100">Loading users...</Card>
      ) : query.isError ? (
        <Card className="text-red-600">Unable to load users list.</Card>
      ) : (
        <Card className="space-y-3">
          <p className="text-sm text-neutral-500">Role management and account status</p>
          <div className="space-y-2 text-sm">
            {(query.data ?? []).slice(0, 20).map((row, i) => {
              const user = row as Record<string, unknown>;
              return (
                <div key={String(user.id ?? i)} className="flex items-center justify-between rounded-xl border border-neutral-200 px-3 py-2">
                  <div>
                    <p className="font-medium">{String(user.full_name ?? user.email ?? user.id ?? "User")}</p>
                    <p className="text-xs text-neutral-500">{String(user.email ?? "No email")}</p>
                  </div>
                  <p className="text-xs uppercase tracking-wide text-neutral-600">
                    {String(user.role ?? "user")}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </section>
  );
}
