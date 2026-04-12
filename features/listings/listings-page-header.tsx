"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

const CHIPS = [
  { label: "Great Deal",      param: "deals",     value: "1"    },
  { label: "Price Drops",     param: "sort",      value: "price_asc"  },
  { label: "Lowest KM",       param: "sort",      value: "km_asc"     },
  { label: "Hidden Gems",     param: "sort",      value: "discount_pct_desc" },
  { label: "Newest",          param: "sort",      value: "year_desc"  },
];

export function ListingsPageHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const make      = searchParams.get("make") ?? "";
  const city      = searchParams.get("city") ?? "";
  const dealsOnly = searchParams.get("deals") === "1";

  // Dynamic subtitle
  const parts: string[] = [];
  if (make) parts.push(`${make} listings`);
  if (city) parts.push(`in ${city}`);
  if (dealsOnly) parts.push("great deals");

  function toggleChip(param: string, value: string) {
    const p = new URLSearchParams(searchParams.toString());
    const current = p.get(param);
    if (current === value) {
      p.delete(param);
    } else {
      p.set(param, value);
    }
    router.push(`/listings?${p.toString()}`);
  }

  function isActive(param: string, value: string) {
    return searchParams.get(param) === value;
  }

  return (
    <div className="space-y-3">
      <div>
        <h1 className="text-2xl font-semibold md:text-3xl">Browse cars</h1>
        <p className="mt-0.5 text-sm text-neutral-500">
          {parts.length > 0
            ? parts.join(" · ")
            : "All makes · Qatar"}
        </p>
      </div>

      <div className="hide-scrollbar flex gap-2 overflow-x-auto pb-1">
        {CHIPS.map(({ label, param, value }) => {
          const active = isActive(param, value);
          return (
            <button
              key={label}
              onClick={() => toggleChip(param, value)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-sm font-medium transition",
                active
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-400"
              )}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
