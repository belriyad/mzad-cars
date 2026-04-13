import Link from "next/link";
import { ArrowRight, CarFront, MessageCircle, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { WHATSAPP_LISTING_MESSAGE, WHATSAPP_LISTING_NUMBER } from "@/lib/constants";
import { CarWorthWidget } from "@/features/home/car-worth-widget";
import { InstantOfferWidget } from "@/features/home/instant-offer-widget";
import { TopDealsStrip } from "@/features/home/top-deals-strip";

export default function Home() {
  const whatsappHref = `https://wa.me/${WHATSAPP_LISTING_NUMBER}?text=${encodeURIComponent(WHATSAPP_LISTING_MESSAGE)}`;

  return (
    <section className="space-y-6">
      <Card className="overflow-hidden bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#1f2937] p-6 text-white md:p-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs">
          <Sparkles className="h-3.5 w-3.5" /> Sell smarter • Buy confidently
        </div>
        <h1 className="mt-4 max-w-2xl text-3xl font-semibold leading-tight md:text-5xl">
          Sell your car via WhatsApp in minutes. Find top deals instantly.
        </h1>
        <p className="mt-3 max-w-2xl text-sm text-neutral-200 md:text-base">
          Send your registration card and a few photos on WhatsApp. We guide listing setup for you. Buyers get premium browsing with market-aware deal insights.
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-2">
          <a href={whatsappHref} target="_blank" rel="noopener noreferrer" className="inline-flex">
            <Button variant="premium" size="lg" className="min-w-[190px]">
              List on WhatsApp <MessageCircle className="ml-1 h-4 w-4" />
            </Button>
          </a>
          <Link href="/listings" className="inline-flex">
            <Button variant="secondary" size="lg" className="min-w-[190px]">
              Browse top deals <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
          <Link href="/sell" className="inline-flex">
            <Button variant="ghost" size="lg" className="min-w-[190px] text-white hover:bg-white/10 hover:text-white">
              Advanced seller flow
            </Button>
          </Link>
        </div>

        <div className="mt-6 grid auto-rows-fr gap-3 md:grid-cols-3">
          <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-neutral-300">Live inventory</p>
            <p className="mt-1 text-2xl font-semibold">10k+</p>
          </div>
          <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-neutral-300">Avg. listing quality score</p>
            <p className="mt-1 text-2xl font-semibold">4.8/5</p>
          </div>
          <div className="flex h-full flex-col rounded-2xl border border-white/15 bg-white/5 p-3">
            <p className="text-xs text-neutral-300">Verified dealer network</p>
            <p className="mt-1 text-2xl font-semibold">500+</p>
          </div>
        </div>
      </Card>

      <div className="grid auto-rows-fr gap-3 md:grid-cols-3">
        <Card className="flex h-full flex-col">
          <div className="inline-flex rounded-xl bg-neutral-100 p-2"><MessageCircle className="h-4 w-4" /></div>
          <h2 className="mt-3 font-semibold">1) Message us on WhatsApp</h2>
          <p className="mt-2 text-sm text-neutral-600">Start with a quick message. No complicated setup or long forms to begin.</p>
        </Card>
        <Card className="flex h-full flex-col">
          <div className="inline-flex rounded-xl bg-neutral-100 p-2"><CarFront className="h-4 w-4" /></div>
          <h2 className="mt-3 font-semibold">2) Send registration + photos</h2>
          <p className="mt-2 text-sm text-neutral-600">Share your car registration card and clear images. We help structure the listing details.</p>
        </Card>
        <Card className="flex h-full flex-col">
          <div className="inline-flex rounded-xl bg-neutral-100 p-2"><ShieldCheck className="h-4 w-4" /></div>
          <h2 className="mt-3 font-semibold">3) Review and go live</h2>
          <p className="mt-2 text-sm text-neutral-600">After quick verification and quality checks, your listing goes live to serious buyers.</p>
        </Card>
      </div>

      <div className="grid items-stretch gap-4 lg:grid-cols-[1.1fr_1fr]">
        {/* min-w-0 stops the flex/grid child from growing past its allotted column */}
        <Card className="flex min-w-0 flex-col space-y-3 overflow-hidden">
          <div className="flex items-center gap-2 text-sm text-neutral-600">
            <TrendingUp className="h-4 w-4" />
            Top deals today
          </div>
          <h2 className="text-xl font-semibold">Best deals ranked by market percentage</h2>
          <p className="text-sm text-neutral-600">
            Discover listings that are priced below expected market range, prioritized by deal percentage.
          </p>
          <TopDealsStrip />
        </Card>

        <div className="grid gap-4 grid-rows-2">
          <InstantOfferWidget />
          <CarWorthWidget />
        </div>
      </div>
    </section>
  );
}
