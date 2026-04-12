"use client";

import Link from "next/link";
import {
  Check,
  Crown,
  ExternalLink,
  Lock,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

const TIER_LABELS: Record<string, string> = {
  guest: "Guest",
  registered_free: "Free",
  paid_private: "Private Seller",
  dealer: "Dealer",
};

const CURRENT_FEATURES: Record<string, string[]> = {
  guest: [
    "Browse all public listings",
    "Standalone car valuation tool",
  ],
  registered_free: [
    "Browse all listings",
    "See deal ratings on every car",
    "Save favourites",
    "Create price alerts",
    "1 free listing per month",
    "Push notifications",
  ],
  paid_private: [
    "Everything in Free",
    "Up to 3 listings per month",
    "Registration card scanning",
    "VIN enrichment for listings",
    "Priority listing placement",
  ],
  dealer: [
    "Everything in Private",
    "Unlimited listings",
    "Dealer analytics dashboard",
    "Team management (up to 5 seats)",
    "CSV bulk import",
    "Branded showroom profile",
    "Post on behalf of car owners",
    "Priority support",
  ],
};

const UPGRADE_PATHS: Record<string, { label: string; price: string; href: string; color: string } | null> = {
  guest: { label: "Create free account", price: "Free", href: "/register", color: "bg-neutral-900 text-white" },
  registered_free: { label: "Upgrade to Private", price: "100 QAR / month", href: "/pricing", color: "bg-blue-600 text-white" },
  paid_private: { label: "Upgrade to Dealer", price: "1,000 QAR / month", href: "/pricing", color: "bg-amber-500 text-white" },
  dealer: null,
};

const INVOICES = [
  { date: "Apr 2026", plan: "Dealer", amount: "1,000 QAR", status: "Paid" },
  { date: "Mar 2026", plan: "Dealer", amount: "1,000 QAR", status: "Paid" },
  { date: "Feb 2026", plan: "Private", amount: "100 QAR", status: "Paid" },
];

export default function SubscriptionPage() {
  const user = useAuthStore((s) => s.user);
  const tier = useAuthStore((s) => s.tier());
  const token = useAuthStore((s) => s.accessToken);

  const currentFeatures = CURRENT_FEATURES[tier] ?? CURRENT_FEATURES.guest;
  const upgrade = UPGRADE_PATHS[tier];
  const tierLabel = TIER_LABELS[tier] ?? "Guest";

  if (!token || !user) {
    return (
      <section className="mx-auto max-w-2xl space-y-6 py-6">
        <h1 className="text-2xl font-semibold">Subscription & billing</h1>
        <Card className="flex flex-col items-center gap-4 py-16 text-center">
          <Lock className="h-10 w-10 text-neutral-300" />
          <p className="font-semibold text-neutral-700">Sign in to manage your subscription</p>
          <div className="flex gap-2">
            <Link href="/login"><Button>Sign in</Button></Link>
            <Link href="/register"><Button variant="secondary">Create free account</Button></Link>
          </div>
        </Card>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-2xl space-y-6 py-6">
      <h1 className="text-2xl font-semibold">Subscription &amp; billing</h1>

      {/* current plan card */}
      <Card className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-neutral-400">Current plan</p>
            <div className="mt-1 flex items-center gap-2">
              {tier === "dealer" && <Crown className="h-5 w-5 text-amber-500" />}
              {tier === "paid_private" && <Sparkles className="h-5 w-5 text-blue-500" />}
              {tier === "registered_free" && <Zap className="h-5 w-5 text-neutral-400" />}
              <h2 className="text-xl font-bold">{tierLabel}</h2>
            </div>
            {tier === "dealer" && (
              <p className="mt-0.5 text-sm text-neutral-500">1,000 QAR / month · renews automatically</p>
            )}
            {tier === "paid_private" && (
              <p className="mt-0.5 text-sm text-neutral-500">100 QAR / month · renews automatically</p>
            )}
            {tier === "registered_free" && (
              <p className="mt-0.5 text-sm text-neutral-500">Free forever · 1 listing / month included</p>
            )}
            {tier === "guest" && (
              <p className="mt-0.5 text-sm text-neutral-500">Browse only · sign up to unlock more</p>
            )}
          </div>
          <Badge className={
            tier === "dealer" ? "bg-amber-100 text-amber-700" :
            tier === "paid_private" ? "bg-blue-100 text-blue-700" :
            "bg-neutral-100 text-neutral-600"
          }>
            {tierLabel}
          </Badge>
        </div>

        {/* what's included */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-neutral-400">What&apos;s included</p>
          <ul className="space-y-1.5">
            {currentFeatures.map((f) => (
              <li key={f} className="flex items-start gap-2 text-sm text-neutral-700">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        {/* upgrade CTA */}
        {upgrade && (
          <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-4">
            <p className="text-sm font-semibold text-neutral-800">Ready to unlock more?</p>
            <p className="mt-0.5 text-xs text-neutral-500">{upgrade.price}</p>
            <Link href={upgrade.href} className="mt-3 block">
              <Button className={`w-full ${upgrade.color}`}>{upgrade.label}</Button>
            </Link>
          </div>
        )}

        {tier === "dealer" && (
          <div className="rounded-2xl border border-amber-100 bg-amber-50 p-4 text-sm text-amber-800">
            You&apos;re on our top-tier Dealer plan. Contact support to manage your subscription or add more team seats.
          </div>
        )}
      </Card>

      {/* usage overview */}
      {(tier === "registered_free" || tier === "paid_private") && (
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">This month&apos;s usage</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Listings posted</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">
                0 / {tier === "paid_private" ? 3 : 1}
              </p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3">
              <p className="text-xs text-neutral-500">Resets</p>
              <p className="mt-1 text-2xl font-bold text-neutral-900">1 May</p>
            </div>
          </div>
        </Card>
      )}

      {/* dealer stats */}
      {tier === "dealer" && (
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Dealer account</p>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-neutral-50 p-3 text-center">
              <p className="text-xs text-neutral-500">Listings</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">∞</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3 text-center">
              <p className="text-xs text-neutral-500">Team seats</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">5</p>
            </div>
            <div className="rounded-xl bg-neutral-50 p-3 text-center">
              <p className="text-xs text-neutral-500">CSV import</p>
              <p className="mt-1 text-xl font-bold text-neutral-900">✓</p>
            </div>
          </div>
          <Link href="/dealer">
            <Button variant="secondary" className="w-full gap-2">
              <Users className="h-4 w-4" /> Go to dealer dashboard
            </Button>
          </Link>
        </Card>
      )}

      {/* billing history — stub */}
      {tier !== "guest" && tier !== "registered_free" && (
        <Card className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-neutral-400">Billing history</p>
          <div className="divide-y divide-neutral-100">
            {INVOICES.map((inv, i) => (
              <div key={i} className="flex items-center justify-between py-2.5 text-sm">
                <div>
                  <p className="font-medium">{inv.plan} plan — {inv.date}</p>
                  <p className="text-xs text-neutral-500">{inv.amount}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-50 text-emerald-700">{inv.status}</Badge>
                  <button className="text-neutral-400 hover:text-neutral-700">
                    <ExternalLink className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-neutral-400">
            Full invoice PDFs are sent to your registered email address.
          </p>
        </Card>
      )}

      {/* links */}
      <div className="flex flex-wrap gap-4 text-sm text-neutral-400">
        <Link href="/pricing" className="hover:text-neutral-700">Compare all plans →</Link>
        <Link href="/profile" className="hover:text-neutral-700">Edit profile →</Link>
        <a href="mailto:support@mzadcars.qa" className="hover:text-neutral-700">Contact support →</a>
      </div>
    </section>
  );
}
