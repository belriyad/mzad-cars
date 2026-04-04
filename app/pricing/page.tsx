"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Lock,
  Sparkles,
  TrendingDown,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

// ── Plan data ────────────────────────────────────────────────────────────────

type Feature = { label: string; guest: string | boolean; paid_private: string | boolean; dealer: string | boolean; highlight?: boolean };

const FEATURES: Feature[] = [
  { label: "Browse all listings",        guest: true,         paid_private: true,            dealer: true },
  { label: "See deal ratings",           guest: false,        paid_private: true,            dealer: true,            highlight: true },
  { label: "Price vs market gauge",      guest: false,        paid_private: true,            dealer: true,            highlight: true },
  { label: "Similar cars panel",         guest: false,        paid_private: true,            dealer: true,            highlight: true },
  { label: "Save favorites",             guest: false,        paid_private: true,            dealer: true },
  { label: "Price drop alerts",          guest: false,        paid_private: true,            dealer: true },
  { label: "Instant car valuation",      guest: false,        paid_private: true,            dealer: true,            highlight: true },
  { label: "Post listings",             guest: false,        paid_private: "Up to 3 / mo",  dealer: "Unlimited" },
  { label: "Analytics & market pulse",   guest: false,        paid_private: false,           dealer: true },
  { label: "Team seats",                guest: false,        paid_private: false,           dealer: "Up to 5" },
  { label: "CSV bulk import",            guest: false,        paid_private: false,           dealer: true },
  { label: "Branded showroom profile",   guest: false,        paid_private: false,           dealer: true },
  { label: "Priority support",           guest: false,        paid_private: false,           dealer: true },
];

const PLANS = [
  { key: "guest",        name: "Browse",         price: null,     sub: "Free forever",  tier: "guest",        color: "neutral", popular: false },
  { key: "paid_private", name: "Private",        price: 100,      sub: "QAR / month",   tier: "paid_private", color: "blue",    popular: true  },
  { key: "dealer",       name: "Dealer",         price: 1_000,    sub: "QAR / month",   tier: "dealer",       color: "amber",   popular: false },
] as const;

const SOCIAL_PROOF = [
  { stat: "10,000+", label: "live listings" },
  { stat: "4.8 / 5",  label: "avg listing quality" },
  { stat: "500+",     label: "verified dealers" },
  { stat: "< 2 min",  label: "avg time to get a valuation" },
];

const FAQS = [
  { q: "Can I cancel at any time?", a: "Yes — subscriptions are month-to-month with no lock-in. Cancel from your profile page before the next billing cycle." },
  { q: "What counts as a listing?", a: "Each live car ad counts as one listing. Drafts and expired ads do not count toward your monthly quota." },
  { q: "How are deal ratings calculated?", a: "Our engine compares each listing against recent sold prices for the same make, model, year, and mileage band. Listings priced below market get a deal badge automatically — updated daily." },
  { q: "Is there a free trial for the Dealer plan?", a: "Yes — contact our sales team and we will set up a 14-day free trial for qualifying showrooms." },
  { q: "Can I upgrade mid-month?", a: "Absolutely. Upgrades take effect immediately and are pro-rated. Downgrades apply from the next billing cycle." },
];

// ── Sub-components ───────────────────────────────────────────────────────────

function Cell({ value }: { value: string | boolean }) {
  if (value === false)
    return <span className="flex justify-center"><span className="h-px w-4 rounded-full bg-neutral-300 inline-block mt-2.5" /></span>;
  if (value === true)
    return <span className="flex justify-center"><Check className="h-4 w-4 text-emerald-500" /></span>;
  return <span className="flex justify-center text-xs font-medium text-neutral-700">{value}</span>;
}

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      onClick={() => setOpen(!open)}
      className="w-full rounded-2xl border border-neutral-100 bg-white p-4 text-left transition hover:border-neutral-200"
    >
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium text-neutral-800 text-sm">{q}</p>
        {open ? <ChevronUp className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" /> : <ChevronDown className="h-4 w-4 shrink-0 text-neutral-400 mt-0.5" />}
      </div>
      {open && <p className="mt-2 text-sm text-neutral-500 leading-relaxed">{a}</p>}
    </button>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const tier = useAuthStore((s) => s.tier());

  return (
    <div className="space-y-16">

      {/* ── hero ── */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs text-neutral-500">
          <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Trusted by thousands of buyers and sellers in Qatar
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl">
          Know the real price.<br className="hidden sm:block" /> Every time.
        </h1>
        <p className="mx-auto max-w-xl text-neutral-500 text-base">
          Our market engine compares every listing against thousands of real sales.
          Choose the plan that gives you the insight you need.
        </p>
      </div>

      {/* ── social proof strip ── */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {SOCIAL_PROOF.map(({ stat, label }) => (
          <div key={label} className="rounded-2xl border border-neutral-100 bg-neutral-50 px-4 py-3 text-center">
            <p className="text-2xl font-extrabold text-neutral-900">{stat}</p>
            <p className="mt-0.5 text-xs text-neutral-500">{label}</p>
          </div>
        ))}
      </div>

      {/* ── plan cards ── */}
      <div className="grid gap-4 md:grid-cols-3 items-start">
        {PLANS.map((plan) => {
          const isCurrent = tier === plan.tier;
          const isDealer = plan.key === "dealer";
          const isPrivate = plan.key === "paid_private";

          return (
            <div
              key={plan.key}
              className={`relative rounded-3xl border p-6 space-y-6 transition ${
                plan.popular
                  ? "border-neutral-900 bg-neutral-900 text-white shadow-2xl scale-[1.02]"
                  : "border-neutral-200 bg-white"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className="rounded-full bg-amber-400 px-3 py-1 text-xs font-bold text-neutral-900 shadow">
                    Most popular
                  </span>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3.5 right-5">
                  <span className="rounded-full bg-emerald-500 px-3 py-1 text-xs font-bold text-white shadow">
                    Your plan
                  </span>
                </div>
              )}

              <div>
                <p className={`text-xs font-semibold uppercase tracking-widest ${plan.popular ? "text-amber-400" : "text-neutral-400"}`}>
                  {plan.name}
                </p>
                <div className="mt-1 flex items-baseline gap-1.5">
                  {plan.price ? (
                    <>
                      <span className="text-4xl font-extrabold">{plan.price.toLocaleString()}</span>
                      <span className={`text-sm ${plan.popular ? "text-neutral-400" : "text-neutral-400"}`}>{plan.sub}</span>
                    </>
                  ) : (
                    <span className="text-4xl font-extrabold">Free</span>
                  )}
                </div>
              </div>

              {/* key perks */}
              <ul className="space-y-2.5 text-sm">
                {FEATURES.filter((f) => {
                  const val = f[plan.key as "guest" | "paid_private" | "dealer"];
                  return val !== false;
                }).slice(0, 6).map((f) => {
                  const val = f[plan.key as "guest" | "paid_private" | "dealer"];
                  return (
                    <li key={f.label} className={`flex items-center gap-2 ${plan.popular ? "text-neutral-200" : "text-neutral-700"}`}>
                      <Check className={`h-4 w-4 shrink-0 ${f.highlight ? "text-amber-400" : plan.popular ? "text-emerald-400" : "text-emerald-500"}`} />
                      <span>{typeof val === "string" ? val : f.label}</span>
                      {f.highlight && !plan.popular && (
                        <span className="ml-auto rounded-full bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-700">
                          Pro
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>

              <Link href={isDealer ? "/dealer-signup" : "/subscription"} className="block">
                <Button
                  className="w-full"
                  variant={plan.popular ? "premium" : isDealer ? "default" : "secondary"}
                  disabled={isCurrent}
                  size="lg"
                >
                  {isCurrent
                    ? "Current plan"
                    : isDealer
                    ? "Contact sales"
                    : plan.price
                    ? "Get started"
                    : "Browse now"}
                </Button>
              </Link>
            </div>
          );
        })}
      </div>

      {/* ── full feature comparison table ── */}
      <div>
        <h2 className="mb-5 text-xl font-bold text-neutral-900 text-center">Full feature comparison</h2>
        <div className="overflow-x-auto rounded-2xl border border-neutral-100">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50">
                <th className="py-3 pl-4 pr-2 text-left font-semibold text-neutral-600 w-1/2">Feature</th>
                {PLANS.map((p) => (
                  <th key={p.key} className={`px-3 py-3 text-center font-semibold ${p.popular ? "text-neutral-900" : "text-neutral-500"}`}>
                    {p.popular && <span className="mr-1 text-amber-500">★</span>}
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FEATURES.map((f, i) => (
                <tr
                  key={f.label}
                  className={`border-b border-neutral-50 transition ${
                    f.highlight ? "bg-amber-50/50" : i % 2 === 0 ? "bg-white" : "bg-neutral-50/40"
                  }`}
                >
                  <td className="py-3 pl-4 pr-2 text-neutral-700">
                    <span className="flex items-center gap-1.5">
                      {f.highlight && <Zap className="h-3.5 w-3.5 text-amber-500 shrink-0" />}
                      {f.label}
                    </span>
                  </td>
                  <td className="px-3 py-3"><Cell value={f.guest} /></td>
                  <td className="px-3 py-3"><Cell value={f.paid_private} /></td>
                  <td className="px-3 py-3"><Cell value={f.dealer} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── what you unlock callout ── */}
      <div className="rounded-3xl bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-8 text-white">
        <div className="grid gap-8 md:grid-cols-3">
          <div className="space-y-2">
            <div className="inline-flex rounded-xl bg-white/10 p-2.5">
              <TrendingDown className="h-5 w-5 text-emerald-400" />
            </div>
            <h3 className="font-semibold">Deal ratings on every listing</h3>
            <p className="text-sm text-neutral-400">
              See instantly whether a car is priced below, at, or above market — no
              guesswork, just data from thousands of real sales.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex rounded-xl bg-white/10 p-2.5">
              <Users className="h-5 w-5 text-blue-400" />
            </div>
            <h3 className="font-semibold">Peer comparison panel</h3>
            <p className="text-sm text-neutral-400">
              Every listing shows you the comparable cars our engine used to reach
              its verdict — so you can verify the logic yourself.
            </p>
          </div>
          <div className="space-y-2">
            <div className="inline-flex rounded-xl bg-white/10 p-2.5">
              <Sparkles className="h-5 w-5 text-amber-400" />
            </div>
            <h3 className="font-semibold">Instant valuation tool</h3>
            <p className="text-sm text-neutral-400">
              Enter make, model, year, and mileage — get a low/fair/high price band
              in seconds, with confidence score and live similar-car links.
            </p>
          </div>
        </div>
      </div>

      {/* ── FAQ ── */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-neutral-400" /> Common questions
        </h2>
        {FAQS.map((faq) => <FaqItem key={faq.q} {...faq} />)}
      </div>

      {/* ── bottom CTA ── */}
      <div className="rounded-3xl bg-neutral-50 border border-neutral-100 px-8 py-10 text-center space-y-4">
        <p className="text-sm text-neutral-500">Still not sure?</p>
        <h2 className="text-2xl font-bold text-neutral-900">Try the valuation tool for free</h2>
        <p className="text-sm text-neutral-500 max-w-sm mx-auto">
          Get an instant price estimate on the home page — no account needed. Upgrade when you are ready for full market intelligence.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <Link href="/"><Button size="lg" variant="default">Try free valuation</Button></Link>
          <Link href="/listings"><Button size="lg" variant="secondary">Browse deals</Button></Link>
        </div>
      </div>

    </div>
  );
}
