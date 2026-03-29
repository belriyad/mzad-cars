"use client";

import { useState } from "react";
import { Bell, BellOff, CheckCheck } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface Notification {
  id: number;
  title: string;
  body: string;
  read: boolean;
  time: string;
  type: "alert" | "moderation" | "system";
}

const INITIAL: Notification[] = [
  {
    id: 1,
    title: "New match — Toyota Camry under 80,000 QAR",
    body: "A Toyota Camry 2022 was just listed in Doha for 75,000 QAR. Tap to view.",
    read: false,
    time: "2 min ago",
    type: "alert",
  },
  {
    id: 2,
    title: "Your listing was approved",
    body: "Your listing \"Nissan Patrol 2020\" is now live and visible to buyers.",
    read: false,
    time: "1 hour ago",
    type: "moderation",
  },
  {
    id: 3,
    title: "Price drop on a saved car",
    body: "BMW 520i 2021 in your favorites dropped from 130,000 to 118,000 QAR.",
    read: true,
    time: "Yesterday",
    type: "alert",
  },
  {
    id: 4,
    title: "Welcome to Mzad Cars!",
    body: "Browse thousands of cars across Qatar, set price alerts, and get deal ratings instantly.",
    read: true,
    time: "3 days ago",
    type: "system",
  },
];

const TYPE_COLORS: Record<string, string> = {
  alert: "bg-blue-100 text-blue-700",
  moderation: "bg-amber-100 text-amber-700",
  system: "bg-neutral-100 text-neutral-500",
};

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>(INITIAL);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = () =>
    setItems((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id: number) =>
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Notifications</h1>
          {unreadCount > 0 && (
            <Badge className="bg-rose-100 text-rose-700">{unreadCount}</Badge>
          )}
        </div>
        {unreadCount > 0 && (
          <Button variant="ghost" onClick={markAllRead} className="gap-2 shrink-0 text-sm">
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <Card className="flex flex-col items-center gap-3 py-14 text-center">
          <BellOff className="h-10 w-10 text-neutral-300" />
          <p className="font-medium text-neutral-700">All caught up</p>
          <p className="text-sm text-neutral-400">
            No new notifications. We&apos;ll ping you when something interesting happens.
          </p>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => (
            <button
              key={n.id}
              onClick={() => markRead(n.id)}
              className={`w-full text-left rounded-2xl border transition ${
                n.read
                  ? "border-neutral-100 bg-white"
                  : "border-neutral-200 bg-neutral-50 shadow-sm"
              }`}
            >
              <div className="flex items-start gap-3 p-4">
                <div className="mt-1 shrink-0">
                  {n.read ? (
                    <Bell className="h-4 w-4 text-neutral-300" />
                  ) : (
                    <Bell className="h-4 w-4 text-neutral-700" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-0.5">
                    <p className={`text-sm font-medium ${n.read ? "text-neutral-500" : "text-neutral-900"}`}>
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="h-2 w-2 shrink-0 rounded-full bg-rose-500" />
                    )}
                  </div>
                  <p className="text-xs text-neutral-500 line-clamp-2">{n.body}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-xs text-neutral-400 whitespace-nowrap">{n.time}</p>
                  <Badge className={`mt-1 text-xs ${TYPE_COLORS[n.type]}`}>{n.type}</Badge>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
