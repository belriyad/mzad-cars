"use client";

import Link from "next/link";
import { Check, HelpCircle, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuthStore } from "@/store/auth-store";

const plans = [
  {
    id: "guest",
    name: "Guest",
    price: "Free",
    sub: "Forever",
    features: [
      { label: "Browse all listings", yes: true },
      { label: "See deal ratings", yes: false },
      { label: "Save favorites", yes: false },
      { label: "Create price alerts", yes: false },
      { label: "Post listings", yes: false },
      { label: "Car valuation tool", yes: false },
      { label: "Analytics & insights", yes: false },
    ],
    cta: "Browse now",
    href: "/listings",
    popular: false,
  },
  {
    id: "paid_private",
    name: "Private Seller",
    price: "100 QAR",
    sub: "per month",
    features: [
      { label: "Browse all listings", yes: true },
      { label: "See deal ratings", yes: true },
      { label: "Save favorites", yes: true },
      { label: "Create price alerts", yes: true },
      { label: "Post up to 3 listings/mo", yes: true },
      { label: "Car valuation tool", yes: true },
      { label: "Analytics & insights", yes: false },
    ],
    cta: "Get started",
    href: "/subscription",
    popular: true,
  },
  {
    id: "dealer",
    name: "Dealer",
    price: "1,000 QAR",
    sub: "per month",
    features: [
      { label: "Browse all listings", yes: true },
      { label: "See deal ratings", yes: true },
      { label: "Save favorites", yes: true },
      { label: "Create price alerts", yes: true },
      { label: "Unlimited listings", yes: true },
      { label: "Car valuation tool", yes: true },
      { label: "Analytics & insights", yes: true },
    ],
    extras: ["Team management", "CSV bulk import", "Branded showroom profile", "Priority support"],
    cta: "Contact sales",
    href: "/subscription",
    popular: false,
  },
];

const FAQS = [
  {
    q: "Can I cancel at any time?",
    a: "Yes — subscriptions are month-to-month with no lock-in. Cancel from your profile page before the next billing cycle.",
  },
  {
    q: "What counts as a listing?",
    a: "Each live car ad counts as one listing. Drafts and expired ads do not count toward your monthly quota.",
  },
  {
    q: "How are deal ratings calculated?",
    a: "Our engine compares your car's price against recent sold prices for the same make, model, year, and mileage band. Listings priced below market earn a deal badge automatically.",
  },
  {
    q: "Is there a free trial for the Dealer plan?",
    a: "Yes — contact our sales team and we will set up a 14-day free trial for qualifying showrooms.",
  },
];

export default function PricingPage() {
  const tier = useAuthStore((s) => s.tier());

  return (
    <div className="space-y-10">
      {/* header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">Simple, transparent pricing</h1>
        <p className="text-neutral-500 max-w-md mx-auto">
          Whether you are a first-time seller or a professional showroom, there is a plan built for you.
        </p>
      </div>

      {/* plan cards */}
      <div className="grid gap-4 md:grid-cols-3 items-start">
        {plans.map((plan) => {
          const isCurrent = tier === plan.id;
          return (
            <Card
              key={plan.id}
              className={`relative space-y-5 ${
                plan.popular
                  ? "border-2 border-neutral-800 shadow-lg"
                  : "border border-neutral-100"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-neutral-800 text-white text-xs px-3">Most popular</Badge>
                </div>
              )}
              {isCurrent && (
                <div className="absolute -top-3 right-4">
                  <Badge className="bg-emerald-600 text-white text-xs px-3">Current plan</Badge>
                </div>
              )}

              <div>
                <h2 className="text-xl font-bold">{plan.name}</h2>
                <div className="mt-1 flex items-baseline gap-1">
                  <span className="text-2xl font-extrabold">{plan.price}</span>
                  <span className="text-sm text-neutral-400">{plan.sub}</span>
                </div>
              </div>

              <ul className="space-y-2">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-center gap-2 text-sm">
                    {f.yes ? (
                      <Check className="h-4 w-4 text-emerald-500 shrink-0" />
                    ) : (
                      <X className="h-4 w-4 text-neutral-300 shrink-0" />
                    )}
                    <span className={f.yes ? "text-neutral-700" : "text-neutral-400"}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.extras && (
                <div className="rounded-xl bg-amber-50 p-3 space-y-1">
                  <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">
                    Also included
                  </p>
                  {plan.extras.map((e) => (
                    <p key={e} className="flex items-center gap-2 text-xs text-amber-800">
                      <Check className="h-3.5 w-3.5 shrink-0" /> {e}
                    </p>
                  ))}
                </div>
              )}

              <Link href={plan.href} className="block">
                <Button
                  className="w-full"
                  variant={plan.popular ? "premium" : "default"}
                  disabled={isCurrent}
                >
                  {isCurrent ? "Active" : plan.cta}
                </Button>
              </Link>
            </Card>
          );
        })}
      </div>

      {/* feature comparison note */}
      <div className="rounded-2xl border border-neutral-100 bg-neutral-50 p-5 text-sm text-neutral-600 text-center">
        All plans include access to the full listing catalogue, photo galleries, and seller contact info.
        Upgrade at any time — changes take effect immediately.
      </div>

      {/* FAQ */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-neutral-400" /> Frequently asked questions
        </h2>
        <div className="space-y-3">
          {FAQS.map((faq) => (
            <Card key={faq.q} className="space-y-1.5">
              <p className="font-medium text-neutral-800">{faq.q}</p>
              <p className="text-sm text-neutral-500">{faq.a}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
