"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adminService } from "@/services/admin.service";
import { useAuthStore } from "@/store/auth-store";
import type { User } from "@/types/domain";

const ROLE_COLORS: Record<string, string> = {
  admin: "border-purple-300 bg-purple-50 text-purple-700",
  user: "border-blue-300 bg-blue-50 text-blue-700",
  guest: "border-neutral-200 bg-neutral-50 text-neutral-600",
};

export default function AdminUsersPage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  const { data, isLoading, isError } = useQuery({
    queryKey: ["admin-users", token],
    queryFn: () => adminService.users(token),
    enabled: Boolean(token),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      userId,
      patch,
    }: {
      userId: string;
      patch: { role?: "guest" | "user" | "admin"; is_active?: boolean };
    }) => adminService.updateUser(userId, patch, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => adminService.deleteUser(userId, token),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const users: User[] = data?.rows ?? [];
  const filtered = search.trim()
    ? users.filter(
        (u) =>
          u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
          u.email?.toLowerCase().includes(search.toLowerCase()) ||
          u.phone?.includes(search) ||
          u.id?.includes(search)
      )
    : users;

  const isBusy = updateMutation.isPending || deleteMutation.isPending;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Users &amp; Dealers</h1>
          <p className="text-sm text-neutral-500">
            {isLoading ? "Loading…" : `${users.length} total · ${filtered.length} shown`}
          </p>
        </div>
      </div>

      {/* Search */}
      <Card className="p-3">
        <input
          type="text"
          placeholder="Search by name, email, phone or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm outline-none focus:border-blue-400"
        />
      </Card>

      {/* Table */}
      {isLoading ? (
        <Card className="animate-pulse bg-neutral-50 p-6 text-center text-neutral-500">
          Loading users…
        </Card>
      ) : isError ? (
        <Card className="p-6 text-center text-red-600">Failed to load users.</Card>
      ) : filtered.length === 0 ? (
        <Card className="p-6 text-center text-neutral-500">No users match your search.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="border-b border-neutral-200 bg-neutral-50">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">User</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Phone</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Role</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Status</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Joined</th>
                <th className="px-4 py-3 text-left font-medium text-neutral-600">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr
                  key={user.id}
                  className="border-b border-neutral-100 hover:bg-neutral-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium">{user.full_name ?? "—"}</p>
                    <p className="text-xs text-neutral-500">{user.email ?? "No email"}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-600">
                    {user.phone ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <Badge className={ROLE_COLORS[user.role ?? "user"] ?? ROLE_COLORS.user}>
                      {user.role ?? "user"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge
                      className={
                        user.is_active !== false
                          ? "border-green-300 bg-green-50 text-green-700"
                          : "border-red-300 bg-red-50 text-red-700"
                      }
                    >
                      {user.is_active !== false ? "Active" : "Inactive"}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {/* Promote to admin */}
                      {user.role !== "admin" && (
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            updateMutation.mutate({
                              userId: user.id,
                              patch: { role: "admin" },
                            })
                          }
                          className="rounded-md bg-purple-100 px-2 py-1 text-xs font-semibold text-purple-700 hover:bg-purple-200 disabled:opacity-50"
                          title="Make admin"
                        >
                          → Admin
                        </button>
                      )}
                      {/* Demote to user */}
                      {user.role === "admin" && (
                        <button
                          disabled={isBusy}
                          onClick={() =>
                            updateMutation.mutate({
                              userId: user.id,
                              patch: { role: "user" },
                            })
                          }
                          className="rounded-md bg-blue-100 px-2 py-1 text-xs font-semibold text-blue-700 hover:bg-blue-200 disabled:opacity-50"
                          title="Demote to user"
                        >
                          → User
                        </button>
                      )}
                      {/* Toggle active */}
                      <button
                        disabled={isBusy}
                        onClick={() =>
                          updateMutation.mutate({
                            userId: user.id,
                            patch: { is_active: user.is_active === false },
                          })
                        }
                        className={`rounded-md px-2 py-1 text-xs font-semibold disabled:opacity-50 ${
                          user.is_active !== false
                            ? "bg-red-100 text-red-700 hover:bg-red-200"
                            : "bg-green-100 text-green-700 hover:bg-green-200"
                        }`}
                      >
                        {user.is_active !== false ? "Deactivate" : "Reactivate"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

