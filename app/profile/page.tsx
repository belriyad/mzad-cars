"use client";

import { useState } from "react";
import Link from "next/link";
import { Crown, Mail, MapPin, Pencil, Save, ShieldCheck, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

const TIER_LABELS: Record<string, string> = {
  guest: "Guest",
  registered_free: "Free",
  paid_private: "Private Seller",
  dealer: "Dealer",
};

const TIER_COLORS: Record<string, string> = {
  guest: "bg-neutral-100 text-neutral-500",
  registered_free: "bg-blue-100 text-blue-700",
  paid_private: "bg-purple-100 text-purple-700",
  dealer: "bg-amber-100 text-amber-700",
};

const CITIES = ["Doha", "Al Rayyan", "Al Wakrah", "Lusail", "Al Khor", "Umm Salal"];
const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "العربية" },
];

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier());

  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name ?? "");
  const [city, setCity] = useState("");
  const [language, setLanguage] = useState("en");

  if (!user) {
    return (
      <Card className="flex flex-col items-center gap-3 py-14 text-center">
        <User className="h-10 w-10 text-neutral-300" />
        <p className="font-medium">You are not logged in</p>
        <Link href="/login">
          <Button>Sign in</Button>
        </Link>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* header */}
      <div>
        <h1 className="text-2xl font-semibold">My profile</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          Manage your account details, preferences, and subscription.
        </p>
      </div>

      {/* identity card */}
      <Card className="flex flex-wrap items-center gap-4">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-2xl font-bold text-neutral-700">
          {(user.full_name ?? user.email ?? "?")[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-lg font-semibold text-neutral-900 truncate">
            {user.full_name ?? "Anonymous"}
          </p>
          {user.email && (
            <p className="flex items-center gap-1 text-sm text-neutral-500">
              <Mail className="h-3.5 w-3.5" /> {user.email}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge className={`${TIER_COLORS[tier]} text-xs`}>
            <Crown className="mr-1 h-3 w-3" /> {TIER_LABELS[tier] ?? tier}
          </Badge>
          <Badge className="bg-neutral-100 text-neutral-500 text-xs">
            <ShieldCheck className="mr-1 h-3 w-3" /> {user.role}
          </Badge>
        </div>
      </Card>

      {/* edit section */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-neutral-800">Account details</h2>
          <button
            onClick={() => setEditing((v) => !v)}
            className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-800 transition"
          >
            <Pencil className="h-3.5 w-3.5" /> {editing ? "Cancel" : "Edit"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Full name</label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={!editing}
              placeholder="Your full name"
            />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Email</label>
            <Input value={user.email ?? ""} disabled placeholder="Email" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">City</label>
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              disabled={!editing}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              <option value="">Select city</option>
              {CITIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-neutral-500">Language</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              disabled={!editing}
              className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-neutral-300 disabled:bg-neutral-50 disabled:text-neutral-400"
            >
              {LANGUAGES.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>
        </div>

        {editing && (
          <Button className="gap-2">
            <Save className="h-4 w-4" /> Save changes
          </Button>
        )}
      </Card>

      {/* subscription card */}
      <Card className="flex flex-wrap items-center justify-between gap-4 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="flex items-center gap-3">
          <Crown className="h-6 w-6 text-amber-500" />
          <div>
            <p className="font-semibold">
              {TIER_LABELS[tier] ?? tier} plan
            </p>
            <p className="text-xs text-neutral-500">
              {tier === "guest"
                ? "Sign in to unlock listings and alerts."
                : tier === "registered_free"
                ? "Upgrade to post listings and track valuations."
                : tier === "paid_private"
                ? "Post up to 3 listings/month with deal badges."
                : "Unlimited listings, analytics, team management, and CSV import."}
            </p>
          </div>
        </div>
        {(tier === "guest" || tier === "registered_free") && (
          <Link href="/pricing">
            <Button variant="premium" className="shrink-0">Upgrade</Button>
          </Link>
        )}
        {tier === "paid_private" && (
          <Link href="/pricing">
            <Button variant="premium" className="shrink-0">Go Dealer</Button>
          </Link>
        )}
      </Card>

      {/* location tip */}
      <p className="flex items-center gap-1.5 text-xs text-neutral-400">
        <MapPin className="h-3.5 w-3.5" />
        Setting your city helps show relevant nearby listings on the home screen.
      </p>
    </div>
  );
}
