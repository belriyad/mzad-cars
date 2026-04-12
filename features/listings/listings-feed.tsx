"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { listingsService } from "@/services/listings.service";
import { ListingCard } from "@/components/listings/listing-card";
import { useEntitlement } from "@/hooks/use-entitlement";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { Listing } from "@/types/domain";

const PAGE_SIZE = 20;

/** Inline debounce — returns value only after `delay` ms of no change */
function useDebounce<T>(value: T, delay = 400): T {
  const [debounced, setDebounced] = useState<T>(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

type SortOption = "discount_pct_desc" | "price_asc" | "price_desc" | "year_desc" | "km_asc";

const SORT_LABELS: Record<SortOption, string> = {
  discount_pct_desc: "Best Value",
  price_asc:         "Price: low → high",
  price_desc:        "Price: high → low",
  year_desc:         "Newest year",
  km_asc:            "Lowest KM",
};

export function ListingsFeed({
  initialDealsOnly,
}: {
  initialDealsOnly?: boolean;
} = {}) {
  const { entitlements } = useEntitlement();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sentinelRef = useRef<HTMLDivElement>(null);

  // ── Filter state — seeded from URL params on first render ─────────────────
  const [search, setSearch]       = useState(() => searchParams.get("q") ?? "");
  const [make, setMake]           = useState(() => searchParams.get("make") ?? "");
  const [className, setClassName] = useState(() => searchParams.get("class") ?? "");
  const [city, setCity]           = useState(() => searchParams.get("city") ?? "");
  const [dealsOnly, setDealsOnly] = useState(
    () => initialDealsOnly ?? searchParams.get("deals") === "1"
  );
  const [sortBy, setSortBy]       = useState<SortOption>(
    () => (searchParams.get("sort") as SortOption) ?? "discount_pct_desc"
  );
  const [minPrice, setMinPrice]   = useState(() => searchParams.get("min_price") ?? "");
  const [maxPrice, setMaxPrice]   = useState(() => searchParams.get("max_price") ?? "");
  const [minYear, setMinYear]     = useState(() => searchParams.get("min_year") ?? "");
  const [maxYear, setMaxYear]     = useState(() => searchParams.get("max_year") ?? "");
  const [minKm, setMinKm]         = useState(() => searchParams.get("min_km") ?? "");
  const [maxKm, setMaxKm]         = useState(() => searchParams.get("max_km") ?? "");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  // ── Infinite query — 20 per page ──────────────────────────────────────────
  // We pass make/city/deals_only/sort to the API.
  // search, class, ranges are applied client-side so the type dropdown
  // can always show all types for the selected make.
  const query = useInfiniteQuery({
    queryKey: ["listings-inf", { make, city, dealsOnly, sortBy }],
    queryFn: ({ pageParam = 0 }) =>
      listingsService.list({
        limit:      PAGE_SIZE,
        // cursor-style offset — backend uses limit+offset via query string
        // we pass a synthetic `offset` param; service passes it through
        ...(pageParam > 0 ? { offset: pageParam } : {}),
        make:       make || undefined,
        city:       city || undefined,
        deals_only: dealsOnly ? "1" : undefined,
        sort:       sortBy,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      // If the last page returned a full page, there may be more
      if (lastPage.rows.length < PAGE_SIZE) return undefined;
      return allPages.reduce((sum, p) => sum + p.rows.length, 0);
    },
    placeholderData: (prev) => prev,
    staleTime: 30_000,
  });

  // ── Flatten all fetched rows — deduplicate by product_id ─────────────────
  // The backend may return the same listing across offset pages, so we use a
  // Map to keep only the first occurrence of each product_id.
  const allFetchedRows = useMemo<Listing[]>(() => {
    const seen = new Map<string, Listing>();
    for (const page of query.data?.pages ?? []) {
      for (const row of page.rows) {
        if (!seen.has(row.product_id)) seen.set(row.product_id, row);
      }
    }
    return Array.from(seen.values());
  }, [query.data?.pages]);

  // Merge metadata from all pages (makes/cities/classes are returned by every page)
  const meta = query.data?.pages[0];

  // ── Derived: available body types for the selected make ───────────────────
  const availableClasses = useMemo(() => {
    if (!make) return meta?.classes ?? [];
    const seen = new Set<string>();
    for (const r of allFetchedRows) {
      if (r.make === make && r.class_name) seen.add(r.class_name);
    }
    return Array.from(seen).sort();
  }, [allFetchedRows, meta?.classes, make]);

  // Reset class selection when it's no longer valid for the new make
  useEffect(() => {
    if (className && availableClasses.length > 0 && !availableClasses.includes(className)) {
      setClassName("");
    }
  }, [availableClasses, className]);

  // ── Client-side narrowing: search + class + ranges ────────────────────────
  const rows = useMemo(() => {
    const q = debouncedSearch.toLowerCase().trim();
    return allFetchedRows.filter((r) => {
      if (q) {
        const hay = `${r.title} ${r.make} ${r.model ?? ""} ${r.class_name ?? ""}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (className && r.class_name !== className) return false;
      if (minPrice && r.price_qar < Number(minPrice)) return false;
      if (maxPrice && r.price_qar > Number(maxPrice)) return false;
      if (minYear && (r.manufacture_year ?? 0) < Number(minYear)) return false;
      if (maxYear && (r.manufacture_year ?? 0) > Number(maxYear)) return false;
      if (minKm && (r.km ?? 0) < Number(minKm)) return false;
      if (maxKm && (r.km ?? 0) > Number(maxKm)) return false;
      return true;
    });
  }, [allFetchedRows, debouncedSearch, className, minPrice, maxPrice, minYear, maxYear, minKm, maxKm]);

  // ── IntersectionObserver — fires when sentinel enters viewport ────────────
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && query.hasNextPage && !query.isFetchingNextPage) {
          query.fetchNextPage();
        }
      },
      { rootMargin: "200px" } // start fetching 200px before the bottom
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [query.hasNextPage, query.isFetchingNextPage, query.fetchNextPage]);

  function resetAll() {
    setSearch(""); setMake(""); setClassName(""); setCity("");
    setDealsOnly(false); setSortBy("discount_pct_desc");
    setMinPrice(""); setMaxPrice(""); setMinYear(""); setMaxYear(""); setMinKm(""); setMaxKm("");
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  const isFirstLoad = query.isLoading && !query.data;

  if (isFirstLoad) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="h-72 animate-pulse bg-neutral-100" />
        ))}
      </div>
    );
  }

  if (query.isError && !query.data) {
    return <Card className="text-sm text-red-600">Failed to load listings. Please try again.</Card>;
  }

  const orderedIds = rows.map((r) => r.product_id).join(",");
  const backUrl = typeof window !== "undefined" ? window.location.href : "/listings";

  return (
    <div className="space-y-4">
      {/* ── Sticky filter bar ── */}
      <Card className="sticky top-[66px] z-20 space-y-3 border-neutral-200/90 bg-white/90 backdrop-blur-xl">
        {/* primary row */}
        <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
          <Input
            placeholder="Search make, model, title…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="sm:col-span-2 md:col-span-1"
          />
          <select
            value={make}
            onChange={(e) => { setMake(e.target.value); setClassName(""); }}
            className="h-11 rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          >
            <option value="">All makes</option>
            {(meta?.makes ?? []).map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
          <select
            value={className}
            onChange={(e) => setClassName(e.target.value)}
            className="h-11 rounded-2xl border border-neutral-200 bg-white px-3 text-sm disabled:opacity-40"
            disabled={availableClasses.length === 0}
          >
            <option value="">{make ? `All ${make} types` : "All types"}</option>
            {availableClasses.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <select
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="h-11 rounded-2xl border border-neutral-200 bg-white px-3 text-sm"
          >
            <option value="">All cities</option>
            {(meta?.cities ?? []).map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        {/* sort + toggles row */}
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="h-9 rounded-xl border border-neutral-200 bg-white px-3 text-sm"
          >
            {(Object.entries(SORT_LABELS) as [SortOption, string][]).map(([k, v]) => (
              <option key={k} value={k}>Sort: {v}</option>
            ))}
          </select>
          <Button variant="ghost" size="sm" type="button" onClick={() => setShowAdvanced((v) => !v)}>
            {showAdvanced ? "Hide filters ↑" : "More filters ↓"}
          </Button>
          <Button variant="ghost" size="sm" type="button" onClick={resetAll}>
            Reset
          </Button>
          <p className="ml-auto text-xs text-neutral-500">
            {query.isFetching && !query.isFetchingNextPage
              ? "Updating…"
              : `${rows.length}${query.hasNextPage ? "+" : ""} results`}
          </p>
        </div>

        {/* advanced range filters */}
        {showAdvanced && (
          <div className="grid gap-2 border-t border-neutral-100 pt-3 sm:grid-cols-2 md:grid-cols-3">
            <label className="space-y-1">
              <span className="text-xs text-neutral-500">Price (QAR)</span>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
                <Input type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-neutral-500">Year</span>
              <div className="flex gap-1">
                <Input type="number" placeholder="From" value={minYear} onChange={(e) => setMinYear(e.target.value)} />
                <Input type="number" placeholder="To" value={maxYear} onChange={(e) => setMaxYear(e.target.value)} />
              </div>
            </label>
            <label className="space-y-1">
              <span className="text-xs text-neutral-500">Mileage (km)</span>
              <div className="flex gap-1">
                <Input type="number" placeholder="Min" value={minKm} onChange={(e) => setMinKm(e.target.value)} />
                <Input type="number" placeholder="Max" value={maxKm} onChange={(e) => setMaxKm(e.target.value)} />
              </div>
            </label>
          </div>
        )}
      </Card>

      {/* top-of-page refetch indicator */}
      {query.isFetching && !query.isFetchingNextPage && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-neutral-100">
          <div className="h-full w-1/3 animate-[shimmer_1s_ease-in-out_infinite] bg-neutral-400" />
        </div>
      )}

      {/* listing cards */}
      {rows.length === 0 && !query.isFetching ? (
        <Card className="py-12 text-center text-sm text-neutral-500">
          No listings match your filters.{" "}
          <button onClick={resetAll} className="underline">Clear filters</button>
        </Card>
      ) : (
        rows.map((listing) => (
          <ListingCard
            key={listing.product_id}
            listing={listing}
            showValuation={entitlements.canSeeValuationOnListings}
            onViewDetails={() =>
              router.push(
                `/listings/${listing.product_id}?ids=${orderedIds}&from=${encodeURIComponent(backUrl)}`
              )
            }
          />
        ))
      )}

      {/* ── Bottomless scroll sentinel ── */}
      <div ref={sentinelRef} className="py-2 text-center">
        {query.isFetchingNextPage && (
          <div className="flex items-center justify-center gap-2 text-sm text-neutral-400">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-600" />
            Loading more…
          </div>
        )}
        {!query.hasNextPage && rows.length > 0 && (
          <p className="text-xs text-neutral-400">All {rows.length} listings loaded</p>
        )}
      </div>
    </div>
  );
}
