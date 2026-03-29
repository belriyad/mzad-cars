import Link from "next/link";
import {
  BarChart2,
  CheckCircle2,
  FileSpreadsheet,
  MessageCircle,
  ShieldCheck,
  Star,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const FEATURES = [
  {
    icon: BarChart2,
    title: "Real-time analytics",
    desc: "Track views, leads, and click-through rates for every listing. See which cars get traction.",
    color: "bg-emerald-50 text-emerald-700",
  },
  {
    icon: FileSpreadsheet,
    title: "Bulk CSV import",
    desc: "Upload your entire stock in one go. Our validator catches errors before anything goes live.",
    color: "bg-amber-50 text-amber-700",
  },
  {
    icon: Users,
    title: "Team management",
    desc: "Add agents and managers with role-based permissions. Everyone works in the same dashboard.",
    color: "bg-purple-50 text-purple-700",
  },
  {
    icon: TrendingUp,
    title: "Deal intelligence badges",
    desc: "Every listing automatically gets a market comparison badge. Underpriced cars attract 3× more leads.",
    color: "bg-blue-50 text-blue-700",
  },
  {
    icon: Zap,
    title: "Unlimited listings",
    desc: "No monthly cap. Post your full inventory and refresh it as often as you need.",
    color: "bg-rose-50 text-rose-700",
  },
  {
    icon: MessageCircle,
    title: "WhatsApp-ready listings",
    desc: "Every car page has a one-tap WhatsApp button so buyers reach you instantly.",
    color: "bg-teal-50 text-teal-700",
  },
];

const STEPS = [
  { n: "1", title: "Create your dealer account", desc: "Sign up in under two minutes. No paperwork, no upfront fees." },
  { n: "2", title: "Set up your showroom profile", desc: "Add your logo, contact details, branch location, and a short description." },
  { n: "3", title: "Upload your inventory", desc: "Import via CSV or add cars one at a time. Photos, specs, and pricing in one form." },
  { n: "4", title: "Go live and get leads", desc: "Your listings are live immediately. Buyers can call, WhatsApp, or save your cars." },
];

const TESTIMONIALS = [
  {
    name: "Ahmed Al-Mansoori",
    role: "Owner · Al Rayyan Motors",
    quote:
      "We moved 40% more cars the first month after switching to Mzad's dealer platform. The deal badge alone brings in buyers who are ready to purchase.",
  },
  {
    name: "Fatima Al-Kuwari",
    role: "Sales Manager · Gulf Premium Cars",
    quote:
      "The CSV import saved us hours every week. We upload Monday morning and everything is live before opening time.",
  },
  {
    name: "Khalid Hassan",
    role: "Founder · Doha AutoHub",
    quote:
      "Analytics finally showed us which models get the most views. We adjusted our buying decisions and our turnover improved significantly.",
  },
];

const PLANS = [
  {
    label: "Starter",
    price: "500 QAR",
    note: "/ month",
    items: ["Up to 50 active listings", "Deal intelligence badges", "Analytics dashboard", "Email support"],
    cta: "Get started",
    highlight: false,
  },
  {
    label: "Professional",
    price: "1,000 QAR",
    note: "/ month",
    items: [
      "Unlimited listings",
      "Deal intelligence badges",
      "Full analytics + CSV import",
      "Team management (5 seats)",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    label: "Enterprise",
    price: "Custom",
    note: "",
    items: [
      "Everything in Professional",
      "Unlimited team seats",
      "Dedicated account manager",
      "Custom integrations & API access",
      "SLA guarantee",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

export default function DealerSignupPage() {
  return (
    <div className="space-y-16">
      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1e3a5f] px-8 py-14 text-white md:px-14">
        <Badge className="mb-4 border border-white/20 bg-white/10 text-white">
          <Star className="mr-1 h-3 w-3" /> Trusted by 500+ Qatar dealers
        </Badge>
        <h1 className="max-w-2xl text-3xl font-bold leading-tight md:text-5xl">
          Sell more cars with Qatar&apos;s smartest dealer platform
        </h1>
        <p className="mt-4 max-w-xl text-neutral-300">
          Unlimited listings, real-time analytics, bulk import, and market-aware deal badges — everything your showroom needs in one dashboard.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/register">
            <Button variant="premium" size="lg" className="min-w-[200px]">
              Start free trial
            </Button>
          </Link>
          <Link href="/pricing">
            <Button
              variant="ghost"
              size="lg"
              className="min-w-[160px] border border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              See pricing
            </Button>
          </Link>
        </div>
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-4">
          {[
            { stat: "500+", label: "Active dealers" },
            { stat: "40k+", label: "Listings this month" },
            { stat: "3×", label: "More leads with deal badge" },
            { stat: "14 days", label: "Free trial, no card needed" },
          ].map(({ stat, label }) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-2xl font-bold">{stat}</p>
              <p className="mt-0.5 text-xs text-neutral-400">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features grid ───────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Everything your showroom needs</h2>
          <p className="mt-2 text-neutral-500">
            Purpose-built for Qatar&apos;s car market — not a generic listing platform.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, desc, color }) => (
            <Card key={title} className="flex gap-4">
              <span className={`mt-0.5 shrink-0 rounded-xl p-2.5 ${color}`}>
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="font-semibold">{title}</p>
                <p className="mt-1 text-sm text-neutral-500">{desc}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold">Get live in under an hour</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {STEPS.map(({ n, title, desc }) => (
            <div key={n} className="flex flex-col gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-neutral-900 text-sm font-bold text-white">
                {n}
              </div>
              <p className="font-semibold">{title}</p>
              <p className="text-sm text-neutral-500">{desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Deal intelligence callout ────────────────────────────────────── */}
      <Card className="flex flex-wrap items-center justify-between gap-6 bg-gradient-to-br from-emerald-50 to-teal-50 p-8">
        <div className="flex items-start gap-4">
          <span className="rounded-2xl bg-emerald-100 p-3 text-emerald-700">
            <TrendingUp className="h-6 w-6" />
          </span>
          <div>
            <h3 className="text-xl font-bold">Automatic deal intelligence</h3>
            <p className="mt-1 max-w-md text-neutral-600">
              Our pricing engine compares every listing against recent sold prices for the same make, model, year, and mileage. Listings priced below market automatically earn a{" "}
              <span className="font-semibold text-emerald-700">% below market</span> badge — the single biggest driver of lead volume on the platform.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge className="bg-emerald-100 text-emerald-800">12.3% below market</Badge>
              <Badge className="bg-emerald-100 text-emerald-800">Great deal</Badge>
              <Badge className="bg-neutral-100 text-neutral-600">Fair price</Badge>
            </div>
          </div>
        </div>
        <ShieldCheck className="h-16 w-16 shrink-0 text-emerald-200" />
      </Card>

      {/* ── Testimonials ────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <h2 className="text-center text-2xl font-bold">What Qatar dealers say</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map(({ name, role, quote }) => (
            <Card key={name} className="flex flex-col gap-4 bg-neutral-50">
              <p className="text-sm leading-relaxed text-neutral-700">&ldquo;{quote}&rdquo;</p>
              <div className="mt-auto flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-neutral-200 font-semibold text-neutral-700">
                  {name[0]}
                </div>
                <div>
                  <p className="text-sm font-semibold">{name}</p>
                  <p className="text-xs text-neutral-500">{role}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Pricing ─────────────────────────────────────────────────────── */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Simple dealer pricing</h2>
          <p className="mt-2 text-neutral-500">No hidden fees. Cancel any time.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3 items-start">
          {PLANS.map((plan) => (
            <Card
              key={plan.label}
              className={`space-y-5 ${
                plan.highlight ? "border-2 border-neutral-900 shadow-xl" : ""
              }`}
            >
              {plan.highlight && (
                <div className="flex justify-center">
                  <Badge className="-mt-8 bg-neutral-900 text-white px-4">Most popular</Badge>
                </div>
              )}
              <div>
                <p className="text-sm text-neutral-500">{plan.label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                  <span className="text-3xl font-extrabold">{plan.price}</span>
                  {plan.note && <span className="text-sm text-neutral-400">{plan.note}</span>}
                </div>
              </div>
              <ul className="space-y-2">
                {plan.items.map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <Link href="/register" className="block">
                <Button
                  className="w-full"
                  variant={plan.highlight ? "premium" : "default"}
                >
                  {plan.cta}
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      </div>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <div className="rounded-3xl bg-neutral-900 px-8 py-12 text-center text-white">
        <h2 className="text-2xl font-bold md:text-3xl">
          Ready to grow your showroom?
        </h2>
        <p className="mt-3 text-neutral-400">
          Join 500+ Qatar dealers already using Mzad Cars. Start your 14-day free trial — no credit card required.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/register">
            <Button variant="premium" size="lg" className="min-w-[200px]">
              Start free trial
            </Button>
          </Link>
          <a
            href="https://wa.me/97455551234?text=Hi%2C%20I%27d%20like%20to%20learn%20more%20about%20the%20Dealer%20plan"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              variant="ghost"
              size="lg"
              className="min-w-[200px] border border-white/20 text-white hover:bg-white/10 hover:text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" /> Chat with sales
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
