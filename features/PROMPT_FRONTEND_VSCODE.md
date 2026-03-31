# 🖥️ FRONTEND MEGA PROMPT — VS Code / Cursor / Windsurf
> Paste this entire prompt into your AI coding assistant (Copilot Chat, Cursor Composer, or Windsurf).
> This prompt ONLY touches frontend code. It never modifies backend files, DB migrations, or API routes.

---

## CONTEXT — WHO YOU ARE & WHAT EXISTS

You are working on **Mzad Premium Cars** — a Next.js car marketplace for the Qatar market deployed on Vercel.

The backend is a separate service (local: `http://localhost:8090/api`, LAN: `http://192.168.1.149:8090/api`).
The API base URL is stored in the env var `NEXT_PUBLIC_API_URL`.

**Do not create any API routes, DB logic, or backend files. Do not modify any existing page or component that already works correctly. Only ADD new components, pages, and hooks alongside what exists.**

---

## STACK ASSUMPTIONS (adjust if your project differs)
- Next.js 14+ (App Router)
- TypeScript
- Tailwind CSS
- Existing auth context exposes: `useAuth()` → `{ user, token, userKey, isGuest }`
- Existing API client at `lib/api.ts` exposes a typed `apiFetch(path, options)` wrapper that injects the bearer token automatically
- Existing `Listing` type matches the swagger `Listing` schema (see TYPE REFERENCE below)

---

## TYPE REFERENCE (from swagger — do not redefine if already exists)

```ts
// types/listing.ts  — only add if file doesn't exist
export interface Listing {
  product_id: string
  title: string
  price_qar: number
  make: string
  class_name: string
  model?: string
  manufacture_year?: number
  km?: number
  warranty_status?: string
  cylinder_count?: number
  seller_name?: string
  seller_phone?: string
  seller_type?: string
  seller_whatsapp?: string
  is_company?: string
  city?: string
  url?: string
  description?: string
  main_image_url?: string
  image_urls_json?: string
  expected_price_qar?: number
  discount_qar?: number
  discount_pct?: number   // negative = below market = good deal
  peer_count?: number
  deal_score?: number
  deal_reason?: string
  deal_last_computed_at?: string
  is_approved?: boolean
  listing_date?: string
}

export interface Alert {
  user_key: string
  make?: string
  class_name?: string
  model?: string
  city?: string
  search_text?: string
  min_year?: number
  max_year?: number
  min_price_qar?: number
  max_price_qar?: number
  min_km?: number
  max_km?: number
  deals_only?: boolean
  min_discount_pct?: number
}

export interface Notification {
  id: number
  user_key: string
  title: string
  body: string
  read: boolean
  created_at: string
  listing?: Listing
}

export interface SummaryStats {
  totalListings: number
  topMakes: { name: string; count: number }[]
  approvalStats: { approved: number; pending: number }
  sourceStats: { source: string; listings: number }[]
  collectionRuns: { id: number; startedAt: string; finishedAt: string; newRows: number }[]
}
```

---

## FEATURE 1 — Deal Heat Badge Component

**File:** `components/DealBadge.tsx`

Build a pill badge component that shows deal quality based on `discount_pct` from the Listing object.

Rules:
- `discount_pct < -15` → label "Hot deal 🔥", color green
- `discount_pct < -5` → label "Good deal", color teal
- `discount_pct` between -5 and +5 → label "Fair price", color gray
- `discount_pct > 5` → label "Overpriced", color amber
- If `discount_pct` is undefined or `peer_count < 3` → label "New listing", color blue, tooltip "Not enough data yet"

Also show the percentage number when available: e.g. "Hot deal · 18% below market"

Use this on any existing listing card that already renders `Listing` data. Import and drop `<DealBadge listing={listing} />` onto the card — do NOT rewrite the card itself.

---

## FEATURE 2 — Price History Sparkline

**File:** `components/PriceSparkline.tsx`

Props: `productId: string`

- On mount, call `GET /listings/{product_id}` and use `listing_date` + `price_qar` as the single current data point
- Additionally call `GET /listings?make=X&class_name=Y&min_year=Z&max_year=Z&limit=50` to get peer prices for context
- Render a tiny 80×30px inline SVG sparkline showing price position among peers
- Show a tooltip on hover: "Listed {N} days ago · QAR {price}"
- If only one data point exists, show "Price stable since listing" text instead of a sparkline
- Keep this component lazy-loaded (use `dynamic(() => import(...), { ssr: false })`)

---

## FEATURE 3 — Price Drop Feed Page

**File:** `app/drops/page.tsx`

A dedicated page at `/drops` showing listings sorted by biggest price discount.

- Call `GET /listings?sort=discount_pct&deals_only=1&limit=100`
- Group results into three sections: "🔥 Hot (>15% below)", "Good (5–15% below)", "Fair (<5%)"
- Each row shows: thumbnail, title, price in QAR, discount badge, km, year, city, WhatsApp CTA button
- WhatsApp CTA: `https://wa.me/{seller_whatsapp}?text=Hi, I saw your car on Mzad Cars...`
- If `seller_whatsapp` is null, fall back to `seller_phone`
- Add a "Refresh" button that re-fetches without a full page reload
- Add this page to the nav as "Price Drops" between "Browse" and "Sell" — edit only the nav component, not any page

---

## FEATURE 4 — Market Pulse Dashboard

**File:** `app/pulse/page.tsx`

A live market intelligence page at `/pulse`.

Sections to build (all data from existing endpoints):

**A. Top-line stats row** — call `GET /summary`
- Total listings count
- Number of approved listings
- Top make by count
- Last collection run time (from `collectionRuns[0].finishedAt`)

**B. Top makes bar chart** — use `summary.topMakes`
- Horizontal bar chart, pure CSS (no chart library needed), sorted descending
- Show make name + count + percentage of total

**C. Deal distribution** — call `GET /listings?limit=1000&deals_only=0`
- Compute client-side: how many are Hot / Good / Fair / Overpriced
- Show as 4 metric cards with counts and percentages

**D. Latest arrivals strip** — call `GET /listings?sort=listing_date&limit=10`
- Horizontal scrolling strip of small listing cards
- Each card: thumbnail, make, price, deal badge

No auth required for this page (public). Add "Market Pulse" to the nav.

---

## FEATURE 5 — Car Value Estimator (wire up the existing broken widget)

The homepage already has a "How much is my car worth?" section that does nothing.

**File:** `components/ValuationWidget.tsx` (replace or fix the existing stub)

- Render a small 3-field form: Make (select from `/listings` response `makes` array), Model (select, filtered by make), Year (number input)
- Add optional KM field
- On submit, call `GET /value-estimate?make=X&class_name=Y&year=Z&km=N`
- Display result as three numbers: Low / Fair / High in QAR
- Show a progress bar positioning the user's input price relative to the band (if called from a listing page, pre-fill the listing's price)
- Show "X listings compared" using peer_count from response
- On error or empty response, show "Not enough data for this model yet"

Wire this into the homepage by replacing the existing broken button with `<ValuationWidget />`.

---

## FEATURE 6 — Watch / Price Alert Setup

**File:** `components/WatchButton.tsx`

A button to add a price alert for a specific listing (or a saved search).

Props: `listing?: Listing` (if passed, pre-fills the alert with make/class/year/price filters)

Behavior:
1. If no `userKey` in auth context → show "Sign up to get alerts" modal with link to `/register`
2. If `userKey` exists → open a slide-up panel with the `AlertCreate` form fields
3. On submit, call `POST /alerts` with body matching `AlertCreate` schema (user_key from auth context)
4. On success, show "Alert saved. We'll notify you on WhatsApp when a match appears."
5. Also call `POST /channels` to upsert the user's WhatsApp number (prompt for it if not yet saved)

Place `<WatchButton listing={listing} />` on the listing detail page — import and add it alongside existing CTAs, do not replace them.

---

## FEATURE 7 — Notification Bell

**File:** `components/NotificationBell.tsx`

A bell icon in the nav bar that shows unread notification count.

- Call `GET /notifications?user_key={userKey}&unread_only=1` on mount and every 60 seconds
- Show red badge with count if > 0
- On click, open a dropdown showing the last 10 notifications from `GET /notifications?user_key={userKey}&limit=10`
- Each notification row: title, body (truncated), time ago, link to listing if available
- On open, call `POST /notifications/mark-read` with all visible ids
- Only show for authenticated users (not guests)
- Add `<NotificationBell />` to the existing nav component next to the Login/Avatar — do not rewrite the nav

---

## FEATURE 8 — Side-by-Side Compare Mode

**File:** `components/CompareBar.tsx` + `app/compare/page.tsx`

**CompareBar** (sticky bar at bottom of listing cards):
- Each listing card gets a "Compare" checkbox
- When 2–3 listings are checked, a sticky bar appears at the bottom of the viewport showing "Compare 2 cars →"
- Store selected IDs in localStorage key `mzad_compare_ids`
- Clicking the bar navigates to `/compare?ids=id1,id2,id3`

**Compare page** (`/compare`):
- Read IDs from query string, fetch each via `GET /listings/{product_id}`
- Render a responsive comparison table: one column per car
- Rows: Photo, Price, Make, Model, Year, KM, City, Warranty, Cylinder count, Deal badge, WhatsApp CTA
- Highlight the best value in each numeric row (lowest price, lowest km) in green
- Mobile: swipe between cars (CSS scroll-snap, no library)

---

## FEATURE 9 — "Spotted in Qatar" Feed

**File:** `app/spotted/page.tsx`

A curated social-style feed of unusual or compelling listings at `/spotted`.

Algorithm (all client-side, no new API needed):
- Call `GET /listings?limit=500&deals_only=0`
- Score each listing: +3 if discount_pct < -10, +2 if km < 20000, +2 if manufacture_year >= 2023, +1 if peer_count >= 5
- Sort by score descending, take top 30
- Render as a Pinterest-style masonry grid (CSS columns: 2 on mobile, 3 on desktop)
- Each card: large photo, title, "Why spotted" reason badge (e.g. "Low KM · Great deal"), price, WhatsApp CTA
- Add a "Share" button per card that copies the listing URL to clipboard
- Add "Spotted in Qatar" to the nav

---

## FEATURE 10 — True Cost of Ownership Calculator

**File:** `components/CostCalculator.tsx`

A collapsible section on the listing detail page showing total cost of ownership.

Inputs (pre-filled from listing, user can adjust):
- Purchase price (from `price_qar`)
- Down payment % (default 20%)
- Loan term in months (default 36)
- Annual interest rate % (default 4.5% — Qatar market average)
- Monthly fuel fill-ups (default 3)
- Fuel price per litre (default 1.85 QAR — Qatar fuel price)
- Fuel consumption L/100km (default based on cylinder_count: 4cyl=8, 6cyl=11, 8cyl=14)

Outputs (computed in JS, no API call):
- Monthly EMI in QAR
- Annual fuel cost in QAR
- Estimated insurance/year (1.5% of price_qar)
- Estimated registration/year (500 QAR flat)
- **5-year total cost of ownership**

Show as a clean breakdown table. Add a "Adjust assumptions" toggle to reveal the input sliders.

Place `<CostCalculator listing={listing} />` at the bottom of the existing listing detail page.

---

## IMPLEMENTATION RULES (follow strictly)

1. **Never delete or rewrite existing working components.** Only add new files or append to existing ones where explicitly instructed.
2. **All new components must be TypeScript with proper prop types.**
3. **Use Tailwind classes only — no new CSS files, no inline style objects.**
4. **All API calls use the existing `apiFetch` wrapper or `fetch` with `NEXT_PUBLIC_API_URL` as the base.**
5. **Handle loading states with a skeleton or spinner. Handle error states with a friendly message — never crash.**
6. **Mobile-first. Every new component must work at 375px width.**
7. **Do not add any new npm packages without asking first. Use what is already installed.**
8. **Each feature is independent. Build and test one at a time. Start with Feature 1 (DealBadge) as it has zero dependencies.**

---

## BUILD ORDER

1. `DealBadge` — no deps, used by everything else
2. `ValuationWidget` — fixes existing broken feature, visible on homepage
3. `Price Drops page` — first new page, shows value immediately
4. `Market Pulse page` — uses `/summary` endpoint
5. `WatchButton` + `NotificationBell` — requires auth context
6. `CompareBar` + Compare page
7. `PriceSparkline` — last, most complex
8. `Spotted feed` + `CostCalculator` — polish layer

---

## START COMMAND

> Begin with Feature 1. Show me `components/DealBadge.tsx` complete and ready to paste.
> Then wait for my confirmation before moving to Feature 2.
