"use client";

import { Bell, BellOff, CheckCheck, Loader2, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/http";
import { toast } from "sonner";
import Link from "next/link";

interface ApiNotification {
  id: number;
  title: string;
  body: string;
  is_read: boolean;
  created_at: string;
  type?: string;
}

const TYPE_COLORS: Record<string, string> = {
  alert:      "bg-blue-100 text-blue-700",
  moderation: "bg-amber-100 text-amber-700",
  system:     "bg-neutral-100 text-neutral-500",
};

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1)  return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function NotificationsPage() {
  const token = useAuthStore((s) => s.accessToken) ?? undefined;
  const user  = useAuthStore((s) => s.user);
  const qc    = useQueryClient();

  const query = useQuery({
    queryKey: ["notifications", user?.email],
    queryFn: () =>
      apiRequest<{ rows: ApiNotification[] }>(
        `/notifications?user_key=${encodeURIComponent(user?.email ?? "")}&limit=50`,
        { token }
      ),
    enabled: !!token && !!user?.email,
  });

  const markRead = useMutation({
    mutationFn: (ids: number[]) =>
      apiRequest("/notifications/mark-read", {
        method: "POST",
        body: { user_key: user?.email, ids },
        token,
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["notifications"] }),
    onError:   () => toast.error("Failed to mark as read"),
  });

  if (!token || !user) {
    return (
      <Card className="flex flex-col items-center gap-3 py-14 text-center">
        <User className="h-10 w-10 text-neutral-300" />
        <p className="font-medium">Sign in to see your notifications</p>
        <Link href="/login"><Button>Sign in</Button></Link>
      </Card>
    );
  }

  const items  = query.data?.rows ?? [];
  const unread = items.filter((n) => !n.is_read);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {unread.length > 0 && (
            <Badge className="bg-rose-100 text-rose-700">{unread.length}</Badge>
          )}
        </div>
        {unread.length > 0 && (
          <Button
            size="sm" variant="secondary" className="gap-1.5"
            disabled={markRead.isPending}
            onClick={() => markRead.mutate(unread.map((n) => n.id))}
          >
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {query.isLoading && (
        <div className="flex items-center gap-2 text-sm text-neutral-400">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading notifications…
        </div>
      )}
      {query.isError && (
        <Card className="text-red-600">Failed to load notifications.</Card>
      )}
      {!query.isLoading && !query.isError && items.length === 0 && (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <BellOff className="h-8 w-8 text-neutral-300" />
          <p className="text-sm text-neutral-500">No notifications yet.</p>
        </Card>
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <button
            key={n.id}
            onClick={() => { if (!n.is_read) markRead.mutate([n.id]); }}
            className={`w-full rounded-2xl border px-4 py-3 text-left transition hover:shadow-sm ${
              n.is_read ? "border-neutral-100 bg-white" : "border-blue-100 bg-blue-50/60"
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  {!n.is_read && <span className="inline-block h-2 w-2 shrink-0 rounded-full bg-blue-500" />}
                  <span className="font-medium text-sm text-neutral-900">{n.title}</span>
                  {n.type && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLORS[n.type] ?? TYPE_COLORS.system}`}>
                      {n.type}
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-neutral-600 leading-snug">{n.body}</p>
              </div>
              {n.created_at && (
                <span className="shrink-0 text-xs text-neutral-400">{timeAgo(n.created_at)}</span>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
